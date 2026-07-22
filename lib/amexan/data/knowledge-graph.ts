import type { KnowledgeTriple, ProvenanceEntry } from './types'

const _triples = new Map<string, KnowledgeTriple[]>()
const _index = new Map<string, Set<string>>()

function tripleKey(subject: string, predicate: string, object: string): string {
  return `${subject}|${predicate}|${object}`
}

export function addTriple(params: {
  subject: string
  predicate: string
  object: string
  confidence?: number
  provenance?: ProvenanceEntry
  expiresAt?: number
}): KnowledgeTriple {
  const key = tripleKey(params.subject, params.predicate, params.object)
  const existing = findExactTriple(params.subject, params.predicate, params.object)
  if (existing) return existing

  const triple: KnowledgeTriple = {
    id: `tri_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    subject: params.subject,
    predicate: params.predicate,
    object: params.object,
    confidence: params.confidence,
    provenance: params.provenance,
    createdAt: Date.now(),
    expiresAt: params.expiresAt,
  }

  if (!_triples.has(params.subject)) _triples.set(params.subject, [])
  _triples.get(params.subject)!.push(triple)

  if (!_index.has(params.predicate)) _index.set(params.predicate, new Set())
  _index.get(params.predicate)!.add(key)

  return triple
}

function findExactTriple(subject: string, predicate: string, object: string): KnowledgeTriple | undefined {
  return _triples.get(subject)?.find(t => t.predicate === predicate && t.object === object && (!t.expiresAt || t.expiresAt > Date.now()))
}

export function queryTriples(params: {
  subject?: string
  predicate?: string
  object?: string
}): KnowledgeTriple[] {
  let results: KnowledgeTriple[] = []

  if (params.subject) {
    results = _triples.get(params.subject) ?? []
  } else if (params.predicate) {
    const keys = _index.get(params.predicate)
    if (keys) {
      for (const key of keys) {
        const [s] = key.split('|')
        const triples = _triples.get(s) ?? []
        results.push(...triples.filter(t => t.predicate === params.predicate))
      }
    }
  } else {
    for (const [, triples] of _triples) results.push(...triples)
  }

  return results.filter(t => !t.expiresAt || t.expiresAt > Date.now())
}

export function getPatientGraph(patientId: string): KnowledgeTriple[] {
  return queryTriples({ subject: patientId })
}

export function getEntityRelations(entityId: string): { predicates: string[]; objects: string[] } {
  const triples = _triples.get(entityId) ?? []
  return {
    predicates: [...new Set(triples.map(t => t.predicate))],
    objects: [...new Set(triples.map(t => t.object))],
  }
}

export function removeTriple(id: string) {
  for (const [, triples] of _triples) {
    const idx = triples.findIndex(t => t.id === id)
    if (idx >= 0) {
      const removed = triples.splice(idx, 1)[0]
      const key = tripleKey(removed.subject, removed.predicate, removed.object)
      _index.get(removed.predicate)?.delete(key)
      return true
    }
  }
  return false
}

export function getTripleCount(): number {
  let count = 0
  for (const [, triples] of _triples) count += triples.length
  return count
}

export function getPredicates(): string[] {
  return Array.from(_index.keys())
}
