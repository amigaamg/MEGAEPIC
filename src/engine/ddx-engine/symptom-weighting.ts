import type { DiseaseNode } from '../knowledge-graph/types';

export interface WeightedSymptom {
  symptomId: string;
  baseWeight: number;
  contextualBoost: number;
  totalWeight: number;
  source: 'history' | 'exam' | 'risk_factor';
}

export function calculateSymptomWeights(
  disease: DiseaseNode,
  presentSymptoms: string[],
  presentExamFindings: string[],
  riskFactors: string[]
): WeightedSymptom[] {
  const weights: WeightedSymptom[] = [];
  const symptomSet = new Set(presentSymptoms.map(s => s.toLowerCase()));
  const examSet = new Set(presentExamFindings.map(s => s.toLowerCase()));

  for (const hf of disease.historyFeatures || []) {
    const sid = hf.symptomId.toLowerCase();
    if (symptomSet.has(sid)) {
      let contextualBoost = 0;
      if (hf.contextualWeights) {
        for (const cw of hf.contextualWeights) {
          if (symptomSet.has(cw.condition.toLowerCase()) || examSet.has(cw.condition.toLowerCase())) {
            contextualBoost += cw.weightBoost;
          }
        }
      }
      weights.push({
        symptomId: hf.symptomId,
        baseWeight: hf.weight || 1,
        contextualBoost,
        totalWeight: (hf.weight || 1) + contextualBoost,
        source: 'history',
      });
    }
  }

  for (const ef of disease.examFeatures || []) {
    const signId = ef.signId.toLowerCase();
    if (examSet.has(signId)) {
      let contextualBoost = 0;
      if (ef.doubleWeight) contextualBoost += (ef.baseWeight || 1);
      weights.push({
        symptomId: ef.signId,
        baseWeight: ef.baseWeight || 1,
        contextualBoost,
        totalWeight: (ef.baseWeight || 1) + contextualBoost,
        source: 'exam',
      });
    }
  }

  for (const rf of disease.riskFactors || []) {
    if (riskFactors.some(r => r.toLowerCase().includes(rf.id.toLowerCase()))) {
      const boost = rf.multiplier || 0.2;
      weights.push({
        symptomId: rf.id,
        baseWeight: boost,
        contextualBoost: 0,
        totalWeight: boost,
        source: 'risk_factor',
      });
    }
  }

  return weights;
}

export function aggregateScore(weights: WeightedSymptom[], prevalenceWeight: number): number {
  if (weights.length === 0) return 0;
  const totalWeight = weights.reduce((sum, w) => sum + w.totalWeight, 0);
  const historyContribution = weights
    .filter(w => w.source === 'history')
    .reduce((sum, w) => sum + w.totalWeight, 0) * 0.4;
  const examContribution = weights
    .filter(w => w.source === 'exam')
    .reduce((sum, w) => sum + w.totalWeight, 0) * 0.6;
  const riskContribution = weights
    .filter(w => w.source === 'risk_factor')
    .reduce((sum, w) => sum + w.totalWeight, 0);
  const baseScore = (historyContribution + examContribution + riskContribution) * prevalenceWeight;
  return Math.min(1, baseScore / (baseScore + 1));
}
