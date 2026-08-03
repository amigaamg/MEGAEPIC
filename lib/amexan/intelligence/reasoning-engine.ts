import { type ClinicalContext, type Observation, type DifferentialEntry, type Recommendation, type Explanation, ConfidenceLevel, EvidenceLevel, type KnowledgePack, type KnowledgeRule } from './types'
import { getActiveKnowledgePacks } from './knowledge-pack-engine'
import { evaluateGuideline } from './guideline-engine'
import { checkDrugInteractions } from './drug-engine'
import { calculateRiskScore } from './monitoring-engine'

interface ReasoningTrace {
  id: string
  observation: string
  ruleId: string
  confidence: number
  patientId: string
  type: string
  value: unknown
  stage: string
  input: string
  output: string
  evidence: string
  timestamp: number
}

export async function reason(
  observations: Observation[],
  context: ClinicalContext,
): Promise<ReasoningTrace[]> {
  const traces: ReasoningTrace[] = []
  const knowledgePacks = getActiveKnowledgePacks()

  for (const observation of observations) {
    const trace = await reasonObservation(observation, context, knowledgePacks)
    traces.push(trace)
  }

  return traces
}

async function reasonObservation(
  observation: Observation,
  context: ClinicalContext,
  knowledgePacks: KnowledgePack[],
): Promise<ReasoningTrace> {
  const relevantRules = knowledgePacks
    .flatMap(p => p.rules)
    .filter(r => matchesObservation(r, observation))

  const actions = relevantRules.map(r => r.action)
  const evidence = relevantRules.map(r => r.evidence)

  return {
    id: `reason_${observation.id}_${Date.now()}`,
    observation: observation.type,
    ruleId: relevantRules[0]?.id || '',
    confidence: calculateReasoningConfidence(observation, relevantRules),
    patientId: observation.patientId,
    type: observation.type,
    value: observation.value,
    stage: context.currentStage || 'unknown',
    input: JSON.stringify(observation.value),
    output: JSON.stringify({ actions, evidence }),
    evidence: evidence.join('; '),
    timestamp: Date.now(),
  }
}

function matchesObservation(rule: import('./types').KnowledgeRule, observation: Observation): boolean {
  if (rule.type === observation.type) return true
  if (rule.condition.includes(observation.type)) return true
  return false
}

function calculateReasoningConfidence(observation: Observation, rules: import('./types').KnowledgeRule[]): number {
  if (rules.length === 0) return 0.3
  const avgPriority = rules.reduce((sum, r) => sum + r.priority, 0) / rules.length
  const normalizedPriority = avgPriority / 10
  const evidenceCount = rules.filter(r => r.evidence).length
  const evidenceRatio = evidenceCount / Math.max(rules.length, 1)
  return Math.min(0.95, normalizedPriority * 0.5 + evidenceRatio * 0.4 + 0.1)
}

export async function generateDifferentials(
  observations: Observation[],
  context: ClinicalContext,
): Promise<DifferentialEntry[]> {
  const differentials: DifferentialEntry[] = []
  const knowledgePacks = getActiveKnowledgePacks()

  for (const observation of observations) {
    if (observation.critical) {
      differentials.push({
        diagnosis: 'Critical Condition',
        confidence: 0.9,
        supportingFindings: [observation.type, 'critical value'],
        contradictingFindings: [],
        redFlags: ['critical value detected'],
        evidence: 'Clinical observation flagged as critical',
        guideline: 'Emergency protocol',
      })
    }
  }

  for (const pack of knowledgePacks) {
    for (const rule of pack.rules) {
      if (rule.type === 'differential') {
        const match = observations.some(o => matchesObservation(rule, o))
        if (match) {
          differentials.push({
            diagnosis: rule.action,
            confidence: 0.6,
            supportingFindings: observations.map(o => o.type),
            contradictingFindings: [],
            redFlags: [],
            evidence: rule.evidence,
            guideline: pack.name,
          })
        }
      }
    }
  }

  return differentials.slice(0, 10)
}

export async function generateRecommendations(
  observations: Observation[],
  context: ClinicalContext,
  differentials: DifferentialEntry[],
): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = []
  const knowledgePacks = getActiveKnowledgePacks()

  for (const pack of knowledgePacks) {
    for (const rule of pack.rules) {
      if (rule.type === 'recommendation') {
        const match = observations.some(o => matchesObservation(rule, o))
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
            reasoning: `Based on observation matching rule ${rule.id}`,
            priority: rule.priority > 7 ? 'high' : rule.priority > 4 ? 'medium' : 'low',
            actionable: true,
            source: pack.source,
            version: pack.version,
          })
        }
      }
    }
  }

  return recommendations.slice(0, 20)
}

export async function generatePredictions(
  observations: Observation[],
  context: ClinicalContext,
): Promise<import('./types').Prediction[]> {
  const predictions: import('./types').Prediction[] = []

  for (const observation of observations) {
    if (observation.abnormal) {
      predictions.push({
        id: `pred_${observation.id}_${Date.now()}`,
        type: 'abnormal_trend',
        patientId: observation.patientId,
        prediction: `Abnormal ${observation.type} may indicate worsening condition`,
        probability: 0.65,
        timeframe: '24-48 hours',
        riskFactors: [observation.type, 'abnormal value'],
        protectiveFactors: [],
        evidence: `Observation ${observation.id} is abnormal`,
        confidence: 0.6,
        recommendations: [],
      })
    }
  }

  return predictions
}

export async function generateExplanations(
  recommendations: Recommendation[],
  context: ClinicalContext,
): Promise<Explanation[]> {
  return recommendations.map(rec => ({
    recommendationId: rec.id,
    why: rec.reasoning,
    evidence: [rec.evidence],
    guidelines: rec.guideline ? [rec.guideline] : [],
    riskFactors: [],
    confidence: rec.confidence,
    alternatives: rec.alternatives?.map(a => a.title) || [],
    patientContext: context,
  }))
}

export default {
  reason,
  generateDifferentials,
  generateRecommendations,
  generatePredictions,
  generateExplanations,
}