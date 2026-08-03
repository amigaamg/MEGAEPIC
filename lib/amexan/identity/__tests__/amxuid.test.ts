import { describe, it, expect } from 'vitest'
import {
  generateAmxUid,
  validateAmxUid,
  parseAmxUid,
  getAmxUidType,
  isPersonUid,
  isOrganizationUid,
  isDeviceUid,
  isSystemUid,
  isAiUid,
} from '@/lib/amexan/identity/amxuid'

describe('AMX-UID Generation', () => {
  it('generates valid UIDs for all types', () => {
    for (const type of ['person','organization','device','ai','system','patient'] as const) {
      expect(validateAmxUid(generateAmxUid(type))).toBe(true)
    }
  })

  it('includes the AMX prefix', () => {
    expect(generateAmxUid('person').startsWith('AMX-')).toBe(true)
  })

  it('uses correct 3-letter prefix for each type', () => {
    expect(generateAmxUid('person').split('-')[1]).toBe('PER')
    expect(generateAmxUid('organization').split('-')[1]).toBe('ORG')
    expect(generateAmxUid('device').split('-')[1]).toBe('DEV')
    expect(generateAmxUid('patient').split('-')[1]).toBe('PAT')
  })

  it('produces unique IDs on repeated calls', () => {
    const ids = new Set<string>()
    for (let i = 0; i < 100; i++) ids.add(generateAmxUid('person'))
    expect(ids.size).toBe(100)
  })

  it('has a 5-part structure with checksum suffix', () => {
    const uid = generateAmxUid('person')
    const parts = uid.split('-')
    expect(parts.length).toBe(5)
    expect(parts[4]).toMatch(/^[A-Z0-9]+$/)
  })
})

describe('AMX-UID Validation', () => {
  it('rejects invalid prefixes', () => {
    expect(validateAmxUid('AMX-XXX-00000000-ABCD')).toBe(false)
  })

  it('rejects missing AMX prefix', () => {
    expect(validateAmxUid('PER-00000000-ABCD')).toBe(false)
  })

  it('rejects non-string input', () => {
    expect(validateAmxUid(null as unknown as string)).toBe(false)
    expect(validateAmxUid(undefined as unknown as string)).toBe(false)
    expect(validateAmxUid(12345 as unknown as string)).toBe(false)
  })

  it('rejects malformed structure', () => {
    expect(validateAmxUid('AMX-PER-00000000')).toBe(false)
    expect(validateAmxUid('AMX-PER-00000000-ABCD-EFGH')).toBe(false)
  })
})

describe('AMX-UID Parsing', () => {
  it('parses type, prefix, and timestamp correctly', () => {
    const uid = generateAmxUid('person')
    const parsed = parseAmxUid(uid)
    expect(parsed).not.toBeNull()
    expect(parsed!.type).toBe('person')
    expect(parsed!.prefix).toBe('PER')
    expect(parsed!.timestamp).toBeGreaterThan(0)
  })

  it('parses all UID types', () => {
    for (const type of ['person','organization','device','ai','system','patient'] as const) {
      const parsed = parseAmxUid(generateAmxUid(type))
      expect(parsed).not.toBeNull()
      expect(parsed!.type).toBe(type)
    }
  })

  it('returns null for invalid UIDs', () => {
    expect(parseAmxUid('not-a-uid')).toBeNull()
    expect(parseAmxUid('AMX-XXX-00000000-ABCD')).toBeNull()
  })
})

describe('AMX-UID Type Guards', () => {
  it('getAmxUidType returns the correct type', () => {
    expect(getAmxUidType(generateAmxUid('person'))).toBe('person')
    expect(getAmxUidType(generateAmxUid('organization'))).toBe('organization')
    expect(getAmxUidType(generateAmxUid('device'))).toBe('device')
    expect(getAmxUidType(generateAmxUid('system'))).toBe('system')
    expect(getAmxUidType(generateAmxUid('patient'))).toBe('patient')
  })

  it('getAmxUidType returns null for invalid UIDs', () => {
    expect(getAmxUidType('invalid')).toBeNull()
  })

  it('isPersonUid returns true for person and patient UIDs', () => {
    expect(isPersonUid(generateAmxUid('person'))).toBe(true)
    expect(isPersonUid(generateAmxUid('patient'))).toBe(true)
    expect(isPersonUid(generateAmxUid('organization'))).toBe(false)
  })

  it('isOrganizationUid returns true for organization UIDs', () => {
    expect(isOrganizationUid(generateAmxUid('organization'))).toBe(true)
    expect(isOrganizationUid(generateAmxUid('person'))).toBe(false)
  })

  it('isDeviceUid returns true for device UIDs', () => {
    expect(isDeviceUid(generateAmxUid('device'))).toBe(true)
    expect(isDeviceUid(generateAmxUid('person'))).toBe(false)
  })

  it('isSystemUid returns true for system UIDs', () => {
    expect(isSystemUid(generateAmxUid('system'))).toBe(true)
    expect(isSystemUid(generateAmxUid('person'))).toBe(false)
  })

  it('isAiUid returns true for AI UIDs', () => {
    expect(isAiUid(generateAmxUid('ai'))).toBe(true)
    expect(isAiUid(generateAmxUid('person'))).toBe(false)
  })
})

