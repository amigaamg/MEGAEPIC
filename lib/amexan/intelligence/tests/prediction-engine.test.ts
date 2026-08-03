import PredictionEngine from '../prediction-engine'
import { type ClinicalContext, type Observation } from '../types'

describe('PredictionEngine', () => {
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

  test('should predict outcomes from observations', async () => {
    const observations: Observation[] = [
      {
        id: 'obs-1',
        type: 'symptom',
        value: 'chest pain',
        patientId: 'patient-1',
        timestamp: Date.now(),
        source: 'patient',
        abnormal: true,
      },
    ]

    const result = await PredictionEngine.predict(observations, context)

    expect(result.length).toBeGreaterThan(0)
    expect(result[0].id).toBeDefined()
    expect(result[0].probability).toBeGreaterThan(0)
  })

  test('should return empty predictions for empty observations', async () => {
    const result = await PredictionEngine.predict([], context)

    expect(result).toEqual([])
  })

  test('should predict readmission risk', async () => {
    const observations: Observation[] = [
      {
        id: 'obs-1',
        type: 'symptom',
        value: 'chest pain',
        patientId: 'patient-1',
        timestamp: Date.now(),
        source: 'patient',
        abnormal: true,
      },
    ]

    const result = await PredictionEngine.predictReadmission('patient-1', observations)

    expect(result.riskFactors).toBeDefined()
    expect(result.probability).toBeGreaterThan(0)
  })
})
