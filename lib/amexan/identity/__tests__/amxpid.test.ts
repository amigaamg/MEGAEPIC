import { describe, it, expect } from 'vitest'
import {
  generateAmxPid,
  validateAmxPid,
  parseAmxPid,
  isAmxPid,
  AMX_PID_PREFIXES,
} from '@/lib/amexan/identity/amxpid'

describe('AMXPID Generation', () => {
  it('generates valid PIDs', () => {
    const pid = generateAmxPid()
    expect(validateAmxPid(pid)).toBe(true)
    expect(pid.startsWith('AMX-PAT-')).toBe(true)
  })

  it('includes facility context when provided', () => {
    const pid = generateAmxPid('FACL')
    expect(pid.startsWith('AMX-PAT-')).toBe(true)
    const parsed = parseAmxPid(pid)
    expect(parsed).not.toBeNull()
  })

  it('generates unique PIDs', () => {
    const pids = new Set<string>()
    for (let i = 0; i < 50; i++) pids.add(generateAmxPid())
    expect(pids.size).toBe(50)
  })
})

describe('AMXPID Validation', () => {
  it('rejects non-PAT prefix', () => {
    expect(validateAmxPid('AMX-ORG-00000000-ABCD')).toBe(false)
  })

  it('rejects malformed PID', () => {
    expect(validateAmxPid('AMX-PAT-00000000')).toBe(false)
    expect(validateAmxPid('AMX-PAT-00000000-ABCD-EF')).toBe(false)
  })

  it('rejects non-string input', () => {
    expect(validateAmxPid(null as unknown as string)).toBe(false)
    expect(validateAmxPid(undefined as unknown as string)).toBe(false)
  })
})

describe('AMXPID Parsing', () => {
  it('parses a valid PID correctly', () => {
    const pid = generateAmxPid()
    const parsed = parseAmxPid(pid)
    expect(parsed).not.toBeNull()
    expect(parsed!.type).toBe('patient')
    expect(parsed!.prefix).toBe('PAT')
    expect(parsed!.timestamp).toBeGreaterThan(0)
  })

  it('returns null for invalid PID', () => {
    expect(parseAmxPid('invalid')).toBeNull()
  })
})

describe('AMXPID Type Guards', () => {
  it('isAmxPid returns true for valid PIDs', () => {
    expect(isAmxPid(generateAmxPid())).toBe(true)
  })

  it('isAmxPid returns false for invalid PIDs', () => {
    expect(isAmxPid('not-a-pid')).toBe(false)
  })
})
