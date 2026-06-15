import type { DdxResult, DdxSnapshot, ClinicalReasoningTrace, ChiefComplaint, FeatureRegistry } from './types';
import { aggregateDifferentials } from './symptomLibrary';
import HISTORY_FEATURE_REGISTRY from './historyFeatureRegistry';
import { enrichWithKgDifferentials } from './kgDifferentialBridge';

export interface DdxInput {
  complaints: ChiefComplaint[];
  featureRegistry: FeatureRegistry;
  age: number;
  sex: string;
}

export function computeDdx(input: DdxInput): DdxResult {
  const complaintIds = input.complaints.map(c => c.symptomId);
  const aggregated = enrichWithKgDifferentials(complaintIds, aggregateDifferentials(complaintIds));

  for (const [, entry] of Object.entries(input.featureRegistry)) {
    if (entry.present === true) {
      for (const [did, w] of Object.entries(entry.diseaseWeights)) {
        const existing = aggregated.get(did);
        if (existing) {
          existing.totalWeight += w;
        } else {
          aggregated.set(did, { diseaseName: did.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), totalWeight: w, matchedSymptoms: [] });
        }
      }
    }
  }

  const maxWeight = Math.max(...Array.from(aggregated.values()).map(d => d.totalWeight), 1);
  const probabilities = Array.from(aggregated.entries())
    .map(([diseaseId, data]) => ({
      diseaseId,
      diseaseName: data.diseaseName,
      probability: Math.round((data.totalWeight / maxWeight) * 100),
      matchedSymptoms: data.matchedSymptoms,
    }))
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 10);

  const traces: ClinicalReasoningTrace[] = probabilities.map(p => {
    const supporting: string[] = [];
    const against: string[] = [];
    const keyFindings: string[] = [];

    input.complaints.forEach(c => {
      const entry = HISTORY_FEATURE_REGISTRY[c.symptomId];
      if (entry?.diseaseWeights[p.diseaseId] && entry.diseaseWeights[p.diseaseId] > 0) {
        supporting.push(`${c.label} present`);
      }
    });

    for (const [, fe] of Object.entries(input.featureRegistry)) {
      if (fe.present === true) {
        const featureDef = HISTORY_FEATURE_REGISTRY[fe.id];
        const weight = fe.diseaseWeights[p.diseaseId];
        if (weight && weight > 0) {
          supporting.push(featureDef?.label || fe.id.replace(/_/g, ' '));
          keyFindings.push(featureDef?.label || fe.id.replace(/_/g, ' '));
        }
      }
      if (fe.present === false) {
        const featureDef = HISTORY_FEATURE_REGISTRY[fe.id];
        const weight = fe.diseaseWeights[p.diseaseId];
        if (weight && weight < 0) {
          supporting.push(`${featureDef?.label || fe.id.replace(/_/g, ' ')} absent (negative predictor)`);
        }
        if (featureDef?.negativePredictorFor?.some(np => np.diseaseId === p.diseaseId)) {
          against.push(`${featureDef.label || fe.id.replace(/_/g, ' ')} absent (reduces likelihood)`);
        }
      }
    }

    return { diseaseId: p.diseaseId, diseaseName: p.diseaseName, supporting, against, keyFindings };
  });

  const snapshot: DdxSnapshot = {
    timestamp: Date.now(),
    probabilities: probabilities.map(p => ({ diseaseId: p.diseaseId, diseaseName: p.diseaseName, probability: p.probability })),
  };

  return { probabilities, snapshots: [snapshot], traces };
}
