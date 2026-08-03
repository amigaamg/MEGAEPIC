import { type ClinicalContext, type IntelligenceEvent, type Recommendation, type Prediction, type DifferentialEntry, type KnowledgePack, type ClinicalIntelligenceConfig, IntelligenceDomain, ConfidenceLevel, EvidenceLevel } from './types'
import { observe } from './observation-engine'
import { reason } from './reasoning-engine'
import { predict } from './prediction-engine'
import { prioritizeResults } from './prioritization-engine'
import { recommend } from './recommendation-engine'
import { explain } from './explanation-engine'
import { evaluateConfidence } from './confidence-engine'
import { loadKnowledgePacks } from './knowledge-pack-engine'
import { validateContext } from './validators'
import { emit } from './events'
import { generateDifferentials } from './differential-engine'

const DEFAULT_CONFIG: ClinicalIntelligenceConfig = {
  enableDifferential: true,
  enablePrediction: true,
  enableMonitoring: true,
  enableRecommendations: true,
  enableExplanation: true,
  enableLearning: true,
  confidenceThreshold: 0.5,
  maxDifferentials: 10,
  maxRecommendations: 20,
  patientSafetyOverride: true,
}

let _config = { ...DEFAULT_CONFIG }
let _knowledgePacks: KnowledgePack[] = []
let _observationBuffer: Map<string, Observation[]> = new Map()
let _reasoningLog: Map<string, ReasoningTrace[]> = new Map()
let _decisionTraces: Map<string, DecisionTrace[]> = new Map()

interface Observation {
  id: string
  type: string
  value: unknown
  unit?: string
  timestamp: number
  source: string
  patientId: string
  encounterId?: string
  abnormal?: boolean
  critical?: boolean
}

interface ReasoningTrace {
  id: string
  patientId: string
  stage: string
  input: unknown
  output: unknown
  confidence: number
  evidence: string[]
  timestamp: number
}

interface DecisionTrace {
  id: string
  recommendationId: string
  patientId: string
  decision: string
  confidence: number
  evidence: string[]
  guidelines: string[]
  timestamp: number
  reproducible: boolean
}

export function initializeIntelligence(config?: Partial<ClinicalIntelligenceConfig>): void {
  _config = { ...DEFAULT_CONFIG, ...config }
  _knowledgePacks = loadKnowledgePacks()
}

export function getConfig(): ClinicalIntelligenceConfig {
  return { ..._config }
}

export async function processClinicalEvent(
  event: IntelligenceEvent,
  context: ClinicalContext,
): Promise<{ success: boolean; events: IntelligenceEvent[]; recommendations: Recommendation[]; predictions: Prediction[]; differentials: DifferentialEntry[]; explanations: import('./explanation-engine').Explanation[]; confidence: ConfidenceLevel; context: ClinicalContext }> {
  const validation = validateContext(context)
  if (!validation.valid) {
    return { success: false, events: [], recommendations: [], predictions: [], differentials: [], explanations: [], confidence: ConfidenceLevel.Low, context }
  }

  const observations = await observe(event, context)
  const reasoning = await reason(observations, context)
  const confidence = evaluateConfidence(reasoning)
  const differentials = _config.enableDifferential ? await generateDifferentials(observations, context) : []
  const predictions = _config.enablePrediction ? await predict(observations, context) : []
  const recommendations = _config.enableRecommendations ? await recommend(observations, context, differentials, predictions) : []
  const explanations = _config.enableExplanation ? await explain(recommendations, context) : []
  const prioritized = prioritizeResults(recommendations, predictions, differentials)

  const result = {
    success: true,
    events: observations.map(o => ({ id: o.id, type: 'observation_recorded', category: IntelligenceDomain.History, source: 'intelligence-engine', timestamp: Date.now(), payload: o, priority: 'normal' as const, version: '1.0.0' })),
    recommendations: prioritized.recommendations,
    predictions: prioritized.predictions,
    differentials: prioritized.differentials,
    explanations: prioritized.explanations,
    confidence,
    context,
  }

  await emit('IntelligenceProcessed', { event, context, result })

  return result
}

export async function getDifferentialForPatient(patientId: string, context: ClinicalContext): Promise<DifferentialEntry[]> {
  const observations = _observationBuffer.get(patientId) || []
  return generateDifferentials(observations, context)
}

export async function getRecommendationsForPatient(patientId: string, context: ClinicalContext): Promise<Recommendation[]> {
  const observations = _observationBuffer.get(patientId) || []
  const differentials = await generateDifferentials(observations, context)
  const predictions = await predict(observations, context)
  return recommend(observations, context, differentials, predictions)
}

export async function getPredictionsForPatient(patientId: string, context: ClinicalContext): Promise<Prediction[]> {
  const observations = _observationBuffer.get(patientId) || []
  return predict(observations, context)
}

export async function getExplanation(recommendationId: string, context: ClinicalContext): Promise<import('./explanation-engine').Explanation> {
  const recommendations = await getRecommendationsForPatient(context.currentPatient || '', context)
  const rec = recommendations.find(r => r.id === recommendationId)
  if (!rec) {
    return { recommendationId, why: 'Recommendation not found', evidence: [], guidelines: [], riskFactors: [], confidence: 0, alternatives: [], patientContext: context }
  }
  return await explain([rec], context)[0]
}

export function addKnowledgePack(pack: KnowledgePack): void {
  _knowledgePacks.push(pack)
  emit('KnowledgePackLoaded', { pack })
}

export function removeKnowledgePack(packId: string): void {
  _knowledgePacks = _knowledgePacks.filter(p => p.id !== packId)
  emit('KnowledgePackRemoved', { packId })
}

export function getKnowledgePacks(): KnowledgePack[] {
  return [..._knowledgePacks]
}

export function updateConfig(config: Partial<ClinicalIntelligenceConfig>): void {
  _config = { ..._config, ...config }
  emit('ConfigUpdated', { config: _config })
}

export function getReasoningLog(patientId?: string): ReasoningTrace[] {
  if (patientId) {
    return _reasoningLog.get(patientId) || []
  }
  return Array.from(_reasoningLog.values()).flat()
}

export function getDecisionTraces(patientId?: string): DecisionTrace[] {
  if (patientId) {
    return _decisionTraces.get(patientId) || []
  }
  return Array.from(_decisionTraces.values()).flat()
}

export function clearPatientData(patientId: string): void {
  _observationBuffer.delete(patientId)
  _reasoningLog.delete(patientId)
  _decisionTraces.delete(patientId)
}

export function getKnowledgePacksBySource(source: string): KnowledgePack[] {
  return _knowledgePacks.filter(p => p.source === source)
}

export function getKnowledgePacksByCountry(country: string): KnowledgePack[] {
  return _knowledgePacks.filter(p => p.country === country)
}

export function getKnowledgePacksByOrganization(orgId: string): KnowledgePack[] {
  return _knowledgePacks.filter(p => p.organization === orgId)
}

export function getKnowledgePacksBySpecialty(specialty: string): KnowledgePack[] {
  return _knowledgePacks.filter(p => p.specialty === specialty)
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

export function getActiveKnowledgePacks(): KnowledgePack[] {
  const now = Date.now()
  return _knowledgePacks.filter(p => p.status === 'published' && p.effectiveDate <= now && (!p.expiryDate || p.expiryDate >= now))
}

export function getKnowledgePackVersionHistory(packId: string): KnowledgePack[] {
  return _knowledgePacks.filter(p => p.id === packId).sort((a, b) => b.effectiveDate - a.effectiveDate)
}

export function auditKnowledgePackChange(packId: string, action: string, user: string): void {
  emit('KnowledgePackAudit', { packId, action, user, timestamp: Date.now() })
}

export function getIntelligenceStats(): {
  totalKnowledgePacks: number
  activeKnowledgePacks: number
  totalObservations: number
  totalRecommendations: number
  totalPredictions: number
  totalDifferentials: number
  averageConfidence: number
} {
  const activePacks = getActiveKnowledgePacks()
  const allObs = Array.from(_observationBuffer.values()).flat()
  return {
    totalKnowledgePacks: _knowledgePacks.length,
    activeKnowledgePacks: activePacks.length,
    totalObservations: allObs.length,
    totalRecommendations: 0,
    totalPredictions: 0,
    totalDifferentials: 0,
    averageConfidence: 0,
  }
}

export default {
  initializeIntelligence,
  getConfig,
  processClinicalEvent,
  getDifferentialForPatient,
  getRecommendationsForPatient,
  getPredictionsForPatient,
  getExplanation,
  addKnowledgePack,
  removeKnowledgePack,
  getKnowledgePacks,
  updateConfig,
  getReasoningLog,
  getDecisionTraces,
  clearPatientData,
  getKnowledgePacksBySource,
  getKnowledgePacksByCountry,
  getKnowledgePacksByOrganization,
  getKnowledgePacksBySpecialty,
  validateKnowledgePack,
  getActiveKnowledgePacks,
  getKnowledgePackVersionHistory,
  auditKnowledgePackChange,
  getIntelligenceStats,
}