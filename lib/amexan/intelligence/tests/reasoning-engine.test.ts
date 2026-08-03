import ReasoningEngine from '../reasoning-engine'
import { type ClinicalContext, type Observation } from '../types'

describe('ReasoningEngine', () => {
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

  test('should reason from observations', async () => {
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

    const result = await ReasoningEngine.reason(observations, context)

    expect(result.length).toBeGreaterThan(0)
    expect(result[0].id).toBeDefined()
    expect(result[0].type).toBe('symptom')
  })

  test('should return empty results for empty observations', async () => {
    const result = await ReasoningEngine.reason([], context)

    expect(result).toEqual([])
  })

  test('should generate predictions from observations', async () => {
    const observations: Observation[] = [
      {
        id: 'obs-1',
        type: 'symptom',
        value: 'fever',
        patientId: 'patient-1',
        timestamp: Date.now(),
        source: 'patient',
        abnormal: true,
      },
    ]

    const result = await ReasoningEngine.generatePredictions(observations, context)

    expect(result.length).toBeGreaterThan(0)
  })
})
