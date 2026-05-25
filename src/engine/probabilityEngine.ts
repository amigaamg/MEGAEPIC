import { symptomWeights } from '@/src/data/respiratory/symptomWeights';
import { respiratoryDiseases } from '@/src/data/respiratory/diseases';
import { DiseaseScore, DiseaseId } from '@/src/types';

export function calculateDiseaseScores(
  answers: Record<string, string | string[] | boolean>
): DiseaseScore[] {
  const scores: Record<DiseaseId, number> = {} as Record<DiseaseId, number>;

  // Initialize all diseases at 0
  respiratoryDiseases.forEach(d => { scores[d.id] = 0; });

  // For each answer key, find matching weights and apply
  Object.entries(answers).forEach(([key, value]) => {
    if (!value) return;

    symptomWeights.forEach(w => {
      if (w.symptomKey === key) {
        scores[w.diseaseId] = (scores[w.diseaseId] || 0) + w.weight;
      }
    });
  });

  // Map to DiseaseScore objects, add confidence
  return respiratoryDiseases
    .map(disease => ({
      diseaseId: disease.id,
      name: disease.name,
      score: scores[disease.id] || 0,
      confidence: getConfidence(scores[disease.id] || 0),
    }))
    .sort((a, b) => b.score - a.score);
}

function getConfidence(score: number): 'low' | 'medium' | 'high' {
  if (score >= 15) return 'high';
  if (score >= 8)  return 'medium';
  return 'low';
}