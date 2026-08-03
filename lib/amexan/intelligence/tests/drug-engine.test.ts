import DrugEngine from '../drug-engine'
import type { DrugRecord } from '../drug-engine'

const aspirin: DrugRecord = {
  id: 'aspirin',
  name: 'Aspirin',
  genericName: 'acetylsalicylic acid',
  category: 'analgesic',
  interactions: [
    {
      drug: 'Warfarin',
      severity: 'major',
      mechanism: 'increased bleeding risk',
      management: 'monitor INR',
    },
  ],
  contraindications: ['peptic ulcer'],
  dosing: { standardDose: '300mg', frequency: 'once daily', route: ['oral'] },
  pregnancy: { category: 'C', riskLevel: 'caution', notes: 'Use only if clearly needed' },
  lactation: { compatible: true, riskLevel: 'safe', notes: 'Generally considered safe' },
  monitoring: ['signs of bleeding'],
  storage: { temperature: 'room temperature', lightSensitive: false },
}

const warfarin: DrugRecord = {
  id: 'warfarin',
  name: 'Warfarin',
  genericName: 'warfarin',
  category: 'anticoagulant',
  interactions: [],
  contraindications: ['pregnancy'],
  dosing: { standardDose: '5mg', frequency: 'once daily', route: ['oral'] },
  pregnancy: { category: 'X', riskLevel: 'contraindicated', notes: 'Teratogenic' },
  lactation: { compatible: true, riskLevel: 'caution', notes: 'Caution advised' },
  monitoring: ['INR'],
  storage: { temperature: 'room temperature', lightSensitive: true },
}

describe('DrugEngine', () => {
  beforeEach(() => {
    DrugEngine.clearDrugDatabase()
    DrugEngine.registerDrug(aspirin)
    DrugEngine.registerDrug(warfarin)
  })

  test('should check drug interactions', () => {
    const interactions = DrugEngine.checkDrugInteractions(['warfarin'], 'aspirin')

    expect(interactions).toBeDefined()
    expect(interactions.length).toBeGreaterThan(0)
    expect(interactions[0].drug).toBe('Warfarin')
  })

  test('should return empty interactions for unrelated drugs', () => {
    const interactions = DrugEngine.checkDrugInteractions(['warfarin'], 'warfarin')

    expect(interactions).toEqual([])
  })

  test('should check drug contraindications', () => {
    const contraindications = DrugEngine.checkContraindications('aspirin', ['peptic ulcer'])

    expect(contraindications).toBeDefined()
    expect(contraindications.length).toBeGreaterThan(0)
  })

  test('should get dosing for patient', () => {
    const dosing = DrugEngine.getDosingForPatient('warfarin')

    expect(dosing).toBeDefined()
    expect(dosing.standardDose).toBe('5mg')
  })
})
