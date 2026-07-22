import type { AmxUid } from '../constitution/types'
import type { DocumentNode } from './types'

const _documents = new Map<string, DocumentNode[]>()
const _currentVersions = new Map<string, string>()

export function createDocument(params: {
  documentId: string
  title: string
  type: string
  content: string
  createdBy: AmxUid
  patientId?: string
  encounterId?: string
  tags?: string[]
}): DocumentNode {
  const doc: DocumentNode = {
    id: `doc_${params.documentId}_v1`,
    documentId: params.documentId,
    title: params.title,
    type: params.type,
    patientId: params.patientId,
    encounterId: params.encounterId,
    content: params.content,
    version: 1,
    createdBy: params.createdBy,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    parentVersionId: undefined,
    changeSummary: 'Initial version',
    status: 'draft',
    tags: params.tags ?? [],
  }

  if (!_documents.has(params.documentId)) _documents.set(params.documentId, [])
  _documents.get(params.documentId)!.push(doc)
  _currentVersions.set(params.documentId, doc.id)
  return doc
}

export function createVersion(params: {
  documentId: string
  content: string
  createdBy: AmxUid
  changeSummary?: string
}): DocumentNode | null {
  const currentId = _currentVersions.get(params.documentId)
  if (!currentId) return null

  const versions = _documents.get(params.documentId) ?? []
  const current = versions.find(v => v.id === currentId)
  if (!current) return null

  const newVersion: DocumentNode = {
    ...current,
    id: `doc_${params.documentId}_v${current.version + 1}`,
    content: params.content,
    version: current.version + 1,
    createdBy: params.createdBy,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    parentVersionId: current.id,
    changeSummary: params.changeSummary ?? `Version ${current.version + 1}`,
    status: 'final',
  }

  current.status = 'superseded'
  versions.push(newVersion)
  _currentVersions.set(params.documentId, newVersion.id)
  return newVersion
}

export function getDocument(documentId: string): DocumentNode | undefined {
  const currentId = _currentVersions.get(documentId)
  if (!currentId) return undefined
  const versions = _documents.get(documentId) ?? []
  return versions.find(v => v.id === currentId)
}

export function getVersionHistory(documentId: string): DocumentNode[] {
  return _documents.get(documentId) ?? []
}

export function getVersion(documentId: string, version: number): DocumentNode | undefined {
  return _documents.get(documentId)?.find(v => v.version === version)
}

export function compareVersions(v1: string, v2: string): {
  added: string[]
  removed: string[]
  changed: string[]
} {
  const lines1 = v1.split('\n')
  const lines2 = v2.split('\n')
  const set1 = new Set(lines1)
  const set2 = new Set(lines2)

  const added = lines2.filter(l => !set1.has(l))
  const removed = lines1.filter(l => !set2.has(l))
  const changed = lines1.filter((l, i) => l !== lines2[i] && l !== undefined && lines2[i] !== undefined)

  return { added, removed, changed }
}

export function amendDocument(documentId: string, content: string, createdBy: AmxUid): DocumentNode | null {
  const doc = createVersion({ documentId, content, createdBy, changeSummary: 'Amendment' })
  if (doc) doc.status = 'amended'
  return doc
}

export function finalizeDocument(documentId: string): DocumentNode | undefined {
  const doc = getDocument(documentId)
  if (doc && doc.status === 'draft') {
    doc.status = 'final'
    doc.updatedAt = Date.now()
  }
  return doc
}

export function listDocuments(patientId?: string, type?: string): DocumentNode[] {
  const all: DocumentNode[] = []
  for (const [, versions] of _documents) {
    for (const v of versions) {
      if (v.status === 'superseded') continue
      if (patientId && v.patientId !== patientId) continue
      if (type && v.type !== type) continue
      all.push(v)
    }
  }
  return all.sort((a, b) => b.createdAt - a.createdAt)
}
