import { type Recommendation, type Prediction, type DifferentialEntry, type Explanation, ConfidenceLevel } from './types'

export interface PrioritizedResult {
  recommendations: Recommendation[]
  predictions: Prediction[]
  differentials: DifferentialEntry[]
  explanations: Explanation[]
}

export function prioritizeResults(
  recommendations: Recommendation[],
  predictions: Prediction[],
  differentials: DifferentialEntry[],
): PrioritizedResult {
  const sortedRecommendations = recommendations.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    const aOrder = priorityOrder[a.priority] ?? 3
    const bOrder = priorityOrder[b.priority] ?? 3
    return aOrder - bOrder
  })

  const sortedPredictions = predictions.sort((a, b) => b.probability - a.probability)

  const sortedDifferentials = differentials.sort((a, b) => b.confidence - a.confidence)

  const sortedExplanations = recommendations
    .map(rec => ({
      recommendationId: rec.id,
      why: rec.reasoning,
      evidence: [rec.evidence],
      guidelines: rec.guideline ? [rec.guideline] : [],
      riskFactors: rec.risks || [],
      confidence: rec.confidence,
      alternatives: rec.alternatives?.map(a => a.title) || [],
      patientContext: {} as import('./types').ClinicalContext,
    }))
    .sort((a, b) => b.confidence - a.confidence)

  return {
    recommendations: sortedRecommendations.slice(0, 20),
    predictions: sortedPredictions.slice(0, 10),
    differentials: sortedDifferentials.slice(0, 10),
    explanations: sortedExplanations.slice(0, 20),
  }
}

export function prioritizeByConfidence(
  items: Array<{ id: string; confidence: number }>,
): Array<{ id: string; confidence: number }> {
  return [...items].sort((a, b) => b.confidence - a.confidence)
}

export function prioritizeByPriority(
  items: Array<{ id: string; priority: string }>,
): Array<{ id: string; priority: string }> {
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  return [...items].sort(
    (a, b) => (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3),
  )
}

export function getTopRecommendations(
  recommendations: Recommendation[],
  maxCount: number = 10,
): Recommendation[] {
  return recommendations
    .sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      return (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3)
    })
    .slice(0, maxCount)
}

export function getTopPredictions(
  predictions: Prediction[],
  maxCount: number = 5,
): Prediction[] {
  return predictions
    .sort((a, b) => b.probability - a.probability)
    .slice(0, maxCount)
}

export function getTopDifferentials(
  differentials: DifferentialEntry[],
  maxCount: number = 10,
): DifferentialEntry[] {
  return differentials
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, maxCount)
}

export function filterByMinimumConfidence(
  items: Array<{ id: string; confidence: number }>,
  minimumConfidence: number,
): Array<{ id: string; confidence: number }> {
  return items.filter(item => item.confidence >= minimumConfidence)
}

export function filterByPriority(
  items: Array<{ id: string; priority: string }>,
  allowedPriorities: string[],
): Array<{ id: string; priority: string }> {
  return items.filter(item => allowedPriorities.includes(item.priority))
}

export default {
  prioritizeResults,
  prioritizeByConfidence,
  prioritizeByPriority,
  getTopRecommendations,
  getTopPredictions,
  getTopDifferentials,
  filterByMinimumConfidence,
  filterByPriority,
}