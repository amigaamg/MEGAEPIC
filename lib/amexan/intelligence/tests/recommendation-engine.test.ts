import RecommendationEngine from '../recommendation-engine'
import {
  type ClinicalContext,
  type Observation,
  type Recommendation,
  type DifferentialEntry,
  type Prediction,
  EvidenceLevel,
  ConfidenceLevel,
} from '../types'

describe('RecommendationEngine', () => {
  let context: ClinicalContext

  beforeEach(() => {
    context = {
      currentPatient: 'patient-1',
      currentUser: 'user-1',
      organizationId: 'org-1',
      currentCountry: 'US',
      currentDepartment: 'emergency',
      encounterId: 'encounter-1',
      currentWorkflow: 'triage',
      currentStage: 'assessment',
    }
  })

  test('should generate recommendations from observations', async () => {
    const observations: Observation[] = [
      {
        id: 'obs-1',
        type: 'symptom',
        value: 'chest pain',
        patientId: 'patient-1',
        timestamp: Date.now(),
        source: 'patient',
      },
    ]

    const differentials: DifferentialEntry[] = []
    const predictions: Prediction[] = []

    const result = await RecommendationEngine.recommend(observations, context, differentials, predictions)

    expect(result).toBeDefined()
    expect(Array.isArray(result)).toBe(true)
  })

  test('should get recommendations by type', () => {
    const recommendations: Recommendation[] = [
      {
        id: 'rec-1',
        type: 'recommendation',
        title: 'Test',
        description: 'Test',
        evidence: 'Evidence',
        evidenceLevel: EvidenceLevel.LevelB,
        guideline: 'Test',
        confidence: 0.8,
        confidenceLevel: ConfidenceLevel.High,
        reasoning: 'Test',
        priority: 'high',
        actionable: true,
        source: 'test',
        version: '1.0.0',
      },
      {
        id: 'rec-2',
        type: 'diagnostic',
        title: 'Diagnostic',
        description: 'Diagnostic',
        evidence: 'Evidence',
        evidenceLevel: EvidenceLevel.LevelB,
        guideline: 'Test',
        confidence: 0.8,
        confidenceLevel: ConfidenceLevel.High,
        reasoning: 'Test',
        priority: 'high',
        actionable: true,
        source: 'test',
        version: '1.0.0',
      },
    ]

    const recs = RecommendationEngine.getRecommendationsByType(recommendations, 'recommendation')
    expect(recs.length).toBe(1)
    expect(recs[0].type).toBe('recommendation')
  })

  test('should get critical recommendations', () => {
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

    const critical = RecommendationEngine.getCriticalRecommendations(recommendations)
    expect(critical.length).toBe(1)
    expect(critical[0].priority).toBe('critical')
  })
})
