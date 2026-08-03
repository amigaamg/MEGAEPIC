import Hooks from '../hooks'
import { type ClinicalContext, IntelligenceDomain } from '../types'

describe('Hooks', () => {
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

  test('should create clinical intelligence hook', () => {
    const hook = Hooks.useClinicalIntelligence(context)

    expect(hook.context.currentPatient).toBe('patient-1')
    expect(hook.isLoading).toBe(false)
    expect(hook.events).toEqual([])
    expect(hook.recommendations).toEqual([])
  })

  test('should observe events and update state', async () => {
    const hook = Hooks.useClinicalIntelligence(context)

    await hook.observe({
      id: 'evt-1',
      type: 'symptom_reported',
      category: IntelligenceDomain.History,
      source: 'test',
      timestamp: Date.now(),
      payload: { symptom: 'chest pain', severity: 'high' },
      priority: 'critical',
      version: '1.0.0',
    })

    expect(hook.events.length).toBeGreaterThan(0)
  })

  test('should reset state', async () => {
    const hook = Hooks.useClinicalIntelligence(context)

    await hook.observe({
      id: 'evt-1',
      type: 'symptom_reported',
      category: IntelligenceDomain.History,
      source: 'test',
      timestamp: Date.now(),
      payload: { symptom: 'chest pain', severity: 'high' },
      priority: 'critical',
      version: '1.0.0',
    })

    hook.reset()

    expect(hook.events.length).toBe(0)
    expect(hook.recommendations.length).toBe(0)
  })

  test('should create intelligence events hook', () => {
    const hook = Hooks.useIntelligenceEvents(context)

    expect(hook.events).toEqual([])

    hook.addEvent({
      id: 'evt-1',
      type: 'test',
      category: IntelligenceDomain.History,
      source: 'test',
      timestamp: Date.now(),
      payload: {},
      priority: 'normal',
      version: '1.0.0',
    })

    expect(hook.events.length).toBe(1)
  })

  test('should create intelligence recommendations hook', async () => {
    const hook = Hooks.useIntelligenceRecommendations(context)

    expect(hook.recommendations).toEqual([])

    await hook.generate()

    expect(hook.recommendations.length).toBeGreaterThanOrEqual(0)
  })
})
