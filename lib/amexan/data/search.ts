import type { SearchableEntry } from './types'

const _index: SearchableEntry[] = []

export function indexEntry(entry: SearchableEntry) {
  const existing = _index.findIndex(e => e.id === entry.id)
  if (existing >= 0) {
    _index[existing] = { ..._index[existing], ...entry, updatedAt: Date.now() }
  } else {
    _index.push(entry)
  }
}

export function removeFromIndex(id: string) {
  const idx = _index.findIndex(e => e.id === id)
  if (idx >= 0) _index.splice(idx, 1)
}

export function search(query: string, options?: {
  type?: SearchableEntry['type']
  organizationId?: string
  patientId?: string
  limit?: number
}): SearchableEntry[] {
  const q = query.toLowerCase().trim()
  if (!q) return []

  let results = _index.filter(e => {
    if (options?.type && e.type !== options.type) return false
    if (options?.organizationId && e.organizationId !== options.organizationId) return false
    if (options?.patientId && e.patientId !== options.patientId) return false

    return e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.keywords.some(k => k.toLowerCase().includes(q))
  })

  results.sort((a, b) => {
    const aExact = a.title.toLowerCase() === q ? 100 : a.title.toLowerCase().startsWith(q) ? 50 : 0
    const bExact = b.title.toLowerCase() === q ? 100 : b.title.toLowerCase().startsWith(q) ? 50 : 0
    return (bExact + (b.createdAt ?? 0)) - (aExact + (a.createdAt ?? 0))
  })

  if (options?.limit) results = results.slice(0, options.limit)
  return results
}

export function advancedSearch(params: {
  query: string
  types?: SearchableEntry['type'][]
  organizationId?: string
  patientId?: string
  dateFrom?: number
  dateTo?: number
  limit?: number
}): SearchableEntry[] {
  const q = params.query.toLowerCase().trim()
  if (!q && !params.types) return []

  let results = _index.filter(e => {
    if (params.types && !params.types.includes(e.type)) return false
    if (params.organizationId && e.organizationId !== params.organizationId) return false
    if (params.patientId && e.patientId !== params.patientId) return false
    if (params.dateFrom && (e.createdAt ?? 0) < params.dateFrom) return false
    if (params.dateTo && (e.createdAt ?? 0) > params.dateTo) return false
    if (q) {
      return e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.keywords.some(k => k.toLowerCase().includes(q))
    }
    return true
  })

  results.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
  if (params.limit) results = results.slice(0, params.limit)
  return results
}

export function getIndexSize(): number {
  return _index.length
}

export function rebuildIndex(entries: SearchableEntry[]) {
  _index.length = 0
  _index.push(...entries)
}

export function searchByType(type: SearchableEntry['type'], organizationId?: string): SearchableEntry[] {
  return _index.filter(e => e.type === type && (!organizationId || e.organizationId === organizationId))
}
