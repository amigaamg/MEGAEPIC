import type { AmxUid } from './types'

// AMX-UID is the universal identifier for all entities in AMEXAN.
// This module provides a single, canonical implementation used across the platform.

export type { AmxUid }

// ── AMX-UID Type Prefixes ───────────────────────────────────────────────────────
// Maps logical type keys to their 3-letter prefixes.

export const AMX_UID_PREFIXES = {
  person: 'PER',
  organization: 'ORG',
  device: 'DEV',
  ai: 'AI',
  system: 'SYS',
  patient: 'PAT',
} as const

export type AmxUidType = keyof typeof AMX_UID_PREFIXES

// ── Checksum ────────────────────────────────────────────────────────────────────
// Simple modular checksum for basic collision detection.

function checksum(input: string): string {
  let sum = 0
  for (let i = 0; i < input.length; i++) sum = (sum + input.charCodeAt(i)) % 36
  return sum.toString(36).toUpperCase()
}

// ── Generation ──────────────────────────────────────────────────────────────────

export function generateAmxUid(type: AmxUidType): string {
  const prefix = AMX_UID_PREFIXES[type]
  const timestamp = Date.now().toString(36).toUpperCase().padStart(8, '0')
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  const raw = `AMX-${prefix}-${timestamp}-${rand}`
  return `${raw}-${checksum(raw)}`
}

// ── Validation ──────────────────────────────────────────────────────────────────

export function validateAmxUid(uid: string): boolean {
  if (typeof uid !== 'string') return false
  const parts = uid.split('-')
  if (parts.length !== 5) return false
  if (parts[0] !== 'AMX') return false
  if (!Object.values(AMX_UID_PREFIXES).includes(parts[1] as any)) return false
  if (!/^[A-Z0-9]{8}$/.test(parts[2])) return false
  const raw = `AMX-${parts[1]}-${parts[2]}-${parts[3]}`
  const expected = checksum(raw)
  return parts[4] === expected
}

// ── Parsing ─────────────────────────────────────────────────────────────────────

export function parseAmxUid(uid: string): { type: AmxUidType; prefix: string; timestamp: number } | null {
  const valid = validateAmxUid(uid)
  if (!valid) return null

  const parts = uid.split('-')
  const prefix = parts[1]
  const reverse: Record<string, AmxUidType> = {
    PER: 'person',
    ORG: 'organization',
    DEV: 'device',
    AI: 'ai',
    SYS: 'system',
    PAT: 'patient',
  }
  const type = reverse[prefix]
  if (!type) return null

  const timestamp = parseInt(parts[2], 36)
  if (isNaN(timestamp)) return null

  return { type, prefix, timestamp }
}

// ── Type-specific helpers ───────────────────────────────────────────────────────

export function getAmxUidType(uid: string): AmxUidType | null {
  const parsed = parseAmxUid(uid)
  return parsed?.type ?? null
}

export function isPersonUid(uid: string): boolean {
  return parseAmxUid(uid)?.type === 'person' || parseAmxUid(uid)?.type === 'patient'
}

export function isOrganizationUid(uid: string): boolean {
  return parseAmxUid(uid)?.type === 'organization'
}

export function isDeviceUid(uid: string): boolean {
  return parseAmxUid(uid)?.type === 'device'
}

export function isSystemUid(uid: string): boolean {
  return parseAmxUid(uid)?.type === 'system'
}

export function isAiUid(uid: string): boolean {
  return parseAmxUid(uid)?.type === 'ai'
}
