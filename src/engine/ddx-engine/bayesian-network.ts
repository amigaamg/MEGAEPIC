import type { DiseaseNode } from '../knowledge-graph/types';

export interface BayesianUpdate {
  priorProbability: number;
  likelihoodRatio: number;
  posteriorProbability: number;
}

export function calculatePrior(prevalenceWeight: number, ageMonths: number, agePeak?: [number, number]): number {
  let prior = prevalenceWeight;
  if (agePeak) {
    const [min, max] = agePeak;
    if (ageMonths >= min && ageMonths <= max) {
      prior = Math.min(1, prior * 1.5);
    } else {
      prior = prior * 0.5;
    }
  }
  return Math.min(1, Math.max(0.01, prior));
}

export function bayesianUpdate(
  prior: number,
  sensitivity: number,
  specificity: number,
  symptomPresent: boolean
): BayesianUpdate {
  const tpr = sensitivity;
  const fpr = 1 - specificity;

  let likelihoodRatio: number;
  if (symptomPresent) {
    likelihoodRatio = tpr / Math.max(fpr, 0.001);
  } else {
    likelihoodRatio = (1 - tpr) / Math.max(specificity, 0.001);
  }

  const oddsPrior = prior / Math.max(1 - prior, 0.001);
  const oddsPosterior = oddsPrior * likelihoodRatio;
  const posteriorProbability = oddsPosterior / (1 + oddsPosterior);

  return { priorProbability: prior, likelihoodRatio, posteriorProbability };
}

export function applyBayesianNetwork(
  disease: DiseaseNode,
  presentSymptoms: string[],
  absentSymptoms: string[]
): number {
  const prior = calculatePrior(
    disease.prevalenceWeight || 0.5,
    0,
    disease.agePeak
  );

  const presentSet = new Set(presentSymptoms.map(s => s.toLowerCase()));
  const absentSet = new Set(absentSymptoms.map(s => s.toLowerCase()));

  let currentPrior = prior;

  const featureSensitivity = 0.7;
  const featureSpecificity = 0.8;

  for (const hf of disease.historyFeatures || []) {
    const sid = hf.symptomId.toLowerCase();
    const isPresent = presentSet.has(sid);
    const isAbsent = absentSet.has(sid);
    if (isPresent || isAbsent) {
      const update = bayesianUpdate(currentPrior, featureSensitivity, featureSpecificity, isPresent);
      currentPrior = update.posteriorProbability;
    }
  }

  for (const ef of disease.examFeatures || []) {
    const signId = ef.signId.toLowerCase();
    const isPresent = presentSet.has(signId);
    const isAbsent = absentSet.has(signId);
    if (isPresent || isAbsent) {
      const update = bayesianUpdate(currentPrior, featureSensitivity, featureSpecificity, isPresent);
      currentPrior = update.posteriorProbability;
    }
  }

  for (const clue of disease.diagnosticClues || []) {
    const isPresent = presentSet.has(clue.toLowerCase());
    const isAbsent = absentSet.has(clue.toLowerCase());
    if (isPresent || isAbsent) {
      const update = bayesianUpdate(currentPrior, 0.9, 0.95, isPresent);
      currentPrior = update.posteriorProbability;
    }
  }

  return currentPrior;
}
