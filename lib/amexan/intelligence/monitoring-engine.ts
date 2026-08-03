import { type Observation, type ClinicalContext, ConfidenceLevel } from './types'

export interface VitalSign {
  id: string
  type: string
  value: number
  unit: string
  patientId: string
  encounterId?: string
  timestamp: number
  source: string
  abnormal: boolean
  critical: boolean
  trend?: 'improving' | 'worsening' | 'stable' | 'unknown'
  previousValues?: VitalSign[]
}

export interface RiskScore {
  name: string
  score: number
  maxScore: number
  interpretation: string
  recommendation: string
  thresholds: {
    low: number
    moderate: number
    high: number
    critical: number
  }
}

export interface MonitoringRule {
  id: string
  name: string
  vitalType: string
  condition: 'greater_than' | 'less_than' | 'range' | 'change'
  threshold: number
  secondaryThreshold?: number
  severity: 'warning' | 'critical' | 'emergency'
  action: string
  escalation: string[]
  cooldownMinutes: number
}

const vitalSigns = new Map<string, VitalSign[]>()
const monitoringRules: MonitoringRule[] = []
const riskScores = new Map<string, RiskScore[]>()

export function recordVitalSign(vital: VitalSign): VitalSign {
  if (!vitalSigns.has(vital.patientId)) {
    vitalSigns.set(vital.patientId, [])
  }

  const existing = vitalSigns.get(vital.patientId) || []
  vital.previousValues = existing.slice(-5)
  vitalSigns.get(vital.patientId)!.push(vital)

  return vital
}

export function getVitalSigns(patientId: string): VitalSign[] {
  return vitalSigns.get(patientId) || []
}

export function getLatestVitalSign(patientId: string, type: string): VitalSign | undefined {
  const signs = vitalSigns.get(patientId) || []
  return signs.filter(s => s.type === type).sort((a, b) => b.timestamp - a.timestamp)[0]
}

export function getVitalSignsByType(patientId: string, type: string): VitalSign[] {
  const signs = vitalSigns.get(patientId) || []
  return signs.filter(s => s.type === type)
}

export function calculateTrend(patientId: string, type: string): 'improving' | 'worsening' | 'stable' | 'unknown' {
  const signs = getVitalSignsByType(patientId, type)
  if (signs.length < 2) return 'unknown'

  const recent = signs.slice(-5)
  const first = recent[0].value
  const last = recent[recent.length - 1].value
  const change = last - first

  if (Math.abs(change) < 0.1) return 'stable'
  if (type === 'heartRate' || type === 'bloodPressureSystolic' || type === 'bloodPressureDiastolic') {
    return change > 0 ? 'worsening' : 'improving'
  }
  if (type === 'oxygenSaturation' || type === 'temperature') {
    return change > 0 ? 'improving' : 'worsening'
  }
  return change > 0 ? 'worsening' : 'improving'
}

export function registerMonitoringRule(rule: MonitoringRule): void {
  monitoringRules.push(rule)
}

export function getMonitoringRules(): MonitoringRule[] {
  return [...monitoringRules]
}

export function checkMonitoringRules(patientId: string): Array<{ rule: MonitoringRule; vital: VitalSign }> {
  const alerts: Array<{ rule: MonitoringRule; vital: VitalSign }> = []
  const signs = vitalSigns.get(patientId) || []

  for (const sign of signs) {
    for (const rule of monitoringRules) {
      if (rule.vitalType !== sign.type) continue

      let triggered = false
      if (rule.condition === 'greater_than' && sign.value > rule.threshold) triggered = true
      if (rule.condition === 'less_than' && sign.value < rule.threshold) triggered = true
      if (rule.condition === 'range' && rule.secondaryThreshold !== undefined) {
        if (sign.value < rule.threshold || sign.value > rule.secondaryThreshold) triggered = true
      }

      if (triggered) {
        alerts.push({ rule, vital: sign })
      }
    }
  }

  return alerts
}

export function calculateRiskScore(patientId: string, scoreName: string): RiskScore | undefined {
  const scores = riskScores.get(`${patientId}_${scoreName}`)
  return scores?.[0]
}

export function recordRiskScore(patientId: string, scoreName: string, score: RiskScore): void {
  riskScores.set(`${patientId}_${scoreName}`, [score])
}

export function getAllRiskScores(patientId: string): RiskScore[] {
  const results: RiskScore[] = []
  for (const [key, scores] of riskScores) {
    if (key.startsWith(patientId)) {
      results.push(...scores)
    }
  }
  return results
}

export function clearVitalSigns(patientId?: string): void {
  if (patientId) {
    vitalSigns.delete(patientId)
  } else {
    vitalSigns.clear()
  }
}

export function clearRiskScores(patientId?: string): void {
  if (patientId) {
    for (const key of riskScores.keys()) {
      if (key.startsWith(patientId)) {
        riskScores.delete(key)
      }
    }
  } else {
    riskScores.clear()
  }
}

export default {
  recordVitalSign,
  getVitalSigns,
  getLatestVitalSign,
  getVitalSignsByType,
  calculateTrend,
  registerMonitoringRule,
  getMonitoringRules,
  checkMonitoringRules,
  calculateRiskScore,
  recordRiskScore,
  getAllRiskScores,
  clearVitalSigns,
  clearRiskScores,
}