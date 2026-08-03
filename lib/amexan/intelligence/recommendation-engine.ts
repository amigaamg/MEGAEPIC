import { type Observation, type ClinicalContext, type Recommendation, ConfidenceLevel, EvidenceLevel } from './types'
import { getActiveKnowledgePacks } from './knowledge-pack-engine'
import { generateDifferentials } from './differential-engine'
import { predict } from './prediction-engine'

export async function recommend(
  observations: Observation[],
  context: ClinicalContext,
  differentials: import('./types').DifferentialEntry[],
  predictions: import('./types').Prediction[],
): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = []
  const knowledgePacks = getActiveKnowledgePacks()

  for (const pack of knowledgePacks) {
    for (const rule of pack.rules) {
      if (rule.type === 'recommendation') {
        const match = observations.some(o => matchesRule(rule, o))
        if (match) {
          recommendations.push({
            id: `rec_${rule.id}_${Date.now()}`,
            type: 'recommendation',
            title: rule.action,
            description: rule.condition,
            evidence: rule.evidence,
            evidenceLevel: EvidenceLevel.LevelB,
            guideline: pack.name,
            confidence: 0.7,
            confidenceLevel: ConfidenceLevel.Moderate,
            reasoning: `Based on observation matching rule ${rule.id} from pack ${pack.name}`,
            priority: rule.priority > 7 ? 'high' : rule.priority > 4 ? 'medium' : 'low',
            actionable: true,
            source: pack.source,
            version: pack.version,
          })
        }
      }
    }
  }

  for (const diff of differentials) {
    if (diff.confidence > 0.7) {
      recommendations.push({
        id: `rec_diff_${diff.diagnosis}_${Date.now()}`,
        type: 'diagnostic',
        title: `Investigate ${diff.diagnosis}`,
        description: `Differential diagnosis with ${(diff.confidence * 100).toFixed(1)}% confidence`,
        evidence: diff.supportingFindings.join('; '),
        evidenceLevel: EvidenceLevel.LevelB,
        guideline: diff.guideline,
        confidence: diff.confidence,
        confidenceLevel: diff.confidence > 0.8 ? ConfidenceLevel.High : ConfidenceLevel.Moderate,
        reasoning: `Differential diagnosis supported by ${diff.supportingFindings.length} findings`,
        priority: diff.redFlags.length > 0 ? 'critical' : 'high',
        actionable: true,
        source: 'clinical-intelligence',
        version: '1.0.0',
      })
    }
  }

  for (const pred of predictions) {
    if (pred.probability > 0.5) {
      recommendations.push({
        id: `rec_pred_${pred.id}_${Date.now()}`,
        type: 'prediction',
        title: pred.prediction,
        description: `Predicted with ${(pred.probability * 100).toFixed(1)}% probability`,
        evidence: pred.evidence,
        evidenceLevel: EvidenceLevel.LevelC,
        guideline: 'Clinical Intelligence Engine',
        confidence: pred.confidence,
        confidenceLevel: pred.confidence > 0.7 ? ConfidenceLevel.High : ConfidenceLevel.Moderate,
        reasoning: `Prediction based on ${pred.riskFactors.length} risk factors`,
        priority: pred.probability > 0.8 ? 'critical' : 'high',
        actionable: true,
        source: 'prediction-engine',
        version: '1.0.0',
      })
    }
  }

  return recommendations.slice(0, 20)
}

function matchesRule(rule: import('./types').KnowledgeRule, observation: Observation): boolean {
  if (rule.type === observation.type) return true
  if (rule.condition.includes(observation.type)) return true
  return false
}

export function getRecommendationsByType(recommendations: Recommendation[], type: string): Recommendation[] {
  return recommendations.filter(r => r.type === type)
}

export function getRecommendationsByPriority(recommendations: Recommendation[], priority: string): Recommendation[] {
  return recommendations.filter(r => r.priority === priority)
}

export function getActionableRecommendations(recommendations: Recommendation[]): Recommendation[] {
  return recommendations.filter(r => r.actionable)
}

export function getCriticalRecommendations(recommendations: Recommendation[]): Recommendation[] {
  return recommendations.filter(r => r.priority === 'critical')
}

export default {
  recommend,
  getRecommendationsByType,
  getRecommendationsByPriority,
  getActionableRecommendations,
  getCriticalRecommendations,
}