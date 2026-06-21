import type { DdxResult, DdxSnapshot, ClinicalReasoningTrace, ChiefComplaint, FeatureRegistry } from './types';
import { aggregateDifferentials } from './symptomLibrary';
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
        if (w <= 0) continue;
        const existing = aggregated.get(did);
        if (existing) {
          existing.totalWeight += w;
        } else {
          aggregated.set(did, { diseaseName: did.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), totalWeight: w, matchedSymptoms: [] });
        }
      }
      if (entry.modifier?.weightBoost) {
        for (const [did, w] of Object.entries(entry.diseaseWeights)) {
          if (w <= 0) continue;
          const existing = aggregated.get(did);
          if (existing) {
            existing.totalWeight += entry.modifier.weightBoost;
          }
        }
      }
    }
    if (entry.present === false) {
      for (const [did, reduction] of Object.entries(entry.negativeDiseaseWeights)) {
        const existing = aggregated.get(did);
        if (existing) {
          existing.totalWeight = Math.max(0, existing.totalWeight - reduction);
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

    for (const [, fe] of Object.entries(input.featureRegistry)) {
      if (fe.present === true) {
        const weight = fe.diseaseWeights[p.diseaseId];
        if (weight && weight > 0) {
          supporting.push(fe.id.replace(/_/g, ' '));
          keyFindings.push(fe.id.replace(/_/g, ' '));
        }
      }
      if (fe.present === false) {
        const negReduction = fe.negativeDiseaseWeights[p.diseaseId];
        if (negReduction && negReduction > 0) {
          against.push(`${fe.id.replace(/_/g, ' ')} absent (reduces likelihood by ${negReduction})`);
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
