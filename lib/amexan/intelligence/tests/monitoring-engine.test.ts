import MonitoringEngine from '../monitoring-engine'

describe('MonitoringEngine', () => {
  beforeEach(() => {
    MonitoringEngine.clearVitalSigns()
    MonitoringEngine.clearRiskScores()
  })

  test('should record and retrieve vital signs', () => {
    MonitoringEngine.recordVitalSign({
      id: 'vs-1',
      type: 'heartRate',
      value: 120,
      unit: 'bpm',
      patientId: 'patient-1',
      timestamp: Date.now(),
      source: 'monitoring-device',
      abnormal: true,
      critical: false,
    })

    const vitals = MonitoringEngine.getVitalSigns('patient-1')

    expect(vitals.length).toBe(1)
    expect(vitals[0].value).toBe(120)
  })

  test('should return empty vitals for unknown patient', () => {
    const vitals = MonitoringEngine.getVitalSigns('nobody')

    expect(vitals).toEqual([])
  })

  test('should check monitoring rules', () => {
    MonitoringEngine.recordVitalSign({
      id: 'vs-1',
      type: 'heartRate',
      value: 120,
      unit: 'bpm',
      patientId: 'patient-1',
      timestamp: Date.now(),
      source: 'monitoring-device',
      abnormal: true,
      critical: false,
    })

    MonitoringEngine.registerMonitoringRule({
      id: 'rule-1',
      name: 'Tachycardia',
      vitalType: 'heartRate',
      condition: 'greater_than',
      threshold: 100,
      severity: 'critical',
      action: 'Notify clinician',
      escalation: ['attending'],
      cooldownMinutes: 5,
    })

    const alerts = MonitoringEngine.checkMonitoringRules('patient-1')

    expect(alerts).toBeDefined()
    expect(alerts.length).toBeGreaterThan(0)
  })
})
