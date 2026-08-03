import { type Observation, type ClinicalContext, ConfidenceLevel, type Prediction } from './types'

export interface PredictionInput {
  patientId: string
  observations: Observation[]
  context: ClinicalContext
  model: string
  timeframe: string
}

const predictionModels = new Map<string, PredictionModel>()

interface PredictionModel {
  id: string
  name: string
  version: string
  inputs: string[]
  outputs: string[]
  algorithm: string
  isActive: boolean
}

export function registerPredictionModel(model: PredictionModel): void {
  predictionModels.set(model.id, model)
}

export function getPredictionModel(modelId: string): PredictionModel | undefined {
  return predictionModels.get(modelId)
}

export function getAllPredictionModels(): PredictionModel[] {
  return Array.from(predictionModels.values())
}

export async function predict(
  observations: Observation[],
  context: ClinicalContext,
): Promise<Prediction[]> {
  const predictions: Prediction[] = []

  for (const observation of observations) {
    if (observation.abnormal) {
      predictions.push({
        id: `pred_${observation.id}_${Date.now()}`,
        type: 'abnormal_trend',
        patientId: observation.patientId,
        prediction: `Abnormal ${observation.type} may indicate worsening condition`,
        probability: 0.65,
        timeframe: '24-48 hours',
        riskFactors: [observation.type, 'abnormal value'],
        protectiveFactors: [],
        evidence: `Observation ${observation.id} is abnormal`,
        confidence: 0.6,
        recommendations: [],
      })
    }

    if (observation.critical) {
      predictions.push({
        id: `pred_crit_${observation.id}_${Date.now()}`,
        type: 'critical_event',
        patientId: observation.patientId,
        prediction: `Critical ${observation.type} detected - immediate intervention likely required`,
        probability: 0.9,
        timeframe: 'immediate',
        riskFactors: [observation.type, 'critical value', 'abnormal'],
        protectiveFactors: [],
        evidence: `Critical observation ${observation.id}`,
        confidence: 0.85,
        recommendations: [],
      })
    }
  }

  return predictions
}

export async function predictReadmission(patientId: string, observations: Observation[]): Promise<Prediction> {
  const abnormalCount = observations.filter(o => o.abnormal).length
  const criticalCount = observations.filter(o => o.critical).length
  const totalCount = observations.length

  const probability = totalCount > 0 ? (abnormalCount * 0.3 + criticalCount * 0.5) / totalCount : 0.2

  return {
    id: `pred_readmit_${patientId}_${Date.now()}`,
    type: 'readmission_risk',
    patientId,
    prediction: probability > 0.5 ? 'High readmission risk' : 'Low readmission risk',
    probability,
    timeframe: '30 days',
    riskFactors: observations.filter(o => o.abnormal).map(o => o.type),
    protectiveFactors: observations.filter(o => !o.abnormal).map(o => o.type),
    evidence: observations.map(o => `${o.type}: ${JSON.stringify(o.value)}`).join('; '),
    confidence: Math.min(0.9, probability + 0.1),
    recommendations: [],
  }
}

export async function predictDeterioration(patientId: string, observations: Observation[]): Promise<Prediction> {
  const trend = calculateDeteriorationTrend(observations)

  return {
    id: `pred_deterioration_${patientId}_${Date.now()}`,
    type: 'clinical_deterioration',
    patientId,
    prediction: trend === 'worsening' ? 'Patient condition may deteriorate' : 'Patient condition appears stable',
    probability: trend === 'worsening' ? 0.7 : 0.2,
    timeframe: '24-72 hours',
    riskFactors: observations.filter(o => o.abnormal || o.critical).map(o => o.type),
    protectiveFactors: observations.filter(o => !o.abnormal && !o.critical).map(o => o.type),
    evidence: observations.map(o => `${o.type}: ${JSON.stringify(o.value)}`).join('; '),
    confidence: trend === 'worsening' ? 0.75 : 0.6,
    recommendations: [],
  }
}

function calculateDeteriorationTrend(observations: Observation[]): 'improving' | 'worsening' | 'stable' {
  if (observations.length < 2) return 'stable'

  const abnormalCount = observations.filter(o => o.abnormal).length
  const criticalCount = observations.filter(o => o.critical).length
  const ratio = (abnormalCount + criticalCount) / observations.length

  if (ratio > 0.5) return 'worsening'
  if (ratio < 0.2) return 'improving'
  return 'stable'
}

export function clearPredictions(patientId?: string): void {
  // Predictions are stateless and generated on demand, no cleanup needed
}

export default {
  registerPredictionModel,
  getPredictionModel,
  getAllPredictionModels,
  predict,
  predictReadmission,
  predictDeterioration,
  clearPredictions,
}