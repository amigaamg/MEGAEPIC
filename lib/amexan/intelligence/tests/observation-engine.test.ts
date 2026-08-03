import ObservationEngine from '../observation-engine'
import { type ClinicalContext, type IntelligenceEvent, IntelligenceDomain } from '../types'

describe('ObservationEngine', () => {
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

  test('should observe an event and return observations', async () => {
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

    const result = await ObservationEngine.observe(event, context)

    expect(result.length).toBeGreaterThan(0)
    expect(result[0].patientId).toBe('patient-1')
  })

  test('should get observation history', async () => {
    const event: IntelligenceEvent = {
      id: 'evt-1',
      type: 'symptom_reported',
      category: IntelligenceDomain.History,
      source: 'test',
      timestamp: Date.now(),
      payload: { symptom: 'headache', severity: 'medium' },
      priority: 'normal',
      version: '1.0.0',
    }

    await ObservationEngine.observe(event, context)
    const history = ObservationEngine.getObservationsForPatient('patient-1')

    expect(history.length).toBeGreaterThan(0)
  })

  test('should get observations by type', async () => {
    const event: IntelligenceEvent = {
      id: 'evt-1',
      type: 'symptom_reported',
      category: IntelligenceDomain.History,
      source: 'test',
      timestamp: Date.now(),
      payload: { symptom: 'fever', severity: 'high' },
      priority: 'high',
      version: '1.0.0',
    }

    await ObservationEngine.observe(event, context)
    const observations = ObservationEngine.getObservationsForPatient('patient-1')
    const symptoms = observations.filter(o => o.type === 'symptom_reported')

    expect(symptoms.length).toBeGreaterThan(0)
  })

  test('should clear observations', async () => {
    const event: IntelligenceEvent = {
      id: 'evt-1',
      type: 'lab_result',
      category: IntelligenceDomain.History,
      source: 'lab-system',
      timestamp: Date.now(),
      payload: { test: 'CBC', result: 'normal' },
      priority: 'normal',
      version: '1.0.0',
    }

    await ObservationEngine.observe(event, context)
    ObservationEngine.clearObservations('patient-1')

    expect(ObservationEngine.getObservationsForPatient('patient-1').length).toBe(0)
  })
})
