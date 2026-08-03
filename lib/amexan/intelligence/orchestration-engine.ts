import { type ClinicalContext, type IntelligenceEvent, type Recommendation, type Prediction, type DifferentialEntry, type ClinicalIntelligenceConfig, IntelligenceDomain, ConfidenceLevel, type Observation } from './types'
import { processClinicalEvent } from './intelligence-engine'
import { observe } from './observation-engine'
import { reason } from './reasoning-engine'
import { predict } from './prediction-engine'
import { generateDifferentials } from './differential-engine'
import { recommend } from './recommendation-engine'
import { explain } from './explanation-engine'
import { evaluateConfidence } from './confidence-engine'
import { prioritizeResults } from './prioritization-engine'

export interface OrchestrationResult {
  success: boolean
  events: IntelligenceEvent[]
  recommendations: Recommendation[]
  predictions: Prediction[]
  differentials: DifferentialEntry[]
  explanations: import('./explanation-engine').Explanation[]
  confidence: ConfidenceLevel
  context: ClinicalContext
  processingTimeMs: number
}

export async function orchestrateIntelligence(
  events: IntelligenceEvent[],
  context: ClinicalContext,
  config?: Partial<ClinicalIntelligenceConfig>,
): Promise<OrchestrationResult> {
  const startTime = Date.now()
  const results: OrchestrationResult = {
    success: false,
    events: [],
    recommendations: [],
    predictions: [],
    differentials: [],
    explanations: [],
    confidence: ConfidenceLevel.Low,
    context,
    processingTimeMs: 0,
  }

  try {
    for (const event of events) {
      const observationResults = await observe(event, context)
      results.events.push(...observationResults.map(o => ({
        id: o.id,
        type: 'observation_recorded',
        category: IntelligenceDomain.History,
        source: 'orchestration-engine',
        timestamp: Date.now(),
        payload: o,
        priority: 'normal' as const,
        version: '1.0.0',
      })))
    }

    const reasoningResults = await reason(
      results.events
        .filter(e => e.category === IntelligenceDomain.History)
        .map(e => e.payload as Observation),
      context,
    )

    const observations = results.events
      .filter(e => e.category === IntelligenceDomain.History)
      .map(e => e.payload as Observation)

    const differentials = await generateDifferentials(observations, context)
    results.differentials = differentials

    const predictions = await predict(observations, context)
    results.predictions = predictions

    const recommendations = await recommend(observations, context, differentials, predictions)
    results.recommendations = recommendations

    const explanations = await explain(recommendations, context)
    results.explanations = explanations

    const confidence = evaluateConfidence(reasoningResults)
    results.confidence = confidence

    const prioritized = prioritizeResults(recommendations, predictions, differentials)
    results.recommendations = prioritized.recommendations
    results.predictions = prioritized.predictions
    results.differentials = prioritized.differentials
    results.explanations = prioritized.explanations

    results.success = true
  } catch (error) {
    results.success = false
  }

  results.processingTimeMs = Date.now() - startTime

  return results
}

export async function orchestrateForPatient(
  patientId: string,
  context: ClinicalContext,
  config?: Partial<ClinicalIntelligenceConfig>,
): Promise<OrchestrationResult> {
  const enrichedContext = { ...context, currentPatient: patientId }
  return orchestrateIntelligence([], enrichedContext, config)
}

export async function orchestrateForEncounter(
  encounterId: string,
  context: ClinicalContext,
  config?: Partial<ClinicalIntelligenceConfig>,
): Promise<OrchestrationResult> {
  const enrichedContext = { ...context, encounterId }
  return orchestrateIntelligence([], enrichedContext, config)
}

export function getOrchestrationStats(): {
  totalOrchestrations: number
  averageProcessingTimeMs: number
  successRate: number
} {
  return {
    totalOrchestrations: 0,
    averageProcessingTimeMs: 0,
    successRate: 1,
  }
}

export default {
  orchestrateIntelligence,
  orchestrateForPatient,
  orchestrateForEncounter,
  getOrchestrationStats,
}