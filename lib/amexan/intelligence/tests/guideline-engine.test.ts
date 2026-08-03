import GuidelineEngine from '../guideline-engine'
import type { Guideline } from '../guideline-engine'
import { type ClinicalContext, type Observation } from '../types'

describe('GuidelineEngine', () => {
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

  test('should evaluate guideline against observations', () => {
    const guideline: Guideline = {
      id: 'chest_pain_guideline',
      name: 'Chest Pain Guideline',
      organization: 'ACCF/AHA',
      version: '1.0.0',
      effectiveDate: Date.now() - 86400000,
      rules: [
        {
          id: 'rule-1',
          type: 'symptom',
          condition: 'chest pain',
          action: 'Order ECG',
          evidence: 'ACCF/AHA',
          priority: 8,
          effectiveDate: Date.now(),
        },
      ],
      status: 'active',
    }

    GuidelineEngine.addGuideline(guideline)

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

    const result = GuidelineEngine.evaluateGuideline('chest_pain_guideline', observations, context)

    expect(result.matched).toBe(true)
    expect(result.confidence).toBeGreaterThan(0)
  })

  test('should return unmatched result for empty observations', () => {
    const guideline: Guideline = {
      id: 'chest_pain_guideline',
      name: 'Chest Pain Guideline',
      organization: 'ACCF/AHA',
      version: '1.0.0',
      effectiveDate: Date.now() - 86400000,
      rules: [
        {
          id: 'rule-1',
          type: 'symptom',
          condition: 'chest pain',
          action: 'Order ECG',
          evidence: 'ACCF/AHA',
          priority: 8,
          effectiveDate: Date.now(),
        },
      ],
      status: 'active',
    }

    GuidelineEngine.addGuideline(guideline)

    const result = GuidelineEngine.evaluateGuideline('chest_pain_guideline', [], context)

    expect(result.matched).toBe(false)
  })

  test('should get guidelines by country', () => {
    const guideline: Guideline = {
      id: 'us_guideline',
      name: 'US Guideline',
      organization: 'CDC',
      country: 'US',
      version: '1.0.0',
      effectiveDate: Date.now() - 86400000,
      rules: [],
      status: 'active',
    }

    GuidelineEngine.addGuideline(guideline)

    const guidelines = GuidelineEngine.getGuidelinesByCountry('US')

    expect(guidelines.length).toBeGreaterThan(0)
  })
})
