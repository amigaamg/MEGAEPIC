import ExplanationEngine from '../explanation-engine'
import { type ClinicalContext, type Recommendation, EvidenceLevel, ConfidenceLevel } from '../types'

describe('ExplanationEngine', () => {
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

  test('should generate explanations for recommendations', async () => {
    const recommendations: Recommendation[] = [
      {
        id: 'rec-1',
        type: 'recommendation',
        title: 'Order ECG',
        description: 'Chest pain requires cardiac evaluation',
        evidence: 'Symptom: chest pain',
        evidenceLevel: EvidenceLevel.LevelB,
        guideline: 'ACCF/AHA',
        confidence: 0.85,
        confidenceLevel: ConfidenceLevel.High,
        reasoning: 'Chest pain is a cardiac symptom',
        priority: 'high',
        actionable: true,
        source: 'clinical-intelligence',
        version: '1.0.0',
      },
    ]

    const result = await ExplanationEngine.explain(recommendations, context)

    expect(result.length).toBeGreaterThan(0)
    expect(result[0].recommendationId).toBe('rec-1')
    expect(result[0].why).toBeDefined()
  })

  test('should return empty explanations for empty recommendations', async () => {
    const result = await ExplanationEngine.explain([], context)

    expect(result).toEqual([])
  })

  test('should check explanation completeness', async () => {
    const recommendations: Recommendation[] = [
      {
        id: 'rec-1',
        type: 'recommendation',
        title: 'Order ECG',
        description: 'Chest pain requires cardiac evaluation',
        evidence: 'Symptom: chest pain',
        evidenceLevel: EvidenceLevel.LevelB,
        guideline: 'ACCF/AHA',
        confidence: 0.85,
        confidenceLevel: ConfidenceLevel.High,
        reasoning: 'Chest pain is a cardiac symptom',
        priority: 'high',
        actionable: true,
        source: 'clinical-intelligence',
        version: '1.0.0',
      },
    ]

    const explanations = await ExplanationEngine.explain(recommendations, context)
    expect(ExplanationEngine.isExplanationComplete(explanations[0])).toBe(true)
  })
})
