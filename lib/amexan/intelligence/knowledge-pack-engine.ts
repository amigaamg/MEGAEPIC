import { type KnowledgePack, type KnowledgeRule, type ClinicalContext } from './types'

const knowledgePacks: KnowledgePack[] = []

export function loadKnowledgePacks(): KnowledgePack[] {
  return [...knowledgePacks]
}

export function registerKnowledgePack(pack: KnowledgePack): void {
  const existing = knowledgePacks.findIndex(p => p.id === pack.id)
  if (existing >= 0) {
    knowledgePacks[existing] = pack
  } else {
    knowledgePacks.push(pack)
  }
}

export function removeKnowledgePack(packId: string): void {
  const index = knowledgePacks.findIndex(p => p.id === packId)
  if (index >= 0) {
    knowledgePacks.splice(index, 1)
  }
}

export function getKnowledgePack(packId: string): KnowledgePack | undefined {
  return knowledgePacks.find(p => p.id === packId)
}

export function getKnowledgePacksBySource(source: string): KnowledgePack[] {
  return knowledgePacks.filter(p => p.source === source)
}

export function getKnowledgePacksByCountry(country: string): KnowledgePack[] {
  return knowledgePacks.filter(p => p.country === country)
}

export function getKnowledgePacksByOrganization(orgId: string): KnowledgePack[] {
  return knowledgePacks.filter(p => p.organization === orgId)
}

export function getKnowledgePacksBySpecialty(specialty: string): KnowledgePack[] {
  return knowledgePacks.filter(p => p.specialty === specialty)
}

export function getActiveKnowledgePacks(): KnowledgePack[] {
  const now = Date.now()
  return knowledgePacks.filter(
    p => p.status === 'published' && p.effectiveDate <= now && (!p.expiryDate || p.expiryDate >= now),
  )
}

export function getKnowledgePackVersionHistory(packId: string): KnowledgePack[] {
  return knowledgePacks
    .filter(p => p.id === packId)
    .sort((a, b) => b.effectiveDate - a.effectiveDate)
}

export function validateKnowledgePack(pack: KnowledgePack): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  if (!pack.id) errors.push('Pack ID is required')
  if (!pack.name) errors.push('Pack name is required')
  if (!pack.version) errors.push('Pack version is required')
  if (!pack.source) errors.push('Pack source is required')
  if (pack.rules.length === 0) errors.push('Pack must contain at least one rule')
  if (pack.effectiveDate > Date.now()) errors.push('Effective date cannot be in the future')
  if (pack.expiryDate && pack.expiryDate < pack.effectiveDate) errors.push('Expiry date must be after effective date')
  return { valid: errors.length === 0, errors }
}

export function addKnowledgeRule(packId: string, rule: KnowledgeRule): void {
  const pack = knowledgePacks.find(p => p.id === packId)
  if (pack) {
    pack.rules.push(rule)
  }
}

export function removeKnowledgeRule(packId: string, ruleId: string): void {
  const pack = knowledgePacks.find(p => p.id === packId)
  if (pack) {
    pack.rules = pack.rules.filter(r => r.id !== ruleId)
  }
}

export function updateKnowledgePackStatus(packId: string, status: KnowledgePack['status']): void {
  const pack = knowledgePacks.find(p => p.id === packId)
  if (pack) {
    pack.status = status
  }
}

export function getAllKnowledgePacks(): KnowledgePack[] {
  return [...knowledgePacks]
}

export function clearKnowledgePacks(): void {
  knowledgePacks.length = 0
}

export default {
  loadKnowledgePacks,
  registerKnowledgePack,
  removeKnowledgePack,
  getKnowledgePack,
  getKnowledgePacksBySource,
  getKnowledgePacksByCountry,
  getKnowledgePacksByOrganization,
  getKnowledgePacksBySpecialty,
  getActiveKnowledgePacks,
  getKnowledgePackVersionHistory,
  validateKnowledgePack,
  addKnowledgeRule,
  removeKnowledgeRule,
  updateKnowledgePackStatus,
  getAllKnowledgePacks,
  clearKnowledgePacks,
}