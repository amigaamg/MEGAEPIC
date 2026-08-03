import ImagingEngine from '../imaging-engine'

describe('ImagingEngine', () => {
  beforeEach(() => {
    ImagingEngine.clearImagingData()
  })

  test('should suggest imaging studies for a patient', () => {
    const suggestions = ImagingEngine.suggestImaging('patient-1', { currentPatient: 'patient-1' })

    expect(suggestions.length).toBeGreaterThan(0)
    expect(suggestions[0].modality).toBeDefined()
  })

  test('should order and retrieve an imaging order', () => {
    const order = ImagingEngine.orderImaging({
      id: 'img-1',
      modality: 'CT',
      bodyPart: 'Chest',
      patientId: 'patient-1',
      priority: 'routine',
      status: 'ordered',
      orderedAt: Date.now(),
    })

    expect(order).toBeDefined()

    const retrieved = ImagingEngine.getImagingOrder('img-1')
    expect(retrieved).toBeDefined()
    expect(retrieved!.modality).toBe('CT')
  })

  test('should return empty orders for unknown patient', () => {
    const orders = ImagingEngine.getImagingOrdersForPatient('nobody')

    expect(orders).toEqual([])
  })
})
