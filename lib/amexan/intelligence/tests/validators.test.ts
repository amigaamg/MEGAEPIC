import Validators from '../validators'
import { type ClinicalContext, type KnowledgePack } from '../types'

describe('Validators', () => {
  test('should validate a complete context', () => {
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

    const result = Validators.validateContext(context)
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
  })

  test('should invalidate context without patient or user', () => {
    const context: ClinicalContext = {
      organizationId: 'org-1',
      currentCountry: 'US',
      currentDepartment: 'emergency',
      encounterId: 'encounter-1',
      currentWorkflow: 'triage',
      currentStage: 'assessment',
    }

    const result = Validators.validateContext(context)
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  test('should validate a knowledge pack', () => {
    const pack: KnowledgePack = {
      id: 'pack-1',
      name: 'Test Pack',
      version: '1.0.0',
      source: 'test',
      country: 'US',
      organization: 'org-1',
      specialty: 'general',
      rules: [
        {
          id: 'rule-1',
          type: 'recommendation',
          condition: 'chest pain',
          action: 'Order ECG',
          evidence: 'test',
          priority: 5,
          effectiveDate: Date.now(),
        },
      ],
      status: 'draft',
      effectiveDate: Date.now(),
    }

    const result = Validators.validateKnowledgePack(pack)
    expect(result.valid).toBe(true)
  })

  test('should invalidate knowledge pack without ID', () => {
    const pack: KnowledgePack = {
      id: '',
      name: 'Test Pack',
      version: '1.0.0',
      source: 'test',
      country: 'US',
      organization: 'org-1',
      specialty: 'general',
      rules: [],
      status: 'draft',
      effectiveDate: Date.now(),
    }

    const result = Validators.validateKnowledgePack(pack)
    expect(result.valid).toBe(false)
  })

  test('should validate confidence value', () => {
    const result = Validators.validateConfidence(0.85)
    expect(result.valid).toBe(true)
  })

  test('should invalidate out-of-range confidence', () => {
    const result = Validators.validateConfidence(1.5)
    expect(result.valid).toBe(false)
  })
})
