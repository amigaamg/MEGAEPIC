import type { AmxUid } from './types'

// AMXPID is the patient-specific identifier in AMEXAN.
// It follows the universal identifier format with the PAT prefix,
// but adds patient-specific semantics and validation.

export type { AmxUid }

// ── AMXPID Type ──────────────────────────────────────────────────────────────────

export interface AmxPid {
  readonly __brand: 'AMXPID'
  value: string
}

export type AmxPidString = string & { readonly __brand: 'AMXPID' }

// ── Patient Identifier Prefixes ─────────────────────────────────────────────────
// AMXPID uses context-specific prefixes to denote the patient's originating facility
// while remaining globally unique across the platform.

export const AMX_PID_PREFIXES = {
  patient: 'PAT',
} as const

export type AmxPidType = keyof typeof AMX_PID_PREFIXES

// ── Checksum ────────────────────────────────────────────────────────────────────

function checksum(input: string): string {
  let sum = 0
  for (let i = 0; i < input.length; i++) sum = (sum + input.charCodeAt(i)) % 36
  return sum.toString(36).toUpperCase()
}

// ── Generation ──────────────────────────────────────────────────────────────────

/**
 * Generate a new AMXPID for a patient.
 * @param facilityId - Optional facility identifier for local context.
 * @returns A valid AMXPID string.
 */
export function generateAmxPid(facilityId?: string): AmxPidString {
  const prefix = AMX_PID_PREFIXES.patient
  const timestamp = Date.now().toString(36).toUpperCase().padStart(8, '0')
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  const facility = facilityId ? facilityId.slice(0, 4) : ''
  const raw = `AMX-${prefix}-${timestamp}-${facility}${rand}`
  return `${raw}-${checksum(raw)}` as AmxPidString
}

// ── Validation ──────────────────────────────────────────────────────────────────

export function validateAmxPid(pid: string): boolean {
  if (typeof pid !== 'string') return false
  const parts = pid.split('-')
  if (parts.length !== 5) return false
  if (parts[0] !== 'AMX') return false
  if (parts[1] !== 'PAT') return false
  if (!/^[A-Z0-9]{8}$/.test(parts[2])) return false
  const raw = `AMX-${parts[1]}-${parts[2]}-${parts[3]}`
  const expected = checksum(raw)
  return parts[4] === expected
}

// ── Parsing ─────────────────────────────────────────────────────────────────────

export function parseAmxPid(pid: string): {
  type: AmxPidType
  prefix: string
  timestamp: number
  facility?: string
} | null {
  if (!validateAmxPid(pid)) return null

  const parts = pid.split('-')
  const prefix = parts[1]
  const type = prefix === 'PAT' ? 'patient' : null
  if (!type) return null

  const timestamp = parseInt(parts[2], 36)
  if (isNaN(timestamp)) return null

  const facilityIdPart = parts[3]
  const facility = facilityIdPart.length > 6 ? facilityIdPart.slice(0, 4) : undefined

  return { type, prefix, timestamp, facility }
}

// ── Type Guard ───────────────────────────────────────────────────────────────────

export function isAmxPid(value: string): value is AmxPidString {
  return validateAmxPid(value)
}
