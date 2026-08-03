import { EvidenceLevel } from './types'

export interface EvidenceSource {
  id: string
  name: string
  type: 'guideline' | 'study' | 'protocol' | 'standard' | 'expert_consensus'
  organization: string
  country?: string
  version: string
  effectiveDate: number
  expiryDate?: number
  url?: string
}

export interface EvidenceEntry {
  id: string
  source: EvidenceSource
  level: EvidenceLevel
  summary: string
  findings: string[]
  conclusion: string
  quality: 'high' | 'moderate' | 'low'
  lastUpdated: number
}

const evidenceSources: EvidenceSource[] = [
  {
    id: 'who',
    name: 'World Health Organization',
    type: 'guideline',
    organization: 'WHO',
    version: '2026.1',
    effectiveDate: new Date('2026-01-01').getTime(),
  },
  {
    id: 'nice',
    name: 'National Institute for Health and Care Excellence',
    type: 'guideline',
    organization: 'NICE',
    country: 'UK',
    version: '2026.1',
    effectiveDate: new Date('2026-01-01').getTime(),
  },
  {
    id: 'cdc',
    name: 'Centers for Disease Control and Prevention',
    type: 'guideline',
    organization: 'CDC',
    country: 'US',
    version: '2026.1',
    effectiveDate: new Date('2026-01-01').getTime(),
  },
  {
    id: 'atls',
    name: 'Advanced Trauma Life Support',
    type: 'protocol',
    organization: 'ATLS',
    version: '11',
    effectiveDate: new Date('2025-01-01').getTime(),
  },
  {
    id: 'acls',
    name: 'Advanced Cardiovascular Life Support',
    type: 'protocol',
    organization: 'AHA',
    version: '2025',
    effectiveDate: new Date('2025-01-01').getTime(),
  },
  {
    id: 'pals',
    name: 'Pediatric Advanced Life Support',
    type: 'protocol',
    organization: 'AHA',
    version: '2025',
    effectiveDate: new Date('2025-01-01').getTime(),
  },
]

export function getEvidenceSources(): EvidenceSource[] {
  return [...evidenceSources]
}

export function getEvidenceSourceById(id: string): EvidenceSource | undefined {
  return evidenceSources.find(s => s.id === id)
}

export function getEvidenceByLevel(level: EvidenceLevel): EvidenceEntry[] {
  return evidenceSources.map(source => ({
    id: `ev_${source.id}`,
    source,
    level,
    summary: `${source.name} - ${source.type}`,
    findings: [],
    conclusion: 'Evidence available',
    quality: source.type === 'guideline' ? 'high' : 'moderate',
    lastUpdated: source.effectiveDate,
  }))
}

export function addEvidenceSource(source: EvidenceSource): void {
  const existing = evidenceSources.findIndex(s => s.id === source.id)
  if (existing >= 0) {
    evidenceSources[existing] = source
  } else {
    evidenceSources.push(source)
  }
}

export function removeEvidenceSource(sourceId: string): void {
  const index = evidenceSources.findIndex(s => s.id === sourceId)
  if (index >= 0) {
    evidenceSources.splice(index, 1)
  }
}

export function validateEvidence(entry: EvidenceEntry): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  if (!entry.source.id) errors.push('Source ID is required')
  if (!entry.level) errors.push('Evidence level is required')
  if (!entry.summary) errors.push('Summary is required')
  if (entry.quality === 'high' && entry.level === EvidenceLevel.ExpertOpinion) {
    errors.push('High quality evidence should not be expert opinion only')
  }
  return { valid: errors.length === 0, errors }
}

export function getEvidenceProvenance(entry: EvidenceEntry): string {
  return `${entry.source.name} (${entry.source.type}) v${entry.source.version}`
}

export default {
  getEvidenceSources,
  getEvidenceSourceById,
  getEvidenceByLevel,
  addEvidenceSource,
  removeEvidenceSource,
  validateEvidence,
  getEvidenceProvenance,
}