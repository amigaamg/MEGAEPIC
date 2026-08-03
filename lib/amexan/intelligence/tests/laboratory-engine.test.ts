import LaboratoryEngine from '../laboratory-engine'

describe('LaboratoryEngine', () => {
  beforeEach(() => {
    LaboratoryEngine.clearLabData()
  })

  test('should order and retrieve a lab order', () => {
    const order = LaboratoryEngine.orderLab({
      id: 'lab-1',
      testName: 'Complete Blood Count',
      testCode: 'CBC',
      patientId: 'patient-1',
      priority: 'routine',
      status: 'ordered',
      orderedAt: Date.now(),
    })

    expect(order).toBeDefined()

    const retrieved = LaboratoryEngine.getLabOrder('lab-1')
    expect(retrieved).toBeDefined()
    expect(retrieved!.testName).toBe('Complete Blood Count')
  })

  test('should return empty orders for unknown patient', () => {
    const orders = LaboratoryEngine.getLabOrdersForPatient('nobody')

    expect(orders).toEqual([])
  })

  test('should suggest lab orders', () => {
    const suggestions = LaboratoryEngine.suggestLabOrder('patient-1', { currentPatient: 'patient-1' })

    expect(suggestions.length).toBeGreaterThan(0)
    expect(suggestions[0].testCode).toBeDefined()
  })
})
