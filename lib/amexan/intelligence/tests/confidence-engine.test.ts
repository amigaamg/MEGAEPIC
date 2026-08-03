import ConfidenceEngine from '../confidence-engine'
import { type ClinicalContext, type Recommendation, EvidenceLevel, ConfidenceLevel } from '../types'

describe('ConfidenceEngine', () => {
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

  test('should evaluate confidence from recommendations', () => {
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

    const result = ConfidenceEngine.evaluateConfidence(recommendations)

    expect(result).toBe(ConfidenceLevel.High)
  })

  test('should return low confidence for empty recommendations', () => {
    const result = ConfidenceEngine.evaluateConfidence([])

    expect(result).toBe(ConfidenceLevel.Low)
  })

  test('should assess confidence for a single recommendation', () => {
    const recommendations: Recommendation[] = [
      {
        id: 'rec-1',
        type: 'recommendation',
        title: 'Order ECG',
        description: 'Chest pain requires cardiac evaluation',
        evidence: 'Symptom: chest pain',
        evidenceLevel: EvidenceLevel.LevelA,
        guideline: 'ACCF/AHA',
        confidence: 0.95,
        confidenceLevel: ConfidenceLevel.High,
        reasoning: 'Strong evidence',
        priority: 'critical',
        actionable: true,
        source: 'clinical-intelligence',
        version: '1.0.0',
      },
    ]

    const result = ConfidenceEngine.evaluateConfidence(recommendations)

    expect(result).toBe(ConfidenceLevel.High)
  })
})
