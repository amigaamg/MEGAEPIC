import PrioritizationEngine from '../prioritization-engine'
import {
  type Recommendation,
  type Prediction,
  type DifferentialEntry,
  EvidenceLevel,
  ConfidenceLevel,
} from '../types'

describe('PrioritizationEngine', () => {
  test('should prioritize results by priority', () => {
    const recommendations: Recommendation[] = [
      {
        id: 'rec-1',
        type: 'recommendation',
        title: 'Low Priority',
        description: 'Low priority recommendation',
        evidence: 'Evidence',
        evidenceLevel: EvidenceLevel.LevelC,
        guideline: 'Test',
        confidence: 0.5,
        confidenceLevel: ConfidenceLevel.Low,
        reasoning: 'Test reasoning',
        priority: 'low',
        actionable: true,
        source: 'test',
        version: '1.0.0',
      },
      {
        id: 'rec-2',
        type: 'recommendation',
        title: 'Critical Priority',
        description: 'Critical priority recommendation',
        evidence: 'Evidence',
        evidenceLevel: EvidenceLevel.LevelB,
        guideline: 'Test',
        confidence: 0.9,
        confidenceLevel: ConfidenceLevel.High,
        reasoning: 'Test reasoning',
        priority: 'critical',
        actionable: true,
        source: 'test',
        version: '1.0.0',
      },
    ]

    const predictions: Prediction[] = [
      {
        id: 'pred-1',
        type: 'prediction',
        patientId: 'patient-1',
        prediction: 'Condition A',
        probability: 0.3,
        timeframe: '30 days',
        riskFactors: [],
        protectiveFactors: [],
        evidence: 'Evidence',
        confidence: 0.5,
        recommendations: [],
      },
      {
        id: 'pred-2',
        type: 'prediction',
        patientId: 'patient-1',
        prediction: 'Condition B',
        probability: 0.9,
        timeframe: '30 days',
        riskFactors: [],
        protectiveFactors: [],
        evidence: 'Evidence',
        confidence: 0.9,
        recommendations: [],
      },
    ]

    const differentials: DifferentialEntry[] = [
      {
        diagnosis: 'Condition X',
        confidence: 0.3,
        supportingFindings: ['Finding 1'],
        contradictingFindings: [],
        redFlags: [],
        evidence: 'Evidence',
        guideline: 'Test',
      },
      {
        diagnosis: 'Condition Y',
        confidence: 0.9,
        supportingFindings: ['Finding 1', 'Finding 2'],
        contradictingFindings: [],
        redFlags: [],
        evidence: 'Evidence',
        guideline: 'Test',
      },
    ]

    const result = PrioritizationEngine.prioritizeResults(recommendations, predictions, differentials)

    expect(result.recommendations[0].priority).toBe('critical')
    expect(result.predictions[0].probability).toBeGreaterThan(result.predictions[1].probability)
    expect(result.differentials[0].confidence).toBeGreaterThan(result.differentials[1].confidence)
  })

  test('should filter by minimum confidence', () => {
    const items = [
      { id: '1', confidence: 0.9 },
      { id: '2', confidence: 0.5 },
      { id: '3', confidence: 0.3 },
    ]

    const filtered = PrioritizationEngine.filterByMinimumConfidence(items, 0.6)
    expect(filtered.length).toBe(1)
    expect(filtered[0].id).toBe('1')
  })

  test('should get top recommendations', () => {
    const recommendations: Recommendation[] = [
      {
        id: 'rec-1',
        type: 'recommendation',
        title: 'Critical',
        description: 'Critical',
        evidence: 'Evidence',
        evidenceLevel: EvidenceLevel.LevelB,
        guideline: 'Test',
        confidence: 0.9,
        confidenceLevel: ConfidenceLevel.High,
        reasoning: 'Test',
        priority: 'critical',
        actionable: true,
        source: 'test',
        version: '1.0.0',
      },
      {
        id: 'rec-2',
        type: 'recommendation',
        title: 'Low',
        description: 'Low',
        evidence: 'Evidence',
        evidenceLevel: EvidenceLevel.LevelC,
        guideline: 'Test',
        confidence: 0.5,
        confidenceLevel: ConfidenceLevel.Low,
        reasoning: 'Test',
        priority: 'low',
        actionable: true,
        source: 'test',
        version: '1.0.0',
      },
    ]

    const top = PrioritizationEngine.getTopRecommendations(recommendations, 1)
    expect(top.length).toBe(1)
    expect(top[0].priority).toBe('critical')
  })
})
