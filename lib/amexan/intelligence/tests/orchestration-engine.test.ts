import OrchestrationEngine from '../orchestration-engine'
import { type ClinicalContext, type IntelligenceEvent, IntelligenceDomain } from '../types'

describe('OrchestrationEngine', () => {
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

  test('should orchestrate intelligence pipeline', async () => {
    const events: IntelligenceEvent[] = [
      {
        id: 'evt-1',
        type: 'symptom_reported',
        category: IntelligenceDomain.History,
        source: 'test',
        timestamp: Date.now(),
        payload: { symptom: 'chest pain', severity: 'high' },
        priority: 'critical',
        version: '1.0.0',
      },
    ]

    const result = await OrchestrationEngine.orchestrateIntelligence(events, context)

    expect(result.success).toBe(true)
    expect(result.processingTimeMs).toBeGreaterThanOrEqual(0)
    expect(result.context.currentPatient).toBe('patient-1')
  })

  test('should orchestrate for a specific patient', async () => {
    const result = await OrchestrationEngine.orchestrateForPatient('patient-1', context)

    expect(result.success).toBe(true)
    expect(result.context.currentPatient).toBe('patient-1')
  })

  test('should orchestrate for a specific encounter', async () => {
    const result = await OrchestrationEngine.orchestrateForEncounter('encounter-1', context)

    expect(result.success).toBe(true)
    expect(result.context.encounterId).toBe('encounter-1')
  })
})
