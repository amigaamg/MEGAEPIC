import LearningEngine from '../learning-engine'

describe('LearningEngine', () => {
  beforeEach(() => {
    LearningEngine.clearLearningData()
  })

  test('should learn from configuration', () => {
    const entry = LearningEngine.learnFromConfiguration('org-1', {
      type: 'preference',
      data: { defaultSpecialty: 'cardiology' },
      country: 'US',
      specialty: 'general',
    })

    expect(entry).toBeDefined()
    expect(LearningEngine.getLearnedConfigurations('org-1').length).toBe(1)
  })

  test('should record feedback', () => {
    const entry = LearningEngine.learnFromConfiguration('org-1', {
      type: 'preference',
      data: { defaultSpecialty: 'cardiology' },
      country: 'US',
      specialty: 'general',
    })

    LearningEngine.recordFeedback(entry.id, 'org-1', 'positive')

    const learned = LearningEngine.getLearnedConfigurations('org-1')
    expect(learned[0].feedback).toBe('positive')
    expect(learned[0].applied).toBe(true)
  })

  test('should adapt to a new protocol', () => {
    const entry = LearningEngine.adaptToNewProtocol('org-1', {
      name: 'Sepsis Protocol',
      steps: ['draw labs', 'start antibiotics'],
      rules: ['rule-1'],
    })

    expect(entry.applied).toBe(true)
    expect(entry.type).toBe('protocol')
  })

  test('should clear learning data', () => {
    LearningEngine.learnFromConfiguration('org-1', {
      type: 'preference',
      data: { defaultSpecialty: 'cardiology' },
      country: 'US',
      specialty: 'general',
    })

    LearningEngine.clearLearningData('org-1')

    expect(LearningEngine.getLearnedConfigurations('org-1').length).toBe(0)
  })
})
