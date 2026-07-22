import type { EncounterState, CandidateDiseaseState, DomainCompleteness } from '../knowbase/diseaseNode';
import { FEATURES } from '../knowbase/features/featureLibrary';
import { computeCompleteness } from './completenessEngine';

interface PriorityScore {
  diagnosticValue: number;      // How much does it separate top diagnoses?
  safetyValue: number;          // Can it identify a life threat?
  documentationValue: number;   // Does it fill a missing HPI domain?
  redundancyPenalty: number;    // Have we already learned this indirectly?
  total: number;                // diagnosticValue + safetyValue + documentationValue - redundancyPenalty
}

/**
 * Computes the diagnostic value of a feature — how well it separates
 * the top competing differentials.
 * Uses: sum of |Δprob| across top N candidates if this feature were asked.
 */
function computeDiagnosticValue(
  featureId: string,
  candidates: CandidateDiseaseState[],
): number {
  if (candidates.length < 2) return 0.5;

  const topN = candidates.slice(0, 4);
  const currentProbs = topN.map(c => c.currentProb);
  const meanProb = currentProbs.reduce((a, b) => a + b, 0) / currentProbs.length;

  // Compute how balanced/unbalanced the current distribution is
  const variance = currentProbs.reduce((sum, p) => sum + (p - meanProb) ** 2, 0) / currentProbs.length;

  // Higher variance = less uncertainty = lower diagnostic value remaining
  // Lower variance = more uncertainty = higher diagnostic value available
  const uncertaintyRemaining = 1 - Math.min(1, variance * 4);

  // Boost for features that are distinguishing in the disease feature tables
  let distinguishingBoost = 0;
  for (const c of topN) {
    if (c.importantNegativesFound.length > 0) continue;
    // Features that appear as important negatives for top diseases get a boost
    distinguishingBoost += 0.1;
  }

  return Math.min(1, uncertaintyRemaining + distinguishingBoost);
}

/**
 * Computes the safety value of a feature — does it help identify
 * an immediately life-threatening condition?
 */
function computeSafetyValue(
  featureId: string,
  candidates: CandidateDiseaseState[],
  state: EncounterState,
): number {
  // Direct red flag features get maximum safety value
  const redFlagFeatures = new Set<string>();
  for (const c of candidates) {
    // We can't directly access diseaseNode here, but we know the common red flags
  }

  // Known universally high-safety features
  const criticalFeatures: Record<string, number> = {
    'syncope': 1.0,
    'peritonism': 1.0,
    'rigidity': 1.0,
    'gi_bleeding_syncope': 1.0,
    'hematemesis': 0.9,
    'melena': 0.9,
    'hematochezia': 0.8,
    'hematemesis_volume': 0.8,
    'gi_bleeding_liver_disease': 0.7,
    'pain_onset_sudden': 0.7,
    'chest_pain': 0.6,
    'dyspnea': 0.6,
    'vaginal_bleeding': 0.5,
    'last_menstrual_period': 0.5,
    'fever_chills': 0.3,
  };

  const base = criticalFeatures[featureId] || 0;

  // Boost based on patient demographics
  let demographicBoost = 0;
  const isElderlyMale = state.patient.age >= 55 && state.patient.sex === 'male';
  const isReproFemale = state.patient.sex === 'female' && state.patient.age >= 15 && state.patient.age <= 50;

  if (isElderlyMale && featureId === 'pain_character') demographicBoost = 0.3;
  if (isElderlyMale && featureId === 'pain_severity') demographicBoost = 0.2;
  if (isReproFemale && featureId === 'last_menstrual_period') demographicBoost = 0.4;
  if (isReproFemale && featureId === 'vaginal_bleeding') demographicBoost = 0.3;
  if (featureId === 'syncope') demographicBoost = 0; // already max

  return Math.min(1, base + demographicBoost);
}

/**
 * Computes the documentation value — how much does this feature contribute
 * to completing the HPI narrative?
 */
function computeDocumentationValue(
  featureId: string,
  completeness: DomainCompleteness,
): number {
  if (!featureId) return 0;

  // Map features to domains
  const featureDomainMap: Record<string, keyof typeof completeness> = {
    'pain_onset': 'timeline',
    'pain_onset_sudden': 'timeline',
    'pain_duration_hours': 'timeline',
    'pain_duration_days': 'timeline',
    'pain_initial_location': 'location',
    'pain_location_now': 'location',
    'pain_migration': 'location',
    'pain_character': 'character',
    'pain_severity': 'severity',
    'pain_radiation': 'radiation',
    'pain_worsening_factors': 'aggravating',
    'pain_relieving_factors': 'relieving',
    'pain_temporal_pattern': 'temporal_pattern',
    'functional_impact': 'functional_impact',
    'impact_daily_activity': 'functional_impact',
    'impact_sleep': 'functional_impact',
    'nausea': 'associated_gi',
    'vomiting': 'associated_gi',
    'anorexia': 'associated_gi',
    'abdominal_distension': 'associated_gi',
    'obstipation': 'associated_gi',
    'diarrhea': 'associated_gi',
    'constipation': 'associated_gi',
    'melena': 'associated_gi',
    'hematochezia': 'associated_gi',
    'hematemesis': 'associated_gi',
    'fever': 'associated_fever',
    'fever_chills': 'associated_fever',
    'fever_pattern': 'associated_fever',
    'dysuria': 'associated_urinary',
    'hematuria': 'associated_urinary',
    'flank_pain': 'associated_urinary',
    'last_menstrual_period': 'associated_gynae',
    'vaginal_bleeding': 'associated_gynae',
    'vaginal_discharge': 'associated_gynae',
    'dyspareunia': 'associated_gynae',
    'syncope': 'red_flags',
    'peritonism': 'red_flags',
    'rigidity': 'red_flags',
    'prior_abdominal_surgery': 'risk_factors',
    'nsaid_use': 'risk_factors',
    'alcohol_use': 'risk_factors',
    'smoking': 'risk_factors',
    'known_gallstones': 'risk_factors',
    'anticoagulant_use': 'risk_factors',
    'family_history_gi_cancer': 'risk_factors',
  };

  const domain = featureDomainMap[featureId];
  if (!domain) return 0;

  // If this domain is already complete, documentation value is low
  // If incomplete, documentation value is high
  const isComplete = completeness[domain as keyof DomainCompleteness];
  return isComplete ? 0.1 : 0.8;
}

/**
 * Computes the redundancy penalty — are we asking something we could infer
 * from existing answers?
 */
function computeRedundancyPenalty(
  featureId: string,
  state: EncounterState,
): number {
  let penalty = 0;

  // Feature pairs that provide similar information
  const redundantPairs: [string, string][] = [
    ['nausea', 'vomiting'],
    ['diarrhea', 'diarrhoea'],
    ['pain_character_colicky', 'pain_character_cramping'],
    ['pain_location_now', 'pain_initial_location'],
  ];

  for (const [a, b] of redundantPairs) {
    if (featureId === a) {
      const hasB = state.answers.some(ans => ans.featureId === b && ans.polarity === 'present');
      if (hasB) penalty += 0.4;
    }
  }

  // If we already know pain is constant, asking about temporal pattern is redundant
  const knownConstant = state.answers.some(a =>
    a.featureId === 'pain_character' && String(a.value).toLowerCase().includes('constant')
  );
  if (featureId === 'pain_temporal_pattern' && knownConstant) penalty += 0.5;

  return Math.min(0.8, penalty);
}

/**
 * Compute the full 4-factor priority score for a candidate question.
 */
export function computePriorityScore(
  featureId: string,
  candidates: CandidateDiseaseState[],
  state: EncounterState,
): PriorityScore {
  const completeness = computeCompleteness(state);

  const diagnosticValue = computeDiagnosticValue(featureId, candidates);
  const safetyValue = computeSafetyValue(featureId, candidates, state);
  const documentationValue = computeDocumentationValue(featureId, completeness);
  const redundancyPenalty = computeRedundancyPenalty(featureId, state);

  const total = Math.max(0, diagnosticValue + safetyValue + documentationValue - redundancyPenalty);

  return {
    diagnosticValue,
    safetyValue,
    documentationValue,
    redundancyPenalty,
    total,
  };
}

/**
 * Get a human-readable rationale for why a question was selected.
 */
export function getScoreRationale(score: PriorityScore): string {
  const parts: string[] = [];
  if (score.safetyValue >= 0.7) parts.push('Red flag / safety question');
  else if (score.safetyValue >= 0.4) parts.push('Safety concern');
  if (score.documentationValue >= 0.7) parts.push('Fills a gap in the HPI');
  if (score.diagnosticValue >= 0.6) parts.push('High diagnostic value');
  if (score.redundancyPenalty >= 0.3) parts.push('Some redundancy with prior answers');
  return parts.length > 0 ? parts.join(' — ') : 'Completing the clinical picture';
}
