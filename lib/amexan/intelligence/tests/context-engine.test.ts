import ContextEngine from '../context-engine'
import { type ClinicalContext } from '../types'

describe('ContextEngine', () => {
  test('should build and retrieve context', () => {
    const context = ContextEngine.buildClinicalContext({
      currentPatient: 'patient-1',
      currentUser: 'user-1',
      organizationId: 'org-1',
      currentCountry: 'US',
      currentDepartment: 'emergency',
      encounterId: 'encounter-1',
      currentWorkflow: 'triage',
      currentStage: 'assessment',
    })

    expect(context.currentPatient).toBe('patient-1')
    expect(context.organizationId).toBe('org-1')
  })

  test('should merge context updates', () => {
    const baseContext: ClinicalContext = {
      currentPatient: 'patient-1',
      currentUser: 'user-1',
      organizationId: 'org-1',
      currentCountry: 'US',
      currentDepartment: 'emergency',
      encounterId: 'encounter-1',
      currentWorkflow: 'triage',
      currentStage: 'assessment',
    }

    const merged = ContextEngine.mergeContext(baseContext, { currentStage: 'treatment' })

    expect(merged.currentStage).toBe('treatment')
    expect(merged.currentPatient).toBe('patient-1')
  })

  test('should generate a context key', () => {
    const context: ClinicalContext = {
      currentPatient: 'patient-1',
      currentUser: 'user-1',
      organizationId: 'org-1',
      currentCountry: 'US',
      currentDepartment: 'emergency',
      encounterId: 'encounter-1',
      currentWorkflow: 'triage',
      currentStage: 'assessment',
    }

    const key = ContextEngine.getContextKey(context)

    expect(key).toContain('patient-1')
  })

  test('should validate context completeness', () => {
    const context: ClinicalContext = {
      currentPatient: 'patient-1',
      currentUser: 'user-1',
      organizationId: 'org-1',
      currentCountry: 'US',
      currentDepartment: 'emergency',
      encounterId: 'encounter-1',
      currentWorkflow: 'triage',
      currentStage: 'assessment',
    }

    const result = ContextEngine.validateContext(context)
    expect(result.valid).toBe(true)
  })
})
