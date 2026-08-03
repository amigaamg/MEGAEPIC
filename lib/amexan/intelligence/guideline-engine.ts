import { type KnowledgePack, type KnowledgeRule, type ClinicalContext } from './types'

export interface Guideline {
  id: string
  name: string
  organization: string
  country?: string
  specialty?: string
  version: string
  effectiveDate: number
  expiryDate?: number
  rules: KnowledgeRule[]
  status: 'active' | 'draft' | 'retired'
}

const guidelines: Guideline[] = []

export function loadGuidelines(packs: KnowledgePack[]): void {
  for (const pack of packs) {
    const guideline: Guideline = {
      id: pack.id,
      name: pack.name,
      organization: pack.source,
      country: pack.country,
      version: pack.version,
      effectiveDate: pack.effectiveDate,
      expiryDate: pack.expiryDate,
      rules: pack.rules,
      status: pack.status === 'published' ? 'active' : 'draft',
    }
    guidelines.push(guideline)
  }
}

export function evaluateGuideline(
  guidelineId: string,
  observations: import('./types').Observation[],
  context: ClinicalContext,
): { matched: boolean; rule?: KnowledgeRule; confidence: number } {
  const guideline = guidelines.find(g => g.id === guidelineId)
  if (!guideline || guideline.status !== 'active') {
    return { matched: false, confidence: 0 }
  }

  for (const rule of guideline.rules) {
    const matches = observations.some(o => matchesRule(rule, o))
    if (matches) {
      return { matched: true, rule, confidence: calculateRuleConfidence(rule) }
    }
  }

  return { matched: false, confidence: 0 }
}

function matchesRule(rule: KnowledgeRule, observation: import('./types').Observation): boolean {
  if (rule.type === observation.type) return true
  if (rule.condition.includes(observation.type)) return true
  return false
}

function calculateRuleConfidence(rule: KnowledgeRule): number {
  const baseConfidence = 0.5
  const evidenceBonus = rule.evidence ? 0.2 : 0
  const priorityBonus = (rule.priority / 10) * 0.2
  return Math.min(0.95, baseConfidence + evidenceBonus + priorityBonus)
}

export function getActiveGuidelines(): Guideline[] {
  const now = Date.now()
  return guidelines.filter(g => g.status === 'active' && g.effectiveDate <= now && (!g.expiryDate || g.expiryDate >= now))
}

export function getGuidelinesByCountry(country: string): Guideline[] {
  return guidelines.filter(g => g.country === country)
}

export function getGuidelinesBySpecialty(specialty: string): Guideline[] {
  return guidelines.filter(g => g.specialty === specialty)
}

export function addGuideline(guideline: Guideline): void {
  const existing = guidelines.findIndex(g => g.id === guideline.id)
  if (existing >= 0) {
    guidelines[existing] = guideline
  } else {
    guidelines.push(guideline)
  }
}

export function removeGuideline(guidelineId: string): void {
  const index = guidelines.findIndex(g => g.id === guidelineId)
  if (index >= 0) {
    guidelines.splice(index, 1)
  }
}

export function updateGuidelineStatus(guidelineId: string, status: Guideline['status']): void {
  const guideline = guidelines.find(g => g.id === guidelineId)
  if (guideline) {
    guideline.status = status
  }
}

export default {
  loadGuidelines,
  evaluateGuideline,
  getActiveGuidelines,
  getGuidelinesByCountry,
  getGuidelinesBySpecialty,
  addGuideline,
  removeGuideline,
  updateGuidelineStatus,
}