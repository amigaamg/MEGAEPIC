import EvidenceEngine from '../evidence-engine'
import { EvidenceLevel } from '../types'

describe('EvidenceEngine', () => {
  test('should get evidence sources', () => {
    const sources = EvidenceEngine.getEvidenceSources()

    expect(sources.length).toBeGreaterThan(0)
  })

  test('should get evidence source by ID', () => {
    const source = EvidenceEngine.getEvidenceSourceById('who')

    expect(source).toBeDefined()
    expect(source!.name).toBe('World Health Organization')
  })

  test('should get evidence entries by level', () => {
    const entries = EvidenceEngine.getEvidenceByLevel(EvidenceLevel.LevelA)

    expect(entries.length).toBeGreaterThan(0)
    expect(entries[0].id).toBeDefined()
    expect(entries[0].level).toBe(EvidenceLevel.LevelA)
  })

  test('should validate evidence entries', () => {
    const source = EvidenceEngine.getEvidenceSourceById('who')!
    const result = EvidenceEngine.validateEvidence({
      id: 'ev_who',
      source,
      level: EvidenceLevel.LevelA,
      summary: 'WHO guideline',
      findings: [],
      conclusion: 'Evidence available',
      quality: 'high',
      lastUpdated: Date.now(),
    })

    expect(result.valid).toBe(true)
  })
})
