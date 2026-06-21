// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Bayesian Reasoning Engine
// Runs after EVERY answer. Updates probabilities by multiplying prior × LR.
// ═══════════════════════════════════════════════════════════════════════════════

import type {
  DiseaseNode, EncounterState, AnswerRecord, CandidateDiseaseState,
  ConvergenceState, AnswerPolarity,
} from '../knowbase/diseaseNode';
import { getLrPlus, getLrMinus, FEATURES } from '../knowbase/features/featureLibrary';
import { ABDOMINAL_PAIN_DISEASE_MAP } from '../knowbase/diseases/abdominalPainNodes';
import { applyGeographicPrior, type GeographicRegion } from './geographicPriors';
import { computeDiseaseScores } from './clinicalScoringEngine';

export interface DdxUpdateResult {
  activeCandidates: CandidateDiseaseState[];
  leadingDiagnosis: CandidateDiseaseState | null;
  convergenceState: ConvergenceState;
}

/** Compute prior probability from epidemiological factors */
function computePrior(
  disease: DiseaseNode,
  age: number,
  sex: string,
  geographicRegion?: GeographicRegion,
): number {
  const epi = disease.epidemiology;
  if (age < epi.ageMin || age > epi.ageMax) return 0.001;
  const sexMultiplier = sex === 'male' ? epi.sexRisk.male : epi.sexRisk.female;
  if (sexMultiplier === 0) return 0;
  let prior = epi.backgroundPrevalence * sexMultiplier;
  prior = applyGeographicPrior(prior, epi.geographicFlags, geographicRegion || '');
  return prior;
}

/** Update a single candidate's probability given an answer */
function updateCandidate(
  candidate: CandidateDiseaseState,
  answer: AnswerRecord,
  disease: DiseaseNode,
): CandidateDiseaseState {
  const updated = { ...candidate };
  const polarity = answer.polarity;

  // Collect all features from the disease node
  const allFeatures = [
    ...disease.features.symptoms,
    ...disease.features.signs,
    ...disease.features.investigations,
  ];

  // Find the matching feature record
  const feature = allFeatures.find(f => f.featureId === answer.featureId);

  if (feature) {
    if (polarity === 'present') {
      let lrp = getLrPlus(feature);
      if (!isFinite(lrp)) lrp = 100;
      if (lrp < 0.01) lrp = 0.01;
      updated.currentProb *= lrp;
      updated.evidenceFor.push(feature.featureId);
    } else {
      let lrm = getLrMinus(feature);
      if (!isFinite(lrm)) lrm = 100;
      if (lrm < 0.01) lrm = 0.01;
      updated.currentProb *= lrm;
      updated.evidenceAgainst.push(feature.featureId);
      // Check if this is an important negative (LR− < 0.15)
      if (lrm < 0.15) {
        updated.importantNegativesFound.push(feature.featureId);
      }
    }
  }

  return updated;
}

/** Compute the full DDX update */
export function computeDdxUpdate(
  state: EncounterState,
  diseaseMap: Map<string, DiseaseNode> = ABDOMINAL_PAIN_DISEASE_MAP,
): DdxUpdateResult {
  const { age, sex, geographicRegion } = state.patient;
  const allAnswers = state.answers;

  // Step 1: Load candidate set with priors
  const candidates: CandidateDiseaseState[] = [];
  for (const [diseaseId, disease] of diseaseMap) {
    const prior = computePrior(disease, age, sex, geographicRegion as GeographicRegion);
    if (prior <= 0) continue;

    candidates.push({
      diseaseId,
      diseaseName: disease.name,
      priorProb: prior,
      currentProb: prior,
      evidenceFor: [],
      evidenceAgainst: [],
      importantNegativesFound: [],
      matchedStages: [],
      scoreResults: {},
      isRedFlagTriggered: false,
    });
  }

  // Step 2: Score each candidate against all answers
  for (const answer of allAnswers) {
    for (let i = 0; i < Math.min(5, candidates.length); i++) {
      const disease = diseaseMap.get(candidates[i].diseaseId);
      if (!disease) continue;
      candidates[i] = updateCandidate(candidates[i], answer, disease);
    }
    for (let i = 5; i < candidates.length; i++) {
      const disease = diseaseMap.get(candidates[i].diseaseId);
      if (!disease) continue;
      candidates[i] = updateCandidate(candidates[i], answer, disease);
    }
  }

  // Step 3: Compute clinical scores for each candidate
  for (let i = 0; i < candidates.length; i++) {
    const disease = diseaseMap.get(candidates[i].diseaseId);
    if (disease && disease.clinicalScores.length > 0) {
      candidates[i] = computeDiseaseScores(candidates[i], disease.clinicalScores, allAnswers);
    }
  }

  // Step 4: Normalize probabilities
  const totalProb = candidates.reduce((s, c) => s + c.currentProb, 0);
  if (totalProb > 0) {
    for (const c of candidates) {
      c.currentProb = totalProb > 0 ? c.currentProb / totalProb : c.currentProb;
    }
  }

  // Step 5: Sort by probability descending
  candidates.sort((a, b) => b.currentProb - a.currentProb);

  // Step 6: Determine convergence state
  const leading = candidates[0] || null;
  let convergenceState: ConvergenceState = 'exploring';

  // Check never-close conditions
  const top3 = candidates.slice(0, 3).map(c => c.diseaseId);
  const neverCloseStillActive = state.chiefComplaint.highwayId === 'abdominal_pain' && 
    top3.includes('ectopic_pregnancy');

  if (leading && leading.currentProb >= 0.8) {
    convergenceState = 'confirming';
  } else if (leading && leading.currentProb >= 0.6 || neverCloseStillActive) {
    convergenceState = 'converging';
  }

  // Step 7: Check red flags (only for truly concerning answers, not for every answered select option)
  for (const c of candidates) {
    const disease = diseaseMap.get(c.diseaseId);
    if (!disease) continue;
    for (const rfId of disease.redFlagFeatureIds) {
      const redAnswer = allAnswers.find(a => a.featureId === rfId);
      if (!redAnswer || redAnswer.polarity !== 'present') continue;
      // For select-type features, only trigger if the value is clinically concerning
      const feature = FEATURES[rfId];
      if (feature?.type === 'select') {
        const val = String(redAnswer.value).toLowerCase();
        const concerningValues = ['sudden', 'instant', 'severe', 'excruciating', 'tearing', 'ripping',
          'yes', 'present', 'positive', 'blood', 'black', 'tarry'];
        if (concerningValues.some(cv => val.includes(cv))) {
          c.isRedFlagTriggered = true;
          break;
        }
      } else {
        // Boolean features: if answered yes, it's always a red flag trigger
        c.isRedFlagTriggered = true;
        break;
      }
    }
  }

  return { activeCandidates: candidates.slice(0, 10), leadingDiagnosis: leading, convergenceState };
}

/** Normalize an answer into polarity */
export function answerToPolarity(value: string | boolean | string[] | number): AnswerPolarity {
  if (typeof value === 'boolean') return value ? 'present' : 'absent';
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    if (['no', 'none', 'never', 'absent', 'no radiation'].includes(lower)) return 'absent';
    if (['yes', 'present'].includes(lower)) return 'present';
    // For select options, having any value = present
    return lower === '' || lower === 'n/a' ? 'absent' : 'present';
  }
  if (Array.isArray(value)) return value.length > 0 ? 'present' : 'absent';
  if (typeof value === 'number') return value > 0 ? 'present' : 'absent';
  return 'absent';
}
