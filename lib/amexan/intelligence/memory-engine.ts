import { type KnowledgePack, type ClinicalContext } from './types'

interface OrganizationalMemory {
  id: string
  organizationId: string
  country: string
  specialty: string
  type: string
  key: string
  value: unknown
  source: string
  version: string
  effectiveDate: number
  expiryDate?: number
  confidence: number
  lastAccessed: number
  accessCount: number
}

const memoryStore = new Map<string, OrganizationalMemory[]>()

export function storeOrganizationalMemory(
  organizationId: string,
  memory: {
    country: string
    specialty: string
    type: string
    key: string
    value: unknown
    source: string
    version: string
    confidence?: number
  },
): OrganizationalMemory {
  const entry: OrganizationalMemory = {
    id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    organizationId,
    country: memory.country,
    specialty: memory.specialty,
    type: memory.type,
    key: memory.key,
    value: memory.value,
    source: memory.source,
    version: memory.version,
    effectiveDate: Date.now(),
    confidence: memory.confidence || 0.7,
    lastAccessed: Date.now(),
    accessCount: 0,
  }

  if (!memoryStore.has(organizationId)) {
    memoryStore.set(organizationId, [])
  }
  memoryStore.get(organizationId)!.push(entry)

  return entry
}

export function retrieveOrganizationalMemory(
  organizationId: string,
  key: string,
): OrganizationalMemory | undefined {
  const entries = memoryStore.get(organizationId) || []
  const entry = entries.find(e => e.key === key)
  if (entry) {
    entry.lastAccessed = Date.now()
    entry.accessCount++
  }
  return entry
}

export function getAllMemory(organizationId: string): OrganizationalMemory[] {
  return memoryStore.get(organizationId) || []
}

export function getMemoryByType(organizationId: string, type: string): OrganizationalMemory[] {
  const entries = memoryStore.get(organizationId) || []
  return entries.filter(e => e.type === type)
}

export function getMemoryByKey(organizationId: string, key: string): OrganizationalMemory | undefined {
  const entries = memoryStore.get(organizationId) || []
  return entries.find(e => e.key === key)
}

export function searchMemory(organizationId: string, query: string): OrganizationalMemory[] {
  const entries = memoryStore.get(organizationId) || []
  const lowerQuery = query.toLowerCase()
  return entries.filter(
    e =>
      e.key.toLowerCase().includes(lowerQuery) ||
      JSON.stringify(e.value).toLowerCase().includes(lowerQuery) ||
      e.type.toLowerCase().includes(lowerQuery),
  )
}

export function updateMemoryConfidence(
  organizationId: string,
  key: string,
  confidence: number,
): void {
  const entry = retrieveOrganizationalMemory(organizationId, key)
  if (entry) {
    entry.confidence = confidence
  }
}

export function expireOldMemory(organizationId: string, maxAgeDays: number = 365): void {
  const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000
  const entries = memoryStore.get(organizationId) || []
  const valid = entries.filter(e => e.effectiveDate >= cutoff)
  memoryStore.set(organizationId, valid)
}

export function clearMemory(organizationId?: string): void {
  if (organizationId) {
    memoryStore.delete(organizationId)
  } else {
    memoryStore.clear()
  }
}

export default {
  storeOrganizationalMemory,
  retrieveOrganizationalMemory,
  getAllMemory,
  getMemoryByType,
  getMemoryByKey,
  searchMemory,
  updateMemoryConfidence,
  expireOldMemory,
  clearMemory,
}