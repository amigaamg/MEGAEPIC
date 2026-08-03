import { describe, it, expect } from 'vitest'
import {
  generateAmxFid,
  validateAmxFid,
  parseAmxFid,
  isAmxFid,
  isFacilityFid,
  isBranchFid,
  isCampusFid,
  isBuildingFid,
  isDepartmentFid,
  isWardFid,
  AMX_FID_PREFIXES,
} from '@/lib/amexan/identity/amxfid'

describe('AMXFID Generation', () => {
  it('generates valid FIDs for all types', () => {
    for (const type of ['facility','branch','campus','building','department','ward'] as const) {
      const fid = generateAmxFid(type)
      expect(validateAmxFid(fid)).toBe(true)
      expect(fid.startsWith('AMX-')).toBe(true)
    }
  })

  it('includes org-derived segment when orgId provided', () => {
    const orgId = 'AMX-ORG-00000001-ABCD'
    const fid = generateAmxFid('department', orgId)
    expect(fid.startsWith('AMX-DEP-')).toBe(true)
  })

  it('generates unique FIDs', () => {
    const fids = new Set<string>()
    for (let i = 0; i < 50; i++) fids.add(generateAmxFid('department'))
    expect(fids.size).toBe(50)
  })
})

describe('AMXFID Validation', () => {
  it('rejects invalid prefixes', () => {
    expect(validateAmxFid('AMX-XXX-00000000-ABCD')).toBe(false)
  })

  it('rejects malformed structure', () => {
    expect(validateAmxFid('AMX-FAC-00000000')).toBe(false)
  })

  it('rejects non-string input', () => {
    expect(validateAmxFid(null as unknown as string)).toBe(false)
  })
})

describe('AMXFID Parsing', () => {
  it('parses valid FID with correct type', () => {
    const fid = generateAmxFid('facility')
    const parsed = parseAmxFid(fid)
    expect(parsed).not.toBeNull()
    expect(parsed!.type).toBe('facility')
    expect(parsed!.prefix).toBe('FAC')
    expect(parsed!.timestamp).toBeGreaterThan(0)
  })

  it('returns null for invalid FID', () => {
    expect(parseAmxFid('invalid')).toBeNull()
  })
})

describe('AMXFID Type Guards', () => {
  it('isFacilityFid works', () => {
    expect(isFacilityFid(generateAmxFid('facility'))).toBe(true)
    expect(isFacilityFid(generateAmxFid('department'))).toBe(false)
  })

  it('isBranchFid works', () => {
    expect(isBranchFid(generateAmxFid('branch'))).toBe(true)
    expect(isBranchFid(generateAmxFid('facility'))).toBe(false)
  })

  it('isCampusFid works', () => {
    expect(isCampusFid(generateAmxFid('campus'))).toBe(true)
    expect(isCampusFid(generateAmxFid('facility'))).toBe(false)
  })

  it('isBuildingFid works', () => {
    expect(isBuildingFid(generateAmxFid('building'))).toBe(true)
    expect(isBuildingFid(generateAmxFid('facility'))).toBe(false)
  })

  it('isDepartmentFid works', () => {
    expect(isDepartmentFid(generateAmxFid('department'))).toBe(true)
    expect(isDepartmentFid(generateAmxFid('facility'))).toBe(false)
  })

  it('isWardFid works', () => {
    expect(isWardFid(generateAmxFid('ward'))).toBe(true)
    expect(isWardFid(generateAmxFid('facility'))).toBe(false)
  })

  it('isAmxFid is a type guard', () => {
    const fid = generateAmxFid('facility')
    expect(isAmxFid(fid)).toBe(true)
    expect(isAmxFid('not-a-fid')).toBe(false)
  })
})
