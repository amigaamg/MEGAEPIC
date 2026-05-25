import { DiseaseNode } from '../knowledge-graph/types';
import { PatientForm } from '../../types';
import { ScoredDisease } from './types';
import { runInference } from './scorer';
import { FEATURE_REGISTRY, FeatureDescriptor } from './featureRegistry';

export interface QuestionSuggestion {
  feature: FeatureDescriptor;
  informationGain: number;
  rationale: string;
}

const MAX_WEIGHT = 10;

function entropy(probs: number[]): number {
  return -probs.reduce((sum, p) => sum + (p > 0 ? p * Math.log2(p) : 0), 0);
}

function getDiseaseWeight(featureId: string, disease: DiseaseNode): number {
  const hist = disease.historyFeatures?.find(f => f.symptomId === featureId);
  if (hist) return hist.weight;
  const exam = disease.examFeatures?.find(f => f.signId === featureId);
  if (exam) return exam.baseWeight * (exam.doubleWeight ? 2 : 1);
  return 0;
}

function featureLikelihood(featureId: string, value: boolean, disease: DiseaseNode): number {
  const w = getDiseaseWeight(featureId, disease);
  const probPresent = Math.min(w / MAX_WEIGHT, 1);
  if (value) return probPresent;
  return 1 - probPresent;
}

function marginalProbability(
  featureId: string,
  value: boolean,
  ddX: ScoredDisease[],
): number {
  let prob = 0;
  for (const sd of ddX) {
    const likelihood = featureLikelihood(featureId, value, sd.disease);
    prob += sd.probability * likelihood;
  }
  return prob;
}

function computeInformationGain(
  featureId: string,
  ddX: ScoredDisease[],
  priorProbs: number[],
  HPrior: number,
): number {
  let expectedPosterior = 0;
  for (const v of [true, false]) {
    const pFv = marginalProbability(featureId, v, ddX);
    if (pFv === 0) continue;
    const posteriors = ddX.map((sd, i) => {
      const likelihood = featureLikelihood(featureId, v, sd.disease);
      return (likelihood * priorProbs[i]) / pFv;
    });
    expectedPosterior += pFv * entropy(posteriors);
  }
  return HPrior - expectedPosterior;
}

export function suggestNextQuestions(
  form: PatientForm,
  currentDDx?: ScoredDisease[],
): QuestionSuggestion[] {
  const ddX = currentDDx ?? runInference(form);
  if (ddX.length === 0) return [];

  const priorProbs = ddX.map(d => d.probability);
  const HPrior = entropy(priorProbs);
  if (HPrior === 0) return [];

  const hasUrgentDisease = ddX.some(d => d.disease.mustNotMiss && d.probability > 0.3);
  const urgencyBoost = hasUrgentDisease ? 1.5 : 1.0;

  const candidates = Object.values(FEATURE_REGISTRY).filter(f => !f.isAnswered(form));
  if (candidates.length === 0) return [];

  const gains: { feature: FeatureDescriptor; ig: number }[] = [];

  for (const feat of candidates) {
    const ig = computeInformationGain(feat.id, ddX, priorProbs, HPrior) * urgencyBoost;
    gains.push({ feature: feat, ig });
  }

  gains.sort((a, b) => b.ig - a.ig);

  const topGain = gains[0]?.ig || 0;

  return gains.slice(0, 5).map(g => ({
    feature: g.feature,
    informationGain: g.ig,
    rationale: topGain > 0
      ? `Expected information gain: ${(g.ig / topGain * 100).toFixed(0)}% relative to the most valuable question`
      : 'Could help refine the differential diagnosis',
  }));
}

export function computeDDxEntropy(scored: ScoredDisease[]): number {
  const probs = scored.map(d => d.probability);
  return entropy(probs);
}
