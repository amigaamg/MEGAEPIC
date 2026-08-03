import type { AmxUid } from './types'

// AMXFID is the facility-specific identifier in AMEXAN.
// It identifies physical locations: branches, campuses, buildings, departments.
// Facility IDs are organization-scoped but globally unique.

export type { AmxUid }

// ── AMXFID Type ──────────────────────────────────────────────────────────────────

export interface AmxFid {
  readonly __brand: 'AMXFID'
  value: string
}

export type AmxFidString = string & { readonly __brand: 'AMXFID' }

// ── Facility Identifier Prefixes ─────────────────────────────────────────────────
// Each prefix maps to a physical facility category within an organization.

export const AMX_FID_PREFIXES = {
  facility: 'FAC',
  branch: 'BRC',
  campus: 'CMP',
  building: 'BLD',
  department: 'DEP',
  ward: 'WRD',
} as const

export type AmxFidType = keyof typeof AMX_FID_PREFIXES

// ── Checksum ────────────────────────────────────────────────────────────────────

function checksum(input: string): string {
  let sum = 0
  for (let i = 0; i < input.length; i++) sum = (sum + input.charCodeAt(i)) % 36
  return sum.toString(36).toUpperCase()
}

// ── Generation ──────────────────────────────────────────────────────────────────

/**
 * Generate a new AMXFID for a facility-level entity.
 * @param type - The facility entity type (facility, branch, campus, building, department, ward).
 * @param orgId - Optional organization ID to link the facility to.
 * @returns A valid AmxFidString.
 */
export function generateAmxFid(type: AmxFidType, orgId?: string): AmxFidString {
  const prefix = AMX_FID_PREFIXES[type]
  const timestamp = Date.now().toString(36).toUpperCase().padStart(8, '0')
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  const org = orgId ? orgId.split('-')[2]?.slice(0, 3).toUpperCase() : ''
  const raw = `AMX-${prefix}-${timestamp}-${org}${rand}`
  return `${raw}-${checksum(raw)}` as AmxFidString
}

// ── Validation ──────────────────────────────────────────────────────────────────

export function validateAmxFid(fid: string): boolean {
  if (typeof fid !== 'string') return false
  const parts = fid.split('-')
  if (parts.length !== 5) return false
  if (parts[0] !== 'AMX') return false
  if (!Object.values(AMX_FID_PREFIXES).includes(parts[1] as any)) return false
  if (!/^[A-Z0-9]{8}$/.test(parts[2])) return false
  const raw = `AMX-${parts[1]}-${parts[2]}-${parts[3]}`
  const expected = checksum(raw)
  return parts[4] === expected
}

// ── Parsing ─────────────────────────────────────────────────────────────────────

const reversePrefixMap: Record<string, AmxFidType> = {
  FAC: 'facility',
  BRC: 'branch',
  CMP: 'campus',
  BLD: 'building',
  DEP: 'department',
  WRD: 'ward',
}

export function parseAmxFid(fid: string): {
  type: AmxFidType
  prefix: string
  timestamp: number
} | null {
  if (!validateAmxFid(fid)) return null

  const parts = fid.split('-')
  const prefix = parts[1]
  const type = reversePrefixMap[prefix]
  if (!type) return null

  const timestamp = parseInt(parts[2], 36)
  if (isNaN(timestamp)) return null

  return { type, prefix, timestamp }
}

// ── Type Guards ──────────────────────────────────────────────────────────────────

export function isAmxFid(value: string): value is AmxFidString {
  return validateAmxFid(value)
}

export function isFacilityFid(value: string): boolean {
  return parseAmxFid(value)?.type === 'facility'
}

export function isBranchFid(value: string): boolean {
  return parseAmxFid(value)?.type === 'branch'
}

export function isCampusFid(value: string): boolean {
  return parseAmxFid(value)?.type === 'campus'
}

export function isBuildingFid(value: string): boolean {
  return parseAmxFid(value)?.type === 'building'
}

export function isDepartmentFid(value: string): boolean {
  return parseAmxFid(value)?.type === 'department'
}

export function isWardFid(value: string): boolean {
  return parseAmxFid(value)?.type === 'ward'
}
