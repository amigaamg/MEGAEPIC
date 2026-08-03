import DifferentialEngine from '../differential-engine'
import { type ClinicalContext, type Observation } from '../types'

describe('DifferentialEngine', () => {
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

  test('should generate differentials from observations', async () => {
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

    const result = await DifferentialEngine.generateDifferentials(observations, context)

    expect(result.length).toBeGreaterThan(0)
    expect(result[0].diagnosis).toBeDefined()
    expect(result[0].confidence).toBeGreaterThan(0)
  })

  test('should return empty differentials for empty observations', async () => {
    const result = await DifferentialEngine.generateDifferentials([], context)

    expect(result).toEqual([])
  })

  test('should refine differentials with new observations', async () => {
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

    const generated = await DifferentialEngine.generateDifferentials(observations, context)
    const refined = DifferentialEngine.refineDifferentials(generated, {
      id: 'obs-2',
      type: 'symptom',
      value: 'shortness of breath',
      patientId: 'patient-1',
      timestamp: Date.now(),
      source: 'patient',
      abnormal: true,
    })

    expect(refined).toBeDefined()
  })
})
