import { IdentityType, type AmxUid } from './types'

const TYPE_PREFIXES: Record<IdentityType, string> = {
  [IdentityType.Human]: 'PER',
  [IdentityType.Organization]: 'ORG',
  [IdentityType.Device]: 'DEV',
  [IdentityType.AI]: 'AI',
  [IdentityType.System]: 'SYS',
}

function checksum(input: string): string {
  let sum = 0
  for (let i = 0; i < input.length; i++) sum = (sum + input.charCodeAt(i)) % 36
  return sum.toString(36).toUpperCase()
}

export function generateAmxUid(type: IdentityType): AmxUid {
  const prefix = TYPE_PREFIXES[type]
  const timestamp = Date.now().toString(36).toUpperCase().padStart(8, '0')
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  const raw = `AMX-${prefix}-${timestamp}-${rand}`
  return `${raw}-${checksum(raw)}` as AmxUid
}

export function parseAmxUid(uid: AmxUid): { type: IdentityType; timestamp: number; checksum: string } | null {
  const parts = uid.split('-')
  if (parts.length !== 5 || parts[0] !== 'AMX') return null
  const type = Object.entries(TYPE_PREFIXES).find(([, v]) => v === parts[1])?.[0] as IdentityType | undefined
  if (!type) return null
  const timestamp = parseInt(parts[2], 36)
  if (isNaN(timestamp)) return null
  return { type, timestamp, checksum: parts[4] }
}

export function validateAmxUid(uid: string): uid is AmxUid {
  if (typeof uid !== 'string') return false
  const parsed = parseAmxUid(uid as AmxUid)
  if (!parsed) return false
  const raw = uid.slice(0, -2)
  return uid.endsWith(`-${checksum(raw)}`)
}
