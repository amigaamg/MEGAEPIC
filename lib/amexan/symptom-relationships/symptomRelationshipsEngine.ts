import type { SymptomRelationship, SymptomRelationType, Certainty } from '../encounter-brain/types';

function now(): number {
  return Date.now();
}

function r(sourceId: string, targetId: string, relationType: SymptomRelationType, description: string): SymptomRelationship {
  return {
    sourceId,
    targetId,
    relationType,
    description,
    certainty: 'inferred' as Certainty,
    timestamp: now(),
  };
}

export function createSymptomRelationship(
  sourceId: string,
  targetId: string,
  relationType: SymptomRelationType,
  description: string,
): SymptomRelationship {
  return {
    sourceId,
    targetId,
    relationType,
    description,
    certainty: 'patient_reported' as Certainty,
    timestamp: now(),
  };
}

function getSymptomId(label: string): string {
  return label.toLowerCase().replace(/\s+/g, '_');
}

function symptomLabel(symptomId: string): string {
  return symptomId.replace(/_/g, ' ');
}

const PAIN_SYMPTOM_IDS = new Set([
  'abdominal_pain', 'chest_pain', 'back_pain', 'headache', 'joint_pain',
]);

function isPainSymptom(id: string): boolean {
  return PAIN_SYMPTOM_IDS.has(id);
}

export function detectRelationships(
  answers: Record<string, string | boolean | number>,
  symptoms: Record<string, { present: boolean; attributes?: Record<string, { value: string | boolean | number }> }>,
): SymptomRelationship[] {
  const result: SymptomRelationship[] = [];
  const presentIds = Object.entries(symptoms)
    .filter(([_, s]) => s.present)
    .map(([id]) => id);

  const hasVomiting = presentIds.includes('nausea_vomiting') || presentIds.includes('vomiting');
  const hasNausea = presentIds.includes('nausea');
  const hasPain = presentIds.some(id => isPainSymptom(id));
  const hasDistension = presentIds.includes('distension');
  const hasConstipation = presentIds.includes('constipation');
  const hasFever = presentIds.includes('fever');
  const hasChills = presentIds.includes('chills') || presentIds.includes('fever_chills');
  const hasDiarrhea = presentIds.includes('diarrhea');

  const vomitingTiming = answers['vomiting_timing'];
  const vomitingRelief = answers['vomiting_relief'];
  const distensionPainRelation = answers['distension_pain_relation'];
  const relationToMeals = answers['relation_to_meals'] || answers['timingRelativeToMeals'];
  const stoolRelief = answers['stool_relief'] || answers['relievedByStoolGas'];

  if (hasVomiting && hasPain) {
    const painSymptomId = presentIds.find(id => isPainSymptom(id)) || 'abdominal_pain';

    if (String(vomitingTiming) === 'After the pain began') {
      result.push(r(painSymptomId, 'nausea_vomiting', 'follows',
        `The vomiting began after the ${symptomLabel(painSymptomId)} started.`));
    }

    if (String(vomitingTiming) === 'Before the pain') {
      result.push(r('nausea_vomiting', painSymptomId, 'precedes',
        `The vomiting started before the ${symptomLabel(painSymptomId)}.`));
    }

    if (vomitingRelief === true) {
      result.push(r('nausea_vomiting', painSymptomId, 'relieves',
        `Vomiting relieves the ${symptomLabel(painSymptomId)}.`));
    }
  }

  if (hasDistension && hasConstipation) {
    if (String(distensionPainRelation) === 'Pain started first, then distension') {
      const painSymptomId = presentIds.find(id => isPainSymptom(id)) || 'abdominal_pain';
      result.push(r(painSymptomId, 'distension', 'follows',
        'The abdominal distension developed after the pain started.'));
    }

    if (String(distensionPainRelation) === 'Distension first, then pain') {
      result.push(r('distension', 'abdominal_pain', 'precedes',
        'The distension preceded the abdominal pain.'));
    }

    if (String(distensionPainRelation) === 'Both started together') {
      result.push(r('distension', 'abdominal_pain', 'occurs_with',
        'The distension and pain started at the same time.'));
    }

    result.push(r('constipation', 'distension', 'causes',
      'The abdominal distension developed after the patient became constipated.'));
  }

  if (String(relationToMeals) === 'worse after eating') {
    const painSymptomId = presentIds.find(id => isPainSymptom(id));
    if (painSymptomId) {
      result.push(r('eating', painSymptomId, 'aggravates',
        `The ${symptomLabel(painSymptomId)} is worse after eating.`));
    }
  }

  if (stoolRelief === true) {
    const painSymptomId = presentIds.find(id => isPainSymptom(id));
    if (painSymptomId) {
      result.push(r('defecation', painSymptomId, 'relieves',
        `Passing stool partially relieves the ${symptomLabel(painSymptomId)}.`));
    }
  }

  if (hasNausea && hasVomiting) {
    result.push(r('nausea', 'nausea_vomiting', 'occurs_with',
      'Nausea occurs with vomiting.'));
  }

  if (hasFever && hasChills) {
    result.push(r('fever', 'chills', 'occurs_with',
      'Fever is associated with chills.'));
    result.push(r('fever', 'chills', 'associated',
      'Fever with chills.'));
  }

  return result;
}

export function getRelationshipNarrative(relationships: SymptomRelationship[]): string[] {
  const narratives: string[] = [];

  for (const rel of relationships) {
    const sourceLabel = symptomLabel(rel.sourceId);
    const targetLabel = symptomLabel(rel.targetId);

    switch (rel.relationType) {
      case 'follows':
        narratives.push(`The ${targetLabel} began after the ${sourceLabel} started and does not relieve it.`);
        break;
      case 'precedes':
        narratives.push(`The ${sourceLabel} started before the ${targetLabel}.`);
        break;
      case 'occurs_with':
        narratives.push(`${capitalize(sourceLabel)} occurs with ${targetLabel}.`);
        break;
      case 'causes':
        narratives.push(`The ${targetLabel} developed after the patient became ${sourceLabel}.`);
        break;
      case 'aggravates':
        narratives.push(`${capitalize(sourceLabel)} aggravates the ${targetLabel}.`);
        break;
      case 'relieves':
        narratives.push(`${capitalize(sourceLabel)} partially relieves the ${targetLabel}.`);
        break;
      case 'associated':
        narratives.push(`${capitalize(sourceLabel)} is associated with ${targetLabel}.`);
        break;
      default:
        narratives.push(rel.description);
    }
  }

  return narratives;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function getRelationshipGaps(
  answers: Record<string, string | boolean | number | undefined>,
  symptoms: Record<string, { present: boolean }>,
): string[] {
  const gaps: string[] = [];
  const presentIds = Object.entries(symptoms)
    .filter(([_, s]) => s.present)
    .map(([id]) => id);

  const hasVomiting = presentIds.includes('nausea_vomiting') || presentIds.includes('vomiting');
  const hasPain = presentIds.some(id => isPainSymptom(id));
  const hasDistension = presentIds.includes('distension');
  const hasConstipation = presentIds.includes('constipation');
  const hasDiarrhea = presentIds.includes('diarrhea');

  if (hasVomiting && hasPain) {
    if (answers['vomiting_timing'] === undefined) {
      gaps.push('vomiting_timing');
    }
    if (answers['vomiting_relief'] === undefined) {
      gaps.push('vomiting_relief');
    }
  }

  if (hasDistension && hasConstipation) {
    if (answers['distension_pain_relation'] === undefined) {
      gaps.push('distension_pain_relation');
    }
  }

  if (hasPain) {
    if (answers['pain_worsening_factors'] === undefined) {
      gaps.push('pain_worsening_factors');
    }
    if (answers['pain_relieving_factors'] === undefined) {
      gaps.push('pain_relieving_factors');
    }
  }

  if (hasDiarrhea) {
    if (answers['relation_to_food'] === undefined && answers['diarrhoea_relation_to_food'] === undefined) {
      gaps.push('relation_to_food');
    }
  }

  return gaps;
}

export interface CausalGraph {
  [sourceId: string]: { targetId: string; relationType: SymptomRelationType; description: string }[];
}

export function buildCausalGraph(relationships: SymptomRelationship[]): CausalGraph {
  const graph: CausalGraph = {};

  const causalTypes = new Set<SymptomRelationType>(['precedes', 'causes', 'aggravates']);

  for (const rel of relationships) {
    if (!causalTypes.has(rel.relationType) && rel.relationType !== 'relieves') {
      continue;
    }

    if (!graph[rel.sourceId]) {
      graph[rel.sourceId] = [];
    }

    graph[rel.sourceId].push({
      targetId: rel.targetId,
      relationType: rel.relationType,
      description: rel.description,
    });
  }

  return graph;
}
