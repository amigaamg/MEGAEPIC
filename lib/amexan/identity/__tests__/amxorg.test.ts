import { describe, it, expect } from 'vitest'
import {
  generateAmxOrg,
  validateAmxOrg,
  parseAmxOrg,
  isAmxOrg,
  isHospitalOrg,
  isClinicOrg,
  isUniversityOrg,
  isInsuranceOrg,
  isGovernmentOrg,
  isResearchOrg,
  getParentOrgId,
  AMX_ORG_PREFIXES,
} from '@/lib/amexan/identity/amxorg'

describe('AMXORG Generation', () => {
  it('generates valid ORGs for all types', () => {
    for (const type of ['organization','hospital','clinic','university','insurance','ngo','government','research','corporate','pharmacy','laboratory','telemedicine'] as const) {
      const orgId = generateAmxOrg(type, 'US')
      expect(validateAmxOrg(orgId)).toBe(true)
    }
  })

  it('uses default organization type', () => {
    const orgId = generateAmxOrg(undefined, 'US')
    const parsed = parseAmxOrg(orgId)
    expect(parsed?.type).toBe('organization')
  })

  it('includes country code when provided', () => {
    const orgId = generateAmxOrg('hospital', 'US')
    const parsed = parseAmxOrg(orgId)
    expect(parsed?.country).toBe('US')
  })

  it('generates unique ORGs', () => {
    const orgs = new Set<string>()
    for (let i = 0; i < 50; i++) orgs.add(generateAmxOrg('hospital', 'US'))
    expect(orgs.size).toBe(50)
  })
})

describe('AMXORG Validation', () => {
  it('rejects invalid prefixes', () => {
    expect(validateAmxOrg('AMX-XXX-00000000-ABCD')).toBe(false)
  })

  it('rejects malformed structure', () => {
    expect(validateAmxOrg('AMX-HOS-00000000')).toBe(false)
  })

  it('rejects non-string input', () => {
    expect(validateAmxOrg(null as unknown as string)).toBe(false)
  })
})

describe('AMXORG Parsing', () => {
  it('parses valid ORG with correct type', () => {
    const orgId = generateAmxOrg('hospital', 'US')
    const parsed = parseAmxOrg(orgId)
    expect(parsed).not.toBeNull()
    expect(parsed!.type).toBe('hospital')
    expect(parsed!.prefix).toBe('HOS')
    expect(parsed!.timestamp).toBeGreaterThan(0)
    expect(parsed!.country).toBe('US')
  })

  it('returns null for invalid ORG', () => {
    expect(parseAmxOrg('invalid')).toBeNull()
  })
})

describe('AMXORG Type Guards', () => {
  it('isAmxOrg works', () => {
    expect(isAmxOrg(generateAmxOrg('hospital'))).toBe(true)
    expect(isAmxOrg('invalid')).toBe(false)
  })

  it('isHospitalOrg returns true for HOS prefix', () => {
    expect(isHospitalOrg(generateAmxOrg('hospital'))).toBe(true)
    expect(isHospitalOrg(generateAmxOrg('clinic'))).toBe(false)
  })

  it('isClinicOrg returns true for CLI prefix', () => {
    expect(isClinicOrg(generateAmxOrg('clinic'))).toBe(true)
    expect(isClinicOrg(generateAmxOrg('hospital'))).toBe(false)
  })

  it('isUniversityOrg returns true for UNI prefix', () => {
    expect(isUniversityOrg(generateAmxOrg('university'))).toBe(true)
    expect(isUniversityOrg(generateAmxOrg('hospital'))).toBe(false)
  })

  it('isInsuranceOrg returns true for INS prefix', () => {
    expect(isInsuranceOrg(generateAmxOrg('insurance'))).toBe(true)
    expect(isInsuranceOrg(generateAmxOrg('hospital'))).toBe(false)
  })

  it('isGovernmentOrg returns true for GOV prefix', () => {
    expect(isGovernmentOrg(generateAmxOrg('government'))).toBe(true)
    expect(isGovernmentOrg(generateAmxOrg('hospital'))).toBe(false)
  })

  it('isResearchOrg returns true for RES prefix', () => {
    expect(isResearchOrg(generateAmxOrg('research'))).toBe(true)
    expect(isResearchOrg(generateAmxOrg('hospital'))).toBe(false)
  })
})

describe('Parent Org Helper', () => {
  it('getParentOrgId returns undefined for non-AMX identifiers', () => {
    expect(getParentOrgId('not-an-id')).toBeUndefined()
  })

  it('getParentOrgId returns undefined for valid AMX-FID', () => {
    const fid = 'AMX-FAC-00000001-ABCD'
    expect(getParentOrgId(fid)).toBeUndefined()
  })
})
