import { type ClinicalContext, type IntelligenceEvent, type Recommendation, type Prediction, type DifferentialEntry, IntelligenceDomain, ConfidenceLevel, EvidenceLevel } from './types'
import { observe } from './observation-engine'
import { reason } from './reasoning-engine'
import { predict } from './prediction-engine'
import { generateDifferentials } from './differential-engine'
import { recommend } from './recommendation-engine'
import { explain } from './explanation-engine'
import { evaluateConfidence } from './confidence-engine'
import { prioritizeResults } from './prioritization-engine'
import { storeOrganizationalMemory } from './memory-engine'
import { getActiveKnowledgePacks } from './knowledge-pack-engine'
import { emitIntelligenceEvent } from './events'

export function useClinicalIntelligence(
  context: ClinicalContext,
  options?: {
    autoObserve?: boolean
    autoPredict?: boolean
    autoRecommend?: boolean
    autoExplain?: boolean
    packId?: string
  },
): {
  context: ClinicalContext
  events: IntelligenceEvent[]
  recommendations: Recommendation[]
  predictions: Prediction[]
  differentials: DifferentialEntry[]
  explanations: import('./explanation-engine').Explanation[]
  confidence: ConfidenceLevel
  isLoading: boolean
  observe: (event: IntelligenceEvent) => Promise<void>
  reason: () => Promise<void>
  predict: () => Promise<void>
  recommend: () => Promise<void>
  explain: () => Promise<void>
  reset: () => void
} {
  const state = {
    context,
    events: [] as IntelligenceEvent[],
    recommendations: [] as Recommendation[],
    predictions: [] as Prediction[],
    differentials: [] as DifferentialEntry[],
    explanations: [] as import('./explanation-engine').Explanation[],
    confidence: ConfidenceLevel.Low,
    isLoading: false,
  }

  async function processEvent(event: IntelligenceEvent): Promise<void> {
    state.isLoading = true
    try {
      const observationResults = await observe(event, state.context)
      state.events.push(...observationResults.map(o => ({
        id: o.id,
        type: 'observation_recorded',
        category: IntelligenceDomain.History,
        source: 'hooks',
        timestamp: Date.now(),
        payload: o,
        priority: 'normal' as const,
        version: '1.0.0',
      })))

      if (options?.autoPredict !== false) {
        const predictions = await predict(observationResults, state.context)
        state.predictions = predictions
      }

      if (options?.autoRecommend !== false) {
        const differentials = await generateDifferentials(observationResults, state.context)
        state.differentials = differentials
        const recs = await recommend(observationResults, state.context, differentials, state.predictions)
        state.recommendations = recs
      }

      if (options?.autoExplain !== false && state.recommendations.length > 0) {
        const explanations = await explain(state.recommendations, state.context)
        state.explanations = explanations
      }

      state.confidence = evaluateConfidence(state.recommendations)

      emitIntelligenceEvent({
        id: `hook_evt_${Date.now()}`,
        type: 'intelligence_processed',
        category: IntelligenceDomain.History,
        source: 'hooks',
        timestamp: Date.now(),
        payload: state,
        priority: 'normal',
        version: '1.0.0',
      })
    } finally {
      state.isLoading = false
    }
  }

  async function runReasoning(): Promise<void> {
    state.isLoading = true
    try {
      const results = await reason(state.events.map(e => e.payload as any), state.context)
      state.confidence = evaluateConfidence(results)
    } finally {
      state.isLoading = false
    }
  }

  async function runPrediction(): Promise<void> {
    state.isLoading = true
    try {
      const predictions = await predict(state.events.map(e => e.payload as any), state.context)
      state.predictions = predictions
      state.confidence = evaluateConfidence(state.recommendations)
    } finally {
      state.isLoading = false
    }
  }

  async function runRecommendation(): Promise<void> {
    state.isLoading = true
    try {
      const differentials = await generateDifferentials(state.events.map(e => e.payload as any), state.context)
      state.differentials = differentials
      const recs = await recommend(state.events.map(e => e.payload as any), state.context, differentials, state.predictions)
      state.recommendations = recs
      state.confidence = evaluateConfidence(recs)
    } finally {
      state.isLoading = false
    }
  }

  async function runExplanation(): Promise<void> {
    state.isLoading = true
    try {
      const explanations = await explain(state.recommendations, state.context)
      state.explanations = explanations
    } finally {
      state.isLoading = false
    }
  }

  function reset(): void {
    state.events = []
    state.recommendations = []
    state.predictions = []
    state.differentials = []
    state.explanations = []
    state.confidence = ConfidenceLevel.Low
    state.isLoading = false
  }

  return {
    context: state.context,
    events: state.events,
    recommendations: state.recommendations,
    predictions: state.predictions,
    differentials: state.differentials,
    explanations: state.explanations,
    confidence: state.confidence,
    isLoading: state.isLoading,
    observe: processEvent,
    reason: runReasoning,
    predict: runPrediction,
    recommend: runRecommendation,
    explain: runExplanation,
    reset,
  }
}

export function useIntelligenceEvents(
  context: ClinicalContext,
): {
  events: IntelligenceEvent[]
  addEvent: (event: IntelligenceEvent) => void
  clearEvents: () => void
} {
  const events: IntelligenceEvent[] = []

  function addEvent(event: IntelligenceEvent): void {
    events.push(event)
    emitIntelligenceEvent(event)
  }

  function clearEvents(): void {
    events.length = 0
  }

  return { events, addEvent, clearEvents }
}

export function useIntelligenceRecommendations(
  context: ClinicalContext,
): {
  recommendations: Recommendation[]
  generate: () => Promise<void>
  clear: () => void
} {
  const recommendations: Recommendation[] = []

  async function generate(): Promise<void> {
    const knowledgePacks = getActiveKnowledgePacks()
    for (const pack of knowledgePacks) {
      for (const rule of pack.rules) {
        if (rule.type === 'recommendation') {
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
            reasoning: `From pack ${pack.name}`,
            priority: rule.priority > 7 ? 'high' : 'medium',
            actionable: true,
            source: pack.source,
            version: pack.version,
          })
        }
      }
    }
  }

  function clear(): void {
    recommendations.length = 0
  }

  return { recommendations, generate, clear }
}

export default {
  useClinicalIntelligence,
  useIntelligenceEvents,
  useIntelligenceRecommendations,
}