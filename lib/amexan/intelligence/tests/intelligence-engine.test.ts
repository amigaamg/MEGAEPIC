import ClinicalIntelligenceEngine from '../intelligence-engine'
import { type ClinicalContext, type IntelligenceEvent, IntelligenceDomain, ConfidenceLevel } from '../types'

describe('ClinicalIntelligenceEngine', () => {
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
    ClinicalIntelligenceEngine.initializeIntelligence()
  })

  test('should process events and return results', async () => {
    const event: IntelligenceEvent = {
      id: 'evt-1',
      type: 'symptom_reported',
      category: IntelligenceDomain.History,
      source: 'test',
      timestamp: Date.now(),
      payload: { symptom: 'chest pain', severity: 'high' },
      priority: 'critical',
      version: '1.0.0',
    }

    const result = await ClinicalIntelligenceEngine.processClinicalEvent(event, context)

    expect(result.success).toBe(true)
    expect(result.events.length).toBeGreaterThan(0)
    expect(result.recommendations.length).toBeGreaterThanOrEqual(0)
    expect(result.confidence).toBeDefined()
  })

  test('should return low confidence for unremarkable events', async () => {
    const event: IntelligenceEvent = {
      id: 'evt-1',
      type: 'routine_review',
      category: IntelligenceDomain.History,
      source: 'test',
      timestamp: Date.now(),
      payload: { note: 'routine' },
      priority: 'normal',
      version: '1.0.0',
    }

    const result = await ClinicalIntelligenceEngine.processClinicalEvent(event, context)

    expect(result.success).toBe(true)
    expect(result.confidence).toBe(ConfidenceLevel.Low)
  })

  test('should get engine stats', () => {
    const stats = ClinicalIntelligenceEngine.getIntelligenceStats()

    expect(stats.totalKnowledgePacks).toBe(0)
    expect(stats.averageConfidence).toBeDefined()
  })

  test('should get configuration', () => {
    const config = ClinicalIntelligenceEngine.getConfig()

    expect(config.confidenceThreshold).toBe(0.5)
    expect(config.enableDifferential).toBe(true)
  })
})
