import { type KnowledgePack, type ClinicalContext } from './types'

interface LearningEntry {
  id: string
  type: string
  organizationId: string
  country: string
  specialty: string
  data: unknown
  feedback: 'positive' | 'negative' | 'neutral'
  applied: boolean
  timestamp: number
}

const learningStore = new Map<string, LearningEntry[]>()

export function learnFromConfiguration(
  organizationId: string,
  configuration: {
    type: string
    data: unknown
    country: string
    specialty: string
  },
): LearningEntry {
  const entry: LearningEntry = {
    id: `learn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: configuration.type,
    organizationId,
    country: configuration.country,
    specialty: configuration.specialty,
    data: configuration.data,
    feedback: 'neutral',
    applied: false,
    timestamp: Date.now(),
  }

  if (!learningStore.has(organizationId)) {
    learningStore.set(organizationId, [])
  }
  learningStore.get(organizationId)!.push(entry)

  return entry
}

export function recordFeedback(
  entryId: string,
  organizationId: string,
  feedback: 'positive' | 'negative' | 'neutral',
): void {
  const entries = learningStore.get(organizationId) || []
  const entry = entries.find(e => e.id === entryId)
  if (entry) {
    entry.feedback = feedback
    entry.applied = feedback === 'positive'
  }
}

export function getLearnedConfigurations(organizationId: string): LearningEntry[] {
  return learningStore.get(organizationId) || []
}

export function getLearnedConfigurationsByCountry(country: string): LearningEntry[] {
  const results: LearningEntry[] = []
  for (const [, entries] of learningStore) {
    results.push(...entries.filter(e => e.country === country))
  }
  return results
}

export function getLearnedConfigurationsBySpecialty(specialty: string): LearningEntry[] {
  const results: LearningEntry[] = []
  for (const [, entries] of learningStore) {
    results.push(...entries.filter(e => e.specialty === specialty))
  }
  return results
}

export function adaptToNewProtocol(
  organizationId: string,
  protocol: { name: string; steps: string[]; rules: string[] },
): LearningEntry {
  const entry = learnFromConfiguration(organizationId, {
    type: 'protocol',
    data: protocol,
    country: '',
    specialty: '',
  })
  entry.applied = true
  return entry
}

export function adaptToNewGuideline(
  organizationId: string,
  guideline: { name: string; version: string; rules: string[] },
): LearningEntry {
  const entry = learnFromConfiguration(organizationId, {
    type: 'guideline',
    data: guideline,
    country: '',
    specialty: '',
  })
  entry.applied = true
  return entry
}

export function getAdaptationHistory(organizationId: string): LearningEntry[] {
  return learningStore.get(organizationId) || []
}

export function clearLearningData(organizationId?: string): void {
  if (organizationId) {
    learningStore.delete(organizationId)
  } else {
    learningStore.clear()
  }
}

export default {
  learnFromConfiguration,
  recordFeedback,
  getLearnedConfigurations,
  getLearnedConfigurationsByCountry,
  getLearnedConfigurationsBySpecialty,
  adaptToNewProtocol,
  adaptToNewGuideline,
  getAdaptationHistory,
  clearLearningData,
}