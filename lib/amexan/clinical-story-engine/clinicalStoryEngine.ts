// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Clinical Story Engine — Story completeness assessment & summary
// ═══════════════════════════════════════════════════════════════════════════════
// Continuously assesses whether the system can already tell the patient's story.
// If not, identifies what part of the story is missing.
// ═══════════════════════════════════════════════════════════════════════════════

import type {
  EncounterBrainState,
  ClinicalStory,
  StoryNode,
  StoryStatus,
  SymptomObject,
} from '../encounter-brain/types';

// ── Section definitions ────────────────────────────────────────────────────

interface SectionDef {
  id: StoryNode['type'];
  label: string;
  required: boolean;
}

const SECTIONS: SectionDef[] = [
  { id: 'context', label: 'Patient Context', required: true },
  { id: 'onset', label: 'Symptom Onset', required: true },
  { id: 'evolution', label: 'Disease Evolution', required: true },
  { id: 'symptom', label: 'Primary Symptom Characterization', required: true },
  { id: 'health_seeking', label: 'Health Seeking Journey', required: false },
  { id: 'risk_factor', label: 'Risk Factors', required: true },
  { id: 'functional_impact', label: 'Functional Impact', required: true },
  { id: 'negatives', label: 'Important Negatives', required: true },
  { id: 'summary', label: 'Story Summary', required: true },
];

const PRIMARY_SYMPTOM_FEATURES: Record<string, string[]> = {
  location: ['pain_initial_location', 'pain_location_now', 'pain_migration'],
  character: ['pain_character'],
  severity: ['pain_severity'],
  radiation: ['pain_radiation'],
  aggravating: ['pain_worsening_factors'],
  relieving: ['pain_relieving_factors'],
  temporal: ['pain_temporal_pattern'],
  duration: ['pain_duration_hours', 'pain_duration_days'],
};

const ONSET_FEATURES = ['pain_onset', 'pain_onset_sudden', 'symptom_onset_date'] as const;
const EVOLUTION_FEATURES = ['progression', 'symptom_change', 'pain_temporal_pattern'] as const;
const RISK_FACTOR_FEATURES = [
  'prior_abdominal_surgery', 'nsaid_use', 'smoking', 'alcohol_use',
  'known_gallstones', 'previous_similar_episodes', 'anticoagulant_use',
  'family_history_gi_cancer', 'steroid_use', 'recent_travel',
  'diabetes', 'htn_cad', 'hiv_status', 'ivdu', 'known_cancer',
] as const;
const FUNCTIONAL_IMPACT_FEATURES = ['functional_impact', 'impact_daily_activity', 'impact_sleep', 'impact_work', 'impact_self_care'] as const;
const NEGATIVES_FEATURES = [
  'fever', 'nausea', 'vomiting', 'diarrhea', 'constipation',
  'dysuria', 'hematochezia', 'melena', 'hematemesis', 'jaundice',
] as const;

// ── Helpers ─────────────────────────────────────────────────────────────────

function hasChiefComplaint(state: EncounterBrainState): boolean {
  return !!state.primarySymptomId;
}

function hasPatientAge(state: EncounterBrainState): boolean {
  return state.patient.ageYears > 0 || state.patient.ageMonths > 0 || !!state.patient.ageCategory;
}

function getPrimarySymptom(state: EncounterBrainState): SymptomObject | null {
  if (!state.primarySymptomId) return null;
  return state.symptoms[state.primarySymptomId] ?? null;
}

function hasFeatureInSymptom(symptom: SymptomObject, featureId: string): boolean {
  return Object.values(symptom.attributes).some(a => a.featureId === featureId);
}

function hasAnyFeatureInSymptom(symptom: SymptomObject, featureIds: readonly string[]): boolean {
  return featureIds.some(fid => hasFeatureInSymptom(symptom, fid));
}

function getAnsweredFeatureIds(state: EncounterBrainState): Set<string> {
  const ids = new Set<string>();
  for (const symptom of Object.values(state.symptoms)) {
    for (const attr of Object.values(symptom.attributes)) {
      ids.add(attr.featureId);
    }
  }
  for (const cd of Object.values(state.chronicDiseases)) {
    ids.add(`chronic_${cd.diseaseId}`);
  }
  if (state.healthSeekingJourney) {
    ids.add('health_seeking_journey');
  }
  if (state.functionalStatus) {
    ids.add('functional_status');
    if (state.functionalStatus.workImpact) ids.add('functional_impact');
    if (state.functionalStatus.dailyActivities.length > 0) ids.add('impact_daily_activity');
  }
  if (state.encounter.referralStatus) ids.add('referral_status');
  if (state.encounter.isPostoperative !== undefined) ids.add('postoperative_state');
  if (state.postOperativeState) ids.add('postoperative_details');
  return ids;
}

// ── Section assessors ───────────────────────────────────────────────────────

function assessContextSection(state: EncounterBrainState): StoryNode {
  const missing: string[] = [];

  if (!hasPatientAge(state)) missing.push('patient_age');
  if (!state.patient.sex) missing.push('patient_sex');
  if (Object.keys(state.chronicDiseases).length === 0) missing.push('chronic_disease_info');
  if (!state.encounter.referralStatus) missing.push('referral_status');
  if (state.encounter.isPostoperative && !state.postOperativeState) missing.push('postoperative_state');

  const content = buildContextContent(state);
  const complete = missing.length === 0;

  return {
    id: 'context',
    type: 'context',
    label: 'Patient Context',
    content,
    complete,
    missing,
    children: [],
  };
}

function assessOnsetSection(state: EncounterBrainState): StoryNode {
  const missing: string[] = [];
  const primary = getPrimarySymptom(state);

  const hasOnsetEvent = state.timeline.some(e => e.eventType === 'symptom_onset');
  const hasSymptomOnset = primary?.onset != null;

  if (!hasOnsetEvent && !hasSymptomOnset) missing.push('symptom_onset_date');

  if (primary) {
    if (!hasAnyFeatureInSymptom(primary, ONSET_FEATURES)) {
      missing.push('pain_onset');
    }
  } else {
    missing.push('pain_onset');
  }

  const content = buildOnsetContent(state);
  const complete = missing.length === 0;

  return {
    id: 'onset',
    type: 'onset',
    label: 'Symptom Onset',
    content,
    complete,
    missing,
    children: [],
  };
}

function assessEvolutionSection(state: EncounterBrainState): StoryNode {
  const missing: string[] = [];
  const primary = getPrimarySymptom(state);

  const hasChangeEvents = state.timeline.some(e => e.eventType === 'symptom_change');
  const hasProgressionAttr = primary && hasAnyFeatureInSymptom(primary, EVOLUTION_FEATURES);
  const hasRelationships = state.symptomRelationships.length > 0;

  if (!hasChangeEvents && !hasProgressionAttr && !hasRelationships) {
    missing.push('progression');
  }

  const content = buildEvolutionContent(state);
  const complete = missing.length === 0;

  return {
    id: 'evolution',
    type: 'evolution',
    label: 'Disease Evolution',
    content,
    complete,
    missing,
    children: [],
  };
}

function assessSymptomSection(state: EncounterBrainState): StoryNode {
  const missing: string[] = [];
  const primary = getPrimarySymptom(state);

  if (!primary) {
    missing.push('primary_symptom');
  } else {
    if (!hasAnyFeatureInSymptom(primary, PRIMARY_SYMPTOM_FEATURES.location)) missing.push('pain_initial_location');
    if (!hasAnyFeatureInSymptom(primary, PRIMARY_SYMPTOM_FEATURES.character)) missing.push('pain_character');
    if (!hasAnyFeatureInSymptom(primary, PRIMARY_SYMPTOM_FEATURES.severity)) missing.push('pain_severity');
    if (!hasAnyFeatureInSymptom(primary, PRIMARY_SYMPTOM_FEATURES.duration)) missing.push('pain_duration_hours');
    if (!hasAnyFeatureInSymptom(primary, PRIMARY_SYMPTOM_FEATURES.radiation)) missing.push('pain_radiation');
  }

  const content = buildSymptomContent(state);
  const complete = missing.length === 0;

  return {
    id: 'symptom',
    type: 'symptom',
    label: 'Primary Symptom Characterization',
    content,
    complete,
    missing,
    children: [],
  };
}

function assessHealthSeekingSection(state: EncounterBrainState): StoryNode {
  const missing: string[] = [];
  const hsj = state.healthSeekingJourney;

  if (!hsj || hsj.steps.length === 0) {
    missing.push('health_seeking_journey');
  }

  const content = buildHealthSeekingContent(state);
  const complete = missing.length === 0;

  return {
    id: 'health_seeking',
    type: 'health_seeking',
    label: 'Health Seeking Journey',
    content,
    complete,
    missing,
    children: [],
  };
}

function assessRiskFactorSection(state: EncounterBrainState): StoryNode {
  const missing: string[] = [];
  const answeredIds = getAnsweredFeatureIds(state);

  const presentRiskFactors = RISK_FACTOR_FEATURES.filter(f => answeredIds.has(f));
  if (presentRiskFactors.length === 0) {
    missing.push('risk_factor_info');
  }

  const content = buildRiskFactorContent(state);
  const complete = missing.length === 0;

  return {
    id: 'risk_factor',
    type: 'risk_factor',
    label: 'Risk Factors',
    content,
    complete,
    missing,
    children: [],
  };
}

function assessFunctionalImpactSection(state: EncounterBrainState): StoryNode {
  const missing: string[] = [];
  const fs = state.functionalStatus;

  if (!fs) {
    missing.push('functional_status');
  } else {
    if (!fs.workImpact && fs.dailyActivities.length === 0 && !fs.overallImpact) {
      missing.push('functional_impact');
    }
  }

  const content = buildFunctionalImpactContent(state);
  const complete = missing.length === 0;

  return {
    id: 'functional_impact',
    type: 'functional_impact',
    label: 'Functional Impact',
    content,
    complete,
    missing,
    children: [],
  };
}

function assessNegativesSection(state: EncounterBrainState): StoryNode {
  const missing: string[] = [];
  const answeredIds = getAnsweredFeatureIds(state);

  const askedNegatives = NEGATIVES_FEATURES.filter(f => answeredIds.has(f));
  if (askedNegatives.length < 3) {
    missing.push('important_negatives');
  }

  const content = buildNegativesContent(state);
  const complete = missing.length >= 3;

  return {
    id: 'negatives',
    type: 'negatives',
    label: 'Important Negatives',
    content,
    complete,
    missing,
    children: [],
  };
}

function assessSummarySection(nodes: StoryNode[]): StoryNode {
  const otherSections = nodes.filter(n => n.id !== 'summary');
  const allComplete = otherSections.every(n => n.complete);
  const majorComplete = nodes.filter(n => ['onset', 'symptom', 'context'].includes(n.id)).every(n => n.complete);
  const missing: string[] = [];

  if (!allComplete) {
    missing.push('story_summary');
  }

  const content = allComplete
    ? 'All sections complete. Summary can be generated.'
    : 'Not all sections complete. Summary pending.';

  return {
    id: 'summary',
    type: 'summary',
    label: 'Story Summary',
    content,
    complete: allComplete,
    missing,
    children: [],
  };
}

// ── Content builders ────────────────────────────────────────────────────────

function buildContextContent(state: EncounterBrainState): string {
  const parts: string[] = [];
  const p = state.patient;
  const e = state.encounter;

  if (p.ageYears || p.ageMonths) {
    const ageStr = p.ageMonths < 12
      ? `${p.ageMonths}-month-old`
      : `${Math.floor(p.ageYears + p.ageMonths / 12)}-year-old`;
    parts.push(`${ageStr} ${p.sex || 'patient'}`);
  }
  if (Object.keys(state.chronicDiseases).length > 0) {
    const names = Object.values(state.chronicDiseases).map(cd => cd.diseaseName).join(', ');
    parts.push(`with ${names}`);
  }
  if (e.referralStatus && e.referralStatus !== 'self') {
    parts.push(`${e.referralStatus} patient`);
  }
  if (e.isPostoperative && state.postOperativeState) {
    parts.push(`post-operative day ${state.postOperativeState.postOpDay} after ${state.postOperativeState.operationPerformed}`);
  }

  return parts.length > 0 ? parts.join(', ') + '.' : 'Context not yet available.';
}

function buildOnsetContent(state: EncounterBrainState): string {
  const parts: string[] = [];
  const onsetEvent = state.timeline.find(e => e.eventType === 'symptom_onset');
  const primary = getPrimarySymptom(state);

  if (onsetEvent) {
    parts.push(`Symptoms began ${onsetEvent.date}`);
  } else if (primary?.onset) {
    parts.push(`Symptoms began ${primary.onset.date}`);
  }

  if (primary) {
    const onsetAttr = Object.values(primary.attributes).find(a => a.featureId === 'pain_onset');
    if (onsetAttr) parts.push(`with ${onsetAttr.value} onset`);
    const suddenAttr = Object.values(primary.attributes).find(a => a.featureId === 'pain_onset_sudden');
    if (suddenAttr) parts.push(suddenAttr.value === true ? 'sudden onset' : 'gradual onset');
  }

  return parts.length > 0 ? parts.join(', ') + '.' : 'Onset not yet characterized.';
}

function buildEvolutionContent(state: EncounterBrainState): string {
  const parts: string[] = [];
  const changeEvents = state.timeline.filter(e => e.eventType === 'symptom_change');

  for (const event of changeEvents) {
    parts.push(`${event.description} (${event.date})`);
  }

  if (parts.length === 0) {
    const primary = getPrimarySymptom(state);
    if (primary) {
      const progressionAttr = Object.values(primary.attributes).find(a => a.featureId === 'pain_temporal_pattern');
      if (progressionAttr) parts.push(`Pattern: ${progressionAttr.value}`);
    }
  }

  return parts.length > 0 ? parts.join('; ') + '.' : 'Evolution not yet characterized.';
}

function buildSymptomContent(state: EncounterBrainState): string {
  const primary = getPrimarySymptom(state);
  if (!primary) return 'Primary symptom not yet identified.';

  const parts: string[] = [primary.label];

  for (const attr of Object.values(primary.attributes)) {
    if (['pain_initial_location', 'pain_location_now'].includes(attr.featureId)) {
      parts.push(`located in ${attr.value}`);
    } else if (attr.featureId === 'pain_character') {
      parts.push(`described as ${attr.value}`);
    } else if (attr.featureId === 'pain_severity') {
      parts.push(`severity ${attr.value}/10`);
    } else if (attr.featureId === 'pain_radiation') {
      if (attr.value !== 'No radiation') parts.push(`radiating: ${attr.value}`);
    }
  }

  return parts.join(', ') + '.';
}

function buildHealthSeekingContent(state: EncounterBrainState): string {
  const hsj = state.healthSeekingJourney;
  if (!hsj || hsj.steps.length === 0) return 'Health seeking journey not yet recorded.';

  const parts: string[] = [];
  for (const step of hsj.steps) {
    const detail = step.facilityName
      ? `${step.actionType} at ${step.facilityName}`
      : `${step.actionType}`;
    parts.push(detail + (step.response ? ` (${step.response})` : ''));
  }

  const prefix = `Patient sought care through ${hsj.steps.length} step(s)`;
  return `${prefix}: ${parts.join('; ')}.`;
}

function buildRiskFactorContent(state: EncounterBrainState): string {
  const parts: string[] = [];
  const answeredIds = getAnsweredFeatureIds(state);

  for (const rfId of RISK_FACTOR_FEATURES) {
    if (answeredIds.has(rfId)) {
      const rfName = rfId.replace(/_/g, ' ');
      parts.push(rfName);
    }
  }

  if (Object.keys(state.chronicDiseases).length > 0) {
    for (const cd of Object.values(state.chronicDiseases)) {
      parts.push(`known ${cd.diseaseName}`);
    }
  }

  return parts.length > 0
    ? `Risk factors identified: ${parts.join(', ')}.`
    : 'Risk factors not yet assessed.';
}

function buildFunctionalImpactContent(state: EncounterBrainState): string {
  const fs = state.functionalStatus;
  if (!fs) return 'Functional impact not yet assessed.';

  const parts: string[] = [];
  if (fs.workImpact) parts.push(fs.workImpact);
  if (fs.overallImpact) parts.push(`Overall impact: ${fs.overallImpact}`);
  if (fs.dailyActivities.length > 0) {
    for (const adl of fs.dailyActivities) {
      if (adl.independence !== 'unknown') {
        parts.push(`${adl.domain}: ${adl.independence}`);
      }
    }
  }

  return parts.length > 0
    ? parts.join(', ') + '.'
    : 'Functional impact assessed but details not yet available.';
}

function buildNegativesContent(state: EncounterBrainState): string {
  const negatives: string[] = [];
  const answeredIds = getAnsweredFeatureIds(state);

  for (const featId of NEGATIVES_FEATURES) {
    if (answeredIds.has(featId)) {
      const primary = getPrimarySymptom(state);
      if (primary) {
        const attr = Object.values(primary.attributes).find(a => a.featureId === featId);
        if (attr && attr.polarity === 'absent') {
          negatives.push(featId.replace(/_/g, ' '));
        }
      }
    }
  }

  return negatives.length > 0
    ? `Denies ${negatives.join(', ')}.`
    : 'Negatives not yet systematically assessed.';
}

function buildStorySummary(nodes: StoryNode[]): string {
  const completeNodes = nodes.filter(n => n.complete && n.id !== 'summary');
  if (completeNodes.length === 0) return 'Insufficient data to generate a story summary.';

  const parts: string[] = [];

  const contextNode = nodes.find(n => n.id === 'context');
  if (contextNode?.complete && contextNode.content) {
    parts.push(contextNode.content);
  }

  const onsetNode = nodes.find(n => n.id === 'onset');
  if (onsetNode?.complete && onsetNode.content) {
    parts.push(onsetNode.content);
  }

  const evolutionNode = nodes.find(n => n.id === 'evolution');
  if (evolutionNode?.complete && evolutionNode.content) {
    parts.push(evolutionNode.content);
  }

  const symptomNode = nodes.find(n => n.id === 'symptom');
  if (symptomNode?.complete && symptomNode.content) {
    parts.push(symptomNode.content);
  }

  const healthNode = nodes.find(n => n.id === 'health_seeking');
  if (healthNode?.complete && healthNode.content) {
    parts.push(healthNode.content);
  }

  const functionalNode = nodes.find(n => n.id === 'functional_impact');
  if (functionalNode?.complete && functionalNode.content) {
    parts.push(functionalNode.content);
  }

  const negativesNode = nodes.find(n => n.id === 'negatives');
  if (negativesNode?.complete && negativesNode.content) {
    parts.push(negativesNode.content);
  }

  return parts.join(' ');
}

function determineStatus(
  contextComplete: boolean,
  onsetComplete: boolean,
  symptomComplete: boolean,
  allMajorComplete: boolean,
  allComplete: boolean,
  completenessScore: number,
): StoryStatus {
  if (!contextComplete) return 'needs_context';
  if (!onsetComplete || !symptomComplete) return 'story_beginning';

  if (allComplete) {
    if (completenessScore >= 0.95) return 'story_review';
    return 'story_ready';
  }

  if (allMajorComplete) return 'story_ready';

  return 'story_middle';
}

// ── Public API ──────────────────────────────────────────────────────────────

export function assessStory(state: EncounterBrainState): ClinicalStory {
  if (!hasChiefComplaint(state) || !hasPatientAge(state)) {
    return {
      status: 'cannot_start',
      nodes: [],
      missingSections: SECTIONS.map(s => s.id),
      completenessScore: 0,
      canGenerate: false,
      storySummary: '',
    };
  }

  const nodes: StoryNode[] = [
    assessContextSection(state),
    assessOnsetSection(state),
    assessEvolutionSection(state),
    assessSymptomSection(state),
    assessHealthSeekingSection(state),
    assessRiskFactorSection(state),
    assessFunctionalImpactSection(state),
    assessNegativesSection(state),
  ];

  nodes.push(assessSummarySection(nodes));

  const totalSections = nodes.length;
  const completedSections = nodes.filter(n => n.complete).length;
  const completenessScore = completedSections / totalSections;

  const majorSections = ['context', 'onset', 'symptom', 'evolution', 'negatives'] as const;
  const allMajorComplete = majorSections.every(id => {
    const node = nodes.find(n => n.id === id);
    return node?.complete ?? false;
  });
  const allComplete = nodes.every(n => n.complete);

  const contextNode = nodes.find(n => n.id === 'context');
  const onsetNode = nodes.find(n => n.id === 'onset');
  const symptomNode = nodes.find(n => n.id === 'symptom');

  const status: StoryStatus = determineStatus(
    contextNode?.complete ?? false,
    onsetNode?.complete ?? false,
    symptomNode?.complete ?? false,
    allMajorComplete,
    allComplete,
    completenessScore,
  );

  const missingSections = nodes
    .filter(n => !n.complete)
    .map(n => n.id);

  const storySummary = buildStorySummary(nodes);
  const canGenerate = canGenerateNarrative({
    status,
    nodes,
    missingSections,
    completenessScore,
    canGenerate: false,
    storySummary,
  });

  return {
    status,
    nodes,
    missingSections,
    completenessScore,
    canGenerate,
    storySummary,
  };
}

export function generateStorySummary(story: ClinicalStory): string {
  return buildStorySummary(story.nodes);
}

export function getMissingCriticalSections(story: ClinicalStory): string[] {
  const priority = ['onset', 'symptom', 'context', 'evolution', 'negatives', 'health_seeking', 'risk_factor', 'functional_impact', 'summary'];
  const missing = story.nodes
    .filter(n => !n.complete)
    .sort((a, b) => priority.indexOf(a.id) - priority.indexOf(b.id))
    .map(n => n.id);
  return missing;
}

export function canGenerateNarrative(story: ClinicalStory): boolean {
  const onsetComplete = story.nodes.find(n => n.id === 'onset')?.complete ?? false;
  const symptomComplete = story.nodes.find(n => n.id === 'symptom')?.complete ?? false;
  return story.completenessScore > 0.6 && onsetComplete && symptomComplete;
}
