import type { AmxUid } from './types'

// AMXORG is the organization-specific identifier in AMEXAN.
// It uniquely identifies legal entities: hospitals, clinics, universities,
// NGOs, insurance companies, government agencies, and more.

export type { AmxUid }

// ── AMXORG Type ──────────────────────────────────────────────────────────────────

export interface AmxOrg {
  readonly __brand: 'AMXORG'
  value: string
}

export type AmxOrgString = string & { readonly __brand: 'AMXORG' }

// ── Organization Type Prefixes ─────────────────────────────────────────────────
// Prefixes map to constitutional organization categories.

export const AMX_ORG_PREFIXES = {
  organization: 'ORG',
  hospital: 'HOS',
  clinic: 'CLI',
  university: 'UNI',
  insurance: 'INS',
  ngo: 'NGO',
  government: 'GOV',
  research: 'RES',
  corporate: 'CPR',
  pharmacy: 'PHA',
  laboratory: 'LAB',
  telemedicine: 'TEL',
} as const

export type AmxOrgType = keyof typeof AMX_ORG_PREFIXES

// ── Checksum ────────────────────────────────────────────────────────────────────

function checksum(input: string): string {
  let sum = 0
  for (let i = 0; i < input.length; i++) sum = (sum + input.charCodeAt(i)) % 36
  return sum.toString(36).toUpperCase()
}

// ── Generation ──────────────────────────────────────────────────────────────────

/**
 * Generate a new AMXORG for an organization.
 * @param type - The organization type (hospital, clinic, university, etc.).
 * @param country - Optional ISO country code for regional context.
 * @returns A valid AmxOrgString.
 */
export function generateAmxOrg(type: AmxOrgType = 'organization', country?: string): AmxOrgString {
  const prefix = AMX_ORG_PREFIXES[type]
  const timestamp = Date.now().toString(36).toUpperCase().padStart(8, '0')
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  const countryCode = country ? country.slice(0, 2).toUpperCase() : ''
  const raw = `AMX-${prefix}-${timestamp}-${countryCode}${rand}`
  return `${raw}-${checksum(raw)}` as AmxOrgString
}

// ── Validation ──────────────────────────────────────────────────────────────────

export function validateAmxOrg(orgId: string): boolean {
  if (typeof orgId !== 'string') return false
  const parts = orgId.split('-')
  if (parts.length !== 5) return false
  if (parts[0] !== 'AMX') return false
  if (!Object.values(AMX_ORG_PREFIXES).includes(parts[1] as any)) return false
  if (!/^[A-Z0-9]{8}$/.test(parts[2])) return false
  const raw = `AMX-${parts[1]}-${parts[2]}-${parts[3]}`
  const expected = checksum(raw)
  return parts[4] === expected
}

// ── Parsing ─────────────────────────────────────────────────────────────────────

const reverseOrgPrefixMap: Record<string, AmxOrgType> = Object.fromEntries(
  Object.entries(AMX_ORG_PREFIXES).map(([k, v]) => [v, k as AmxOrgType]),
)

export function parseAmxOrg(orgId: string): {
  type: AmxOrgType
  prefix: string
  timestamp: number
  country?: string
} | null {
  if (!validateAmxOrg(orgId)) return null

  const parts = orgId.split('-')
  const prefix = parts[1]
  const type = reverseOrgPrefixMap[prefix]
  if (!type) return null

  const timestamp = parseInt(parts[2], 36)
  if (isNaN(timestamp)) return null

  const countrySegment = parts[3]
  const country = countrySegment.length >= 6 ? countrySegment.slice(0, 2) : undefined

  return { type, prefix, timestamp, country }
}

// ── Type Guards ──────────────────────────────────────────────────────────────────

export function isAmxOrg(value: string): value is AmxOrgString {
  return validateAmxOrg(value)
}

export function isHospitalOrg(value: string): boolean {
  return parseAmxOrg(value)?.type === 'hospital'
}

export function isClinicOrg(value: string): boolean {
  return parseAmxOrg(value)?.type === 'clinic'
}

export function isUniversityOrg(value: string): boolean {
  return parseAmxOrg(value)?.type === 'university'
}

export function isInsuranceOrg(value: string): boolean {
  return parseAmxOrg(value)?.type === 'insurance'
}

export function isGovernmentOrg(value: string): boolean {
  return parseAmxOrg(value)?.type === 'government'
}

export function isResearchOrg(value: string): boolean {
  return parseAmxOrg(value)?.type === 'research'
}

// ── Organization Hierarchy Helpers ─────────────────────────────────────────────

/**
 * Extract the parent organization from a facility sub-identifier.
 * Example: AMX-FAC-xxx → AMX-ORG-xxx (if linked)
 */
export function getParentOrgId(fid: string): string | undefined {
  if (!validateAmxFidImport(fid)) return undefined
  return undefined
}

function validateAmxFidImport(fid: string): boolean {
  return fid.startsWith('AMX-') && fid.split('-').length >= 3
}
