import MemoryEngine from '../memory-engine'

describe('MemoryEngine', () => {
  beforeEach(() => {
    MemoryEngine.clearMemory('test-org')
  })

  test('should store and retrieve organizational memory', () => {
    MemoryEngine.storeOrganizationalMemory('test-org', {
      country: 'US',
      specialty: 'general',
      type: 'preference',
      key: 'default_specialty',
      value: 'cardiology',
      source: 'test',
      version: '1.0.0',
      confidence: 0.9,
    })

    const result = MemoryEngine.retrieveOrganizationalMemory('test-org', 'default_specialty')

    expect(result).toBeDefined()
    expect(result!.value).toBe('cardiology')
  })

  test('should return undefined for missing key', () => {
    const result = MemoryEngine.retrieveOrganizationalMemory('test-org', 'nonexistent')

    expect(result).toBeUndefined()
  })

  test('should get all memory for an organization', () => {
    MemoryEngine.storeOrganizationalMemory('test-org', {
      country: 'US',
      specialty: 'general',
      type: 'preference',
      key: 'key1',
      value: 'value1',
      source: 'test',
      version: '1.0.0',
    })
    MemoryEngine.storeOrganizationalMemory('test-org', {
      country: 'US',
      specialty: 'general',
      type: 'preference',
      key: 'key2',
      value: 'value2',
      source: 'test',
      version: '1.0.0',
    })

    const all = MemoryEngine.getAllMemory('test-org')
    expect(all.length).toBe(2)
  })

  test('should search memory', () => {
    MemoryEngine.storeOrganizationalMemory('test-org', {
      country: 'US',
      specialty: 'general',
      type: 'preference',
      key: 'searchable_key',
      value: 'searchable_value',
      source: 'test',
      version: '1.0.0',
    })

    const results = MemoryEngine.searchMemory('test-org', 'searchable')
    expect(results.length).toBeGreaterThan(0)
  })

  test('should clear memory for an organization', () => {
    MemoryEngine.storeOrganizationalMemory('test-org', {
      country: 'US',
      specialty: 'general',
      type: 'preference',
      key: 'key1',
      value: 'value1',
      source: 'test',
      version: '1.0.0',
    })

    MemoryEngine.clearMemory('test-org')
    const all = MemoryEngine.getAllMemory('test-org')
    expect(all.length).toBe(0)
  })
})