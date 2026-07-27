import type { ClinicalContext } from '@/lib/clinical/constitutional/registration-engine/types';
import { CONSTITUTION_FIELDS } from '@/lib/clinical/constitutional/clinical-constitution';
import { QUESTION_GROUPS_CATALOG, getQuestionCatalog } from './question-catalog';
import type {
  QuestionCardVisibility,
  QuestionGroupVisibility,
  VisibilityCriterion,
  VisibilityResult,
  VisibilityEvaluation,
  CascadeRule,
} from './types';

type FieldAnswers = Record<string, unknown>;

function getFieldValue(ctx: ClinicalContext | FieldAnswers, field: string): unknown {
  if ('demographic' in ctx && 'encounter' in ctx) {
    const c = ctx as unknown as Record<string, Record<string, unknown>>;
    if (c.demographic && field in c.demographic) return c.demographic[field];
    if (c.encounter && field in c.encounter) return c.encounter[field];
    if (c.workflow && field in c.workflow) return c.workflow[field];
    return undefined;
  }
  return (ctx as FieldAnswers)[field];
}

function evaluateCriterion(
  criterion: VisibilityCriterion,
  ctx: ClinicalContext,
  complaints: string[],
  activeModules: string[],
  answers: FieldAnswers,
  diagnoses: string[],
): boolean {
  const p = criterion.params || {};
  const ageGroup = ctx.demographic?.ageGroup;
  const ageMonths = ctx.demographic?.chronologicalAgeMonths ?? 0;
  const encounter = ctx.encounter;

  switch (criterion.type) {
    case 'always': return true;
    case 'never': return false;

    case 'age_group':
      return (p.values as string[]).includes(ageGroup || '');

    case 'age_min_months':
      return ageMonths >= (p.months as number);

    case 'age_max_months':
      return ageMonths <= (p.months as number);

    case 'sex': {
      const sex = ctx.demographic?.sex?.value ?? '';
      return (p.values as string[]).includes(sex);
    }

    case 'reproductive_stage': {
      const stage = ctx.demographic?.reproductiveStage || '';
      return (p.values as string[]).includes(stage);
    }

    case 'encounter_type':
      return (p.values as string[]).includes(encounter?.encounterType || '');

    case 'department':
      return (p.values as string[]).includes(encounter?.department || '');

    case 'mode_of_arrival':
      return (p.values as string[]).includes(encounter?.modeOfArrival || '');

    case 'triage_category':
      return (p.values as string[]).includes(encounter?.triageCategory || '');

    case 'module_active':
      return activeModules.includes(p.module as string);

    case 'module_inactive':
      return !activeModules.includes(p.module as string);

    case 'is_emergency':
      return encounter?.encounterType === 'emergency';

    case 'is_inpatient':
      return encounter?.encounterType === 'admission';

    case 'is_ward_round':
      return encounter?.encounterType === 'ward_round';

    case 'is_neonatal':
      return ageGroup === 'preterm_neonate' || ageGroup === 'term_neonate';

    case 'is_pediatric':
      return ['preterm_neonate', 'term_neonate', 'infant', 'toddler', 'preschool', 'school_age', 'adolescent'].includes(ageGroup || '');

    case 'is_geriatric':
      return ageGroup === 'older_adult';

    case 'is_pregnant':
      return ctx.demographic?.reproductiveStage === 'pregnant';

    case 'is_postpartum':
      return ctx.demographic?.reproductiveStage === 'postpartum';

    case 'is_psychiatric':
      return encounter?.department === 'psychiatry';

    case 'is_surgical':
      return ['surgical', 'orthopaedic', 'neurosurgery', 'cardiothoracic', 'urology'].includes(encounter?.department || '');

    case 'is_trauma':
      return complaints.some(c => c.toLowerCase().includes('trauma') || c.toLowerCase().includes('injury') || c.toLowerCase().includes('fall') || c.toLowerCase().includes('accident'));

    case 'field_equals':
      return getFieldValue(answers, p.field as string) === p.value;

    case 'field_not_equals':
      return getFieldValue(answers, p.field as string) !== p.value;

    case 'field_not_empty': {
      const v = getFieldValue(answers, p.field as string);
      return v !== undefined && v !== null && v !== '' && v !== false;
    }

    case 'field_in': {
      const v = getFieldValue(answers, p.field as string);
      return (p.values as unknown[]).includes(v);
    }

    case 'field_not_in': {
      const v = getFieldValue(answers, p.field as string);
      return !(p.values as unknown[]).includes(v);
    }

    case 'complaint_contains':
      return complaints.some(c => c.toLowerCase().includes((p.keyword as string).toLowerCase()));

    case 'complaint_in':
      return complaints.some(c => (p.values as string[]).map(v => v.toLowerCase()).includes(c.toLowerCase()));

    case 'diagnosis_present':
      return diagnoses.some(d => d.toLowerCase().includes((p.keyword as string).toLowerCase()));

    case 'diagnosis_not_present':
      return !diagnoses.some(d => d.toLowerCase().includes((p.keyword as string).toLowerCase()));

    case 'module_any': {
      const mods = p.modules as string[];
      return mods.some(m => activeModules.includes(m));
    }

    case 'module_all': {
      const mods = p.modules as string[];
      return mods.every(m => activeModules.includes(m));
    }

    default:
      return false;
  }
}

function evaluateVisibilityCriteria(
  criteria: VisibilityCriterion[],
  ctx: ClinicalContext,
  complaints: string[],
  activeModules: string[],
  answers: FieldAnswers,
  diagnoses: string[],
): boolean {
  if (criteria.length === 0) return true;
  if (criteria.length === 1 && criteria[0].type === 'always') return true;
  if (criteria.length === 1 && criteria[0].type === 'never') return false;
  return criteria.every(c => evaluateCriterion(c, ctx, complaints, activeModules, answers, diagnoses));
}

function getActiveCascades(
  cascades: CascadeRule[],
  answers: FieldAnswers,
): CascadeRule[] {
  return cascades.filter(c => {
    const val = getFieldValue(answers, c.trigger.field);
    if (typeof c.trigger.value === 'number') {
      return typeof val === 'number' && val >= c.trigger.value;
    }
    if (typeof c.trigger.value === 'string') {
      return String(val) === c.trigger.value;
    }
    return val === c.trigger.value;
  });
}

export function evaluateCardVisibility(
  card: QuestionCardVisibility,
  ctx: ClinicalContext,
  complaints: string[],
  activeModules: string[],
  answers: FieldAnswers,
  diagnoses: string[],
): { visible: boolean; required: boolean } {
  let visible = evaluateVisibilityCriteria(card.visibility, ctx, complaints, activeModules, answers, diagnoses);
  if (visible && card.hideWhen.length > 0) {
    visible = !evaluateVisibilityCriteria(card.hideWhen, ctx, complaints, activeModules, answers, diagnoses);
  }
  const required = evaluateVisibilityCriteria(card.required, ctx, complaints, activeModules, answers, diagnoses);
  return { visible, required };
}

export function evaluateVisibility(
  input: {
    context: ClinicalContext;
    complaints: string[];
    answeredFields: FieldAnswers;
    activeModules: string[];
    diagnoses: string[];
  },
  catalog?: QuestionGroupVisibility[],
): VisibilityResult {
  const { context, complaints, answeredFields, activeModules, diagnoses } = input;
  const groups = catalog || getQuestionCatalog();

  const visibleCards: QuestionCardVisibility[] = [];
  const invisibleCards: QuestionCardVisibility[] = [];
  const evaluations: VisibilityEvaluation[] = [];
  const allActiveCascades: CascadeRule[] = [];

  for (const group of groups) {
    const groupVisible = evaluateVisibilityCriteria(
      group.visibility, context, complaints, activeModules, answeredFields, diagnoses,
    );

    for (const card of group.cards) {
      const { visible, required } = evaluateCardVisibility(
        card, context, complaints, activeModules, answeredFields, diagnoses,
      );
      const cardVisible = groupVisible && visible;

      const cardCascades = getActiveCascades(card.cascades ?? [], answeredFields);
      allActiveCascades.push(...cardCascades);

      const evalEntry: VisibilityEvaluation = {
        fieldId: card.fieldId,
        visible: cardVisible,
        reason: cardVisible ? 'visible' : 'hidden_by_visibility_rules',
        priority: card.priority,
        priorityScore: card.priorityScore,
        required: cardVisible && required,
      };
      evaluations.push(evalEntry);

      if (cardVisible) {
        visibleCards.push(card);
      } else {
        invisibleCards.push(card);
      }
    }
  }

  const constitutionFields = Object.values(CONSTITUTION_FIELDS);
  for (const field of constitutionFields) {
    if (field.encounterCascade) {
      for (const cascade of field.encounterCascade) {
        const triggered = cascade.triggers.some(t => {
          const val = getFieldValue(answeredFields, t.field);
          return val === t.value;
        });
        if (triggered) {
          for (const sectionToShow of cascade.showSections) {
            const hiddenCards = invisibleCards.filter(c => c.section === sectionToShow);
            for (const hc of hiddenCards) {
              visibleCards.push(hc);
              const ev = evaluations.find(e => e.fieldId === hc.fieldId);
              if (ev) {
                ev.visible = true;
                ev.reason = `visible_via_constitution_cascade[${field.id}:${cascade.triggers.map(t => `${t.field}=${t.value}`).join(',')}]`;
              }
            }
          }
          for (const sectionToHide of cascade.hideSections) {
            const shownCards = visibleCards.filter(c => c.section === sectionToHide);
            for (const sc of shownCards) {
              const idx = visibleCards.indexOf(sc);
              if (idx >= 0) visibleCards.splice(idx, 1);
              invisibleCards.push(sc);
              const ev = evaluations.find(e => e.fieldId === sc.fieldId);
              if (ev) {
                ev.visible = false;
                ev.reason = `hidden_via_constitution_cascade[${field.id}:${cascade.triggers.map(t => `${t.field}=${t.value}`).join(',')}]`;
              }
            }
          }
          for (const reqField of cascade.makeRequired) {
            const evalEntry = evaluations.find(e => e.fieldId === reqField);
            if (evalEntry) evalEntry.required = true;
          }
        }
      }
    }
  }

  visibleCards.sort((a, b) => {
    if (a.priorityScore !== b.priorityScore) return b.priorityScore - a.priorityScore;
    return a.order - b.order;
  });

  const priorityOrder = [...new Set(visibleCards.map(c => c.priority))];

  return {
    visibleCards,
    invisibleCards,
    evaluations,
    activeCascades: allActiveCascades,
    priorityOrder,
  };
}

export { QUESTION_GROUPS_CATALOG, getQuestionCatalog };
