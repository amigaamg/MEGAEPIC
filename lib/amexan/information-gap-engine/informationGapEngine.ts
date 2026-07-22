import type {
  InformationGap,
  EncounterBrainState,
  DiseaseState,
  TimelineEvent,
  QuestionGroup,
  ClinicalStory,
} from '../encounter-brain/types';
import type { DiseaseNode } from '../knowbase/diseaseNode';
import { FEATURES, getLrPlus } from '../knowbase/features/featureLibrary';

const MANAGEMENT_FEATURES: readonly string[] = [
  'prior_abdominal_surgery', 'pregnancy_status', 'pregnancy_gestational_age',
  'anticoagulant_use', 'steroid_use', 'nsaid_use', 'diabetes', 'htn_cad',
  'hiv_status', 'known_cancer', 'chemotherapy_exposure',
  'drug_allergies', 'medication_list', 'ivdu',
  'alcohol_use', 'smoking',
];

const FUNCTIONAL_IMPACT_FEATURES: readonly string[] = [
  'weight_loss', 'fatigue', 'night_sweats',
  'functional_impact', 'impact_daily_activity', 'impact_sleep', 'impact_work',
  'caregiver_available',
];

const DOCUMENTATION_DOMAIN_FEATURES: Record<string, string[]> = {
  timeline: ['pain_onset', 'pain_onset_sudden', 'pain_duration_hours'],
  location: ['pain_initial_location', 'pain_location_now'],
  character: ['pain_character', 'pain_severity'],
  severity: ['pain_severity'],
  radiation: ['pain_radiation'],
  aggravating: ['pain_worsening_factors'],
  relieving: ['pain_relieving_factors'],
  functional_impact: ['functional_impact', 'impact_daily_activity', 'impact_sleep'],
  associated_gi: ['nausea', 'vomiting', 'anorexia', 'abdominal_distension', 'obstipation', 'diarrhea', 'constipation', 'melena', 'hematochezia', 'hematemesis'],
  associated_fever: ['fever', 'fever_chills'],
  associated_urinary: ['dysuria', 'hematuria', 'flank_pain', 'urinary_frequency'],
  associated_gynae: ['last_menstrual_period', 'vaginal_bleeding', 'vaginal_discharge'],
  red_flags: ['syncope', 'peritonism', 'rigidity'],
  risk_factors: ['prior_abdominal_surgery', 'nsaid_use', 'alcohol_use', 'smoking', 'known_gallstones', 'anticoagulant_use', 'family_history_gi_cancer'],
};

function computeRedundancyPenalty(featureId: string, answeredIds: Set<string>): number {
  const feature = FEATURES[featureId];
  if (!feature || !feature.dependsOn) return 0;

  if (answeredIds.has(feature.dependsOn.featureId)) {
    return 0.5;
  }

  return 0;
}

function computeDomainCompleteness(answeredIds: Set<string>): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  for (const [domain, features] of Object.entries(DOCUMENTATION_DOMAIN_FEATURES)) {
    const answeredCount = features.filter(f => answeredIds.has(f)).length;
    result[domain] = answeredCount >= (domain === 'character' ? 2 : 1);
  }
  const giAnswered = DOCUMENTATION_DOMAIN_FEATURES.associated_gi.filter(f => answeredIds.has(f)).length;
  result.associated_gi = giAnswered >= 2;
  return result;
}

export function computeInformationGaps(
  state: EncounterBrainState,
  diseaseStates: Record<string, DiseaseState>,
  diseaseMap: Map<string, DiseaseNode>,
  timelineEvents: TimelineEvent[],
  answeredFeatureIds: string[],
): InformationGap[] {
  const answeredIds = new Set(answeredFeatureIds);
  const gapsMap = new Map<string, InformationGap>();

  function addGap(gap: InformationGap): void {
    const existing = gapsMap.get(gap.featureId);
    if (existing) {
      if (gap.priorityScore > existing.priorityScore) {
        gapsMap.set(gap.featureId, gap);
      }
    } else {
      gapsMap.set(gap.featureId, gap);
    }
  }

  const penalty = (fid: string) => computeRedundancyPenalty(fid, answeredIds);
  const score = (base: number, fid: string) => Math.round(base * (1 - penalty(fid)));

  for (const [diseaseId, ds] of Object.entries(diseaseStates)) {
    for (const cu of ds.criticalUnknowns) {
      if (answeredIds.has(cu)) continue;
      const feature = FEATURES[cu];
      if (!feature) continue;
      addGap({
        featureId: cu,
        label: feature.label,
        category: 'life_threatening',
        priorityScore: 100,
        reasonEssential: `CRITICAL SAFETY: ${ds.diseaseName} requires knowing ${feature.shortLabel}. Missing this could be dangerous.`,
        sourceDiseaseId: diseaseId,
        type: feature.type,
        options: feature.options,
        clinicalGuide: feature.clinicalGuide,
        groupLabel: 'Safety Assessment',
      });
    }
  }

  const sortedDiseaseEntries = Object.entries(diseaseStates)
    .filter(([, ds]) => ds.currentProb > 0.005)
    .sort(([, a], [, b]) => b.currentProb - a.currentProb)
    .slice(0, 5);

  for (let i = 0; i < sortedDiseaseEntries.length; i++) {
    const [diseaseId, ds] = sortedDiseaseEntries[i];
    const diseaseNode = diseaseMap.get(diseaseId);
    if (!diseaseNode) continue;

    for (let j = i + 1; j < sortedDiseaseEntries.length; j++) {
      const [compId, compDs] = sortedDiseaseEntries[j];

      const distFeatures = diseaseNode.differential.distinguishingFeatures.filter(
        df => df.fromDiseaseId === compId
      );

      for (const df of distFeatures) {
        for (const featureId of df.featureIds) {
          if (answeredIds.has(featureId) || gapsMap.has(featureId)) continue;
          const feature = FEATURES[featureId];
          if (!feature) continue;

          const probDiff = Math.abs(ds.currentProb - compDs.currentProb);
          const probBonus = Math.round(probDiff * 15);
          const baseScore = Math.min(95, 80 + probBonus);

          addGap({
            featureId,
            label: feature.label,
            category: 'diagnostic',
            priorityScore: score(baseScore, featureId),
            reasonEssential: `Distinguishes ${ds.diseaseName} (${Math.round(ds.currentProb * 100)}%) from ${compDs.diseaseName} (${Math.round(compDs.currentProb * 100)}%).`,
            sourceDiseaseId: diseaseId,
            type: feature.type,
            options: feature.options,
            clinicalGuide: feature.clinicalGuide,
            groupLabel: 'Differential Diagnosis',
          });
        }
      }
    }

    const allDiseaseFeatures = [
      ...diseaseNode.features.symptoms,
      ...diseaseNode.features.signs,
      ...diseaseNode.features.investigations,
    ];

    for (const feat of allDiseaseFeatures) {
      if (answeredIds.has(feat.featureId) || gapsMap.has(feat.featureId)) continue;
      if (feat.dependsOn && !answeredIds.has(feat.dependsOn.featureId)) continue;

      const lrPlus = getLrPlus(feat);
      if (lrPlus < 3) continue;

      addGap({
        featureId: feat.featureId,
        label: feat.label,
        category: 'diagnostic',
        priorityScore: score(80, feat.featureId),
        reasonEssential: `High diagnostic value (LR+ ${lrPlus.toFixed(1)}) for ${ds.diseaseName}.`,
        sourceDiseaseId: diseaseId,
        type: feat.type,
        options: feat.options,
        clinicalGuide: feat.clinicalGuide,
        groupLabel: 'Differential Diagnosis',
      });
    }
  }

  for (const featureId of MANAGEMENT_FEATURES) {
    if (answeredIds.has(featureId) || gapsMap.has(featureId)) continue;
    const feature = FEATURES[featureId];
    if (!feature) continue;
    if (feature.dependsOn && !answeredIds.has(feature.dependsOn.featureId)) continue;

    addGap({
      featureId,
      label: feature.label,
      category: 'management',
      priorityScore: score(60, featureId),
      reasonEssential: 'Essential for determining management and treatment approach.',
      type: feature.type,
      options: feature.options,
      clinicalGuide: feature.clinicalGuide,
      groupLabel: 'Management Planning',
    });
  }

  const domainCompleteness = computeDomainCompleteness(answeredIds);
  for (const [domain, isComplete] of Object.entries(domainCompleteness)) {
    if (isComplete) continue;
    const domainFeatures = DOCUMENTATION_DOMAIN_FEATURES[domain];
    if (!domainFeatures) continue;

    for (const featureId of domainFeatures) {
      if (answeredIds.has(featureId) || gapsMap.has(featureId)) continue;
      const feature = FEATURES[featureId];
      if (!feature) continue;
      if (feature.dependsOn && !answeredIds.has(feature.dependsOn.featureId)) continue;

      addGap({
        featureId,
        label: feature.label,
        category: 'documentation',
        priorityScore: score(40, featureId),
        reasonEssential: `Missing documentation domain: ${domain}. Needed for complete clinical narrative.`,
        type: feature.type,
        options: feature.options,
        clinicalGuide: feature.clinicalGuide,
        groupLabel: 'Documentation',
      });
    }
  }

  for (const [, ds] of Object.entries(diseaseStates)) {
    const diseaseNode = diseaseMap.get(ds.diseaseId);
    if (!diseaseNode) continue;

    for (const rf of diseaseNode.epidemiology.riskFactors) {
      if (answeredIds.has(rf.featureId) || gapsMap.has(rf.featureId)) continue;
      const feature = FEATURES[rf.featureId];
      if (!feature) continue;

      addGap({
        featureId: rf.featureId,
        label: feature.label,
        category: 'risk_factor',
        priorityScore: score(20, rf.featureId),
        reasonEssential: `Risk factor for ${ds.diseaseName} (LR+ ${rf.LR_positive.toFixed(1)}).`,
        sourceDiseaseId: ds.diseaseId,
        type: feature.type,
        options: feature.options,
        clinicalGuide: feature.clinicalGuide,
        groupLabel: 'Risk Factors',
      });
    }
  }

  for (const featureId of FUNCTIONAL_IMPACT_FEATURES) {
    if (answeredIds.has(featureId) || gapsMap.has(featureId)) continue;
    const feature = FEATURES[featureId];
    if (!feature) continue;
    if (feature.dependsOn && !answeredIds.has(feature.dependsOn.featureId)) continue;

    addGap({
      featureId,
      label: feature.label,
      category: 'functional_impact',
      priorityScore: score(10, featureId),
      reasonEssential: 'Assesses how the illness affects the patient\'s daily life and function.',
      type: feature.type,
      options: feature.options,
      clinicalGuide: feature.clinicalGuide,
      groupLabel: 'Functional Impact',
    });
  }

  return Array.from(gapsMap.values()).sort((a, b) => b.priorityScore - a.priorityScore);
}

export function selectNextGap(
  gaps: InformationGap[],
  answeredIds: string[],
): InformationGap | null {
  const answeredSet = new Set(answeredIds);
  for (const gap of gaps) {
    if (!answeredSet.has(gap.featureId)) {
      return gap;
    }
  }
  return null;
}

export function getGapRationale(gap: InformationGap): string {
  switch (gap.category) {
    case 'life_threatening':
      return `SAFETY: ${gap.reasonEssential}`;
    case 'diagnostic':
      return `DIAGNOSTIC: ${gap.reasonEssential}`;
    case 'management':
      return `MANAGEMENT: ${gap.reasonEssential}`;
    case 'documentation':
      return `DOCUMENTATION: ${gap.reasonEssential}`;
    case 'risk_factor':
      return `RISK: ${gap.reasonEssential}`;
    case 'functional_impact':
      return `FUNCTIONAL: ${gap.reasonEssential}`;
    default:
      return gap.reasonEssential;
  }
}

export function getStoryGaps(story: ClinicalStory): InformationGap[] {
  const gaps: InformationGap[] = [];
  const seen = new Set<string>();

  for (const node of story.nodes) {
    if (node.complete) continue;

    for (const featureId of node.missing) {
      if (seen.has(featureId)) continue;
      seen.add(featureId);

      const feature = FEATURES[featureId];
      if (!feature) continue;

      gaps.push({
        featureId,
        label: feature.label,
        category: 'documentation',
        priorityScore: 30,
        reasonEssential: `Missing from clinical story section "${node.label}". Needed to complete the narrative.`,
        type: feature.type,
        options: feature.options,
        clinicalGuide: feature.clinicalGuide,
        groupLabel: 'Clinical Story',
      });
    }
  }

  return gaps.sort((a, b) => b.priorityScore - a.priorityScore);
}

export function selectNextQuestionGroup(
  gaps: InformationGap[],
  questionGroups: QuestionGroup[],
): QuestionGroup | null {
  for (const gap of gaps) {
    for (const qg of questionGroups) {
      if (qg.questions.includes(gap.featureId)) {
        return qg;
      }
    }
  }

  return questionGroups.length > 0 ? questionGroups[0] : null;
}
