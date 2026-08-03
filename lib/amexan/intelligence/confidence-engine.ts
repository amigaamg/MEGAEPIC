import { ConfidenceLevel } from './types'

export function evaluateConfidence(reasoningTraces: { confidence: number }[]): ConfidenceLevel {
  if (reasoningTraces.length === 0) return ConfidenceLevel.Low

  const avgConfidence = reasoningTraces.reduce((sum, t) => sum + t.confidence, 0) / reasoningTraces.length

  if (avgConfidence >= 0.8) return ConfidenceLevel.High
  if (avgConfidence >= 0.5) return ConfidenceLevel.Moderate
  return ConfidenceLevel.Low
}

export function evaluateRecommendationConfidence(recommendation: { evidence: string; evidenceLevel: string; guideline?: string }): ConfidenceLevel {
  let confidence = 0.5

  if (recommendation.evidence && recommendation.evidence.length > 0) {
    confidence += 0.15
  }

  if (recommendation.evidenceLevel === 'levelA') {
    confidence += 0.25
  } else if (recommendation.evidenceLevel === 'levelB') {
    confidence += 0.15
  } else if (recommendation.evidenceLevel === 'levelC') {
    confidence += 0.05
  }

  if (recommendation.guideline) {
    confidence += 0.1
  }

  if (confidence >= 0.8) return ConfidenceLevel.High
  if (confidence >= 0.5) return ConfidenceLevel.Moderate
  return ConfidenceLevel.Low
}

export function evaluatePredictionConfidence(prediction: { evidence: string[]; riskFactors: string[] }): ConfidenceLevel {
  let confidence = 0.4

  confidence += Math.min(0.3, prediction.evidence.length * 0.05)
  confidence += Math.min(0.2, prediction.riskFactors.length * 0.03)

  if (confidence >= 0.8) return ConfidenceLevel.High
  if (confidence >= 0.5) return ConfidenceLevel.Moderate
  return ConfidenceLevel.Low
}

export function evaluateDifferentialConfidence(differential: { supportingFindings: string[]; contradictingFindings: string[] }): ConfidenceLevel {
  let confidence = 0.5

  confidence += Math.min(0.3, differential.supportingFindings.length * 0.05)
  confidence -= Math.min(0.2, differential.contradictingFindings.length * 0.05)

  if (confidence >= 0.8) return ConfidenceLevel.High
  if (confidence >= 0.5) return ConfidenceLevel.Moderate
  return ConfidenceLevel.Low
}

export function getConfidenceColor(confidence: ConfidenceLevel): string {
  switch (confidence) {
    case ConfidenceLevel.High:
      return 'green'
    case ConfidenceLevel.Moderate:
      return 'amber'
    case ConfidenceLevel.Low:
      return 'red'
    case ConfidenceLevel.Critical:
      return 'red'
    default:
      return 'gray'
  }
}

export function getConfidenceLabel(confidence: ConfidenceLevel): string {
  switch (confidence) {
    case ConfidenceLevel.High:
      return 'High Confidence'
    case ConfidenceLevel.Moderate:
      return 'Moderate Confidence'
    case ConfidenceLevel.Low:
      return 'Low Confidence'
    case ConfidenceLevel.Critical:
      return 'Critical Confidence'
    default:
      return 'Unknown'
  }
}

export function isConfidenceAcceptable(confidence: ConfidenceLevel, threshold: ConfidenceLevel): boolean {
  const levels = [ConfidenceLevel.Low, ConfidenceLevel.Moderate, ConfidenceLevel.High, ConfidenceLevel.Critical]
  const confIndex = levels.indexOf(confidence)
  const thresholdIndex = levels.indexOf(threshold)
  return confIndex >= thresholdIndex
}

export default {
  evaluateConfidence,
  evaluateRecommendationConfidence,
  evaluatePredictionConfidence,
  evaluateDifferentialConfidence,
  getConfidenceColor,
  getConfidenceLabel,
  isConfidenceAcceptable,
}