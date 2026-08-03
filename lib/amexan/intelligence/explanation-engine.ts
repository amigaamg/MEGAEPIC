import { type Recommendation, type ClinicalContext, ConfidenceLevel } from './types'

export interface Explanation {
  recommendationId: string
  why: string
  evidence: string[]
  guidelines: string[]
  riskFactors: string[]
  confidence: number
  alternatives: string[]
  patientContext: ClinicalContext
}

export async function explain(
  recommendations: Recommendation[],
  context: ClinicalContext,
): Promise<Explanation[]> {
  return recommendations.map(rec => ({
    recommendationId: rec.id,
    why: rec.reasoning,
    evidence: [rec.evidence],
    guidelines: rec.guideline ? [rec.guideline] : [],
    riskFactors: rec.risks || [],
    confidence: rec.confidence,
    alternatives: rec.alternatives?.map(a => a.title) || [],
    patientContext: context,
  }))
}

export function explainRecommendation(
  recommendation: Recommendation,
  context: ClinicalContext,
): Explanation {
  return {
    recommendationId: recommendation.id,
    why: recommendation.reasoning,
    evidence: [recommendation.evidence],
    guidelines: recommendation.guideline ? [recommendation.guideline] : [],
    riskFactors: recommendation.risks || [],
    confidence: recommendation.confidence,
    alternatives: recommendation.alternatives?.map(a => a.title) || [],
    patientContext: context,
  }
}

export function explainDifferential(
  differential: import('./types').DifferentialEntry,
  context: ClinicalContext,
): Explanation {
  return {
    recommendationId: `diff_${differential.diagnosis}`,
    why: `Differential diagnosis based on ${differential.supportingFindings.length} supporting findings`,
    evidence: differential.supportingFindings,
    guidelines: differential.guideline ? [differential.guideline] : [],
    riskFactors: differential.redFlags,
    confidence: differential.confidence,
    alternatives: differential.alternativeDiagnoses || [],
    patientContext: context,
  }
}

export function explainPrediction(
  prediction: import('./types').Prediction,
  context: ClinicalContext,
): Explanation {
  return {
    recommendationId: prediction.id,
    why: prediction.prediction,
    evidence: [prediction.evidence],
    guidelines: [],
    riskFactors: prediction.riskFactors,
    confidence: prediction.confidence,
    alternatives: prediction.recommendations?.map(r => r.title) || [],
    patientContext: context,
  }
}

export function getExplanationConfidence(explanation: Explanation): ConfidenceLevel {
  if (explanation.confidence >= 0.8) return ConfidenceLevel.High
  if (explanation.confidence >= 0.5) return ConfidenceLevel.Moderate
  return ConfidenceLevel.Low
}

export function isExplanationComplete(explanation: Explanation): boolean {
  return (
    explanation.why.length > 0 &&
    explanation.evidence.length > 0 &&
    explanation.confidence > 0
  )
}

export function formatExplanation(explanation: Explanation): string {
  const lines: string[] = []
  lines.push(`Recommendation: ${explanation.recommendationId}`)
  lines.push(`Why: ${explanation.why}`)
  lines.push(`Evidence: ${explanation.evidence.join(', ')}`)
  lines.push(`Guidelines: ${explanation.guidelines.join(', ')}`)
  lines.push(`Confidence: ${(explanation.confidence * 100).toFixed(1)}%`)
  if (explanation.alternatives.length > 0) {
    lines.push(`Alternatives: ${explanation.alternatives.join(', ')}`)
  }
  return lines.join('\n')
}

export default {
  explain,
  explainRecommendation,
  explainDifferential,
  explainPrediction,
  getExplanationConfidence,
  isExplanationComplete,
  formatExplanation,
}