import { type Observation, type DifferentialEntry, type ClinicalContext, ConfidenceLevel } from './types'

export async function generateDifferentials(
  observations: Observation[],
  context: ClinicalContext,
): Promise<DifferentialEntry[]> {
  const differentials: DifferentialEntry[] = []

  for (const observation of observations) {
    if (observation.critical) {
      differentials.push({
        diagnosis: 'Critical Condition',
        confidence: 0.9,
        supportingFindings: [observation.type, 'critical value'],
        contradictingFindings: [],
        redFlags: ['critical value detected'],
        evidence: 'Clinical observation flagged as critical',
        guideline: 'Emergency protocol',
      })
    }
  }

  const symptomMap = buildSymptomMap(observations)

  for (const [symptom, entries] of Object.entries(symptomMap)) {
    const diff = generateDifferentialForSymptom(symptom, entries, context)
    if (diff) {
      differentials.push(diff)
    }
  }

  return differentials.slice(0, 10)
}

function buildSymptomMap(observations: Observation[]): Map<string, Observation[]> {
  const map = new Map<string, Observation[]>()
  for (const obs of observations) {
    const key = obs.type
    if (!map.has(key)) {
      map.set(key, [])
    }
    map.get(key)!.push(obs)
  }
  return map
}

function generateDifferentialForSymptom(
  symptom: string,
  entries: Observation[],
  context: ClinicalContext,
): DifferentialEntry | null {
  const findings = entries.map(e => `${e.type}: ${JSON.stringify(e.value)}`)

  return {
    diagnosis: `Condition related to ${symptom}`,
    confidence: calculateConfidence(entries),
    supportingFindings: findings,
    contradictingFindings: [],
    redFlags: entries.some(e => e.critical) ? ['Critical observation present'] : [],
    evidence: `Based on ${entries.length} observation(s) for ${symptom}`,
    guideline: context.currentGuidelines?.[0] || 'Standard clinical guidelines',
  }
}

function calculateConfidence(entries: Observation[]): number {
  const criticalCount = entries.filter(e => e.critical).length
  const abnormalCount = entries.filter(e => e.abnormal).length
  const total = entries.length
  if (total === 0) return 0.3
  const criticalRatio = criticalCount / total
  const abnormalRatio = abnormalCount / total
  return Math.min(0.95, 0.3 + criticalRatio * 0.4 + abnormalRatio * 0.25)
}

export function refineDifferentials(
  differentials: DifferentialEntry[],
  newObservation: Observation,
): DifferentialEntry[] {
  for (const diff of differentials) {
    if (newObservation.critical) {
      diff.redFlags.push(`New critical observation: ${newObservation.type}`)
      diff.confidence = Math.min(1, diff.confidence + 0.1)
    }
    if (newObservation.abnormal) {
      diff.supportingFindings.push(`${newObservation.type}: ${JSON.stringify(newObservation.value)}`)
    }
  }
  return differentials.sort((a, b) => b.confidence - a.confidence)
}

export function getDifferentialConfidence(diff: DifferentialEntry): ConfidenceLevel {
  if (diff.confidence >= 0.8) return ConfidenceLevel.High
  if (diff.confidence >= 0.5) return ConfidenceLevel.Moderate
  return ConfidenceLevel.Low
}

export default {
  generateDifferentials,
  refineDifferentials,
  getDifferentialConfidence,
}