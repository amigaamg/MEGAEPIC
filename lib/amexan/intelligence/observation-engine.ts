import { type Observation, type IntelligenceEvent, type ClinicalContext, IntelligenceDomain } from './types'
import { getContextKey } from './context-engine'

const observationBuffer = new Map<string, Observation[]>()

export async function observe(event: IntelligenceEvent, context: ClinicalContext): Promise<Observation[]> {
  const observations = transformEventToObservations(event, context)
  const key = getContextKey(context)

  if (!observationBuffer.has(key)) {
    observationBuffer.set(key, [])
  }

  const existing = observationBuffer.get(key) || []
  observationBuffer.set(key, [...existing, ...observations])

  return observations
}

function transformEventToObservations(event: IntelligenceEvent, context: ClinicalContext): Observation[] {
  const observations: Observation[] = []

  if (event.category === IntelligenceDomain.History) {
    observations.push({
      id: `obs_${event.id}`,
      type: event.type,
      value: event.payload,
      timestamp: event.timestamp,
      source: event.source,
      patientId: context.currentPatient || 'unknown',
      encounterId: context.encounterId,
      abnormal: isAbnormal(event),
      critical: isCritical(event),
    })
  }

  if (event.category === IntelligenceDomain.History) {
    observations.push({
      id: `obs_wf_${event.id}`,
      type: 'workflow_event',
      value: event.payload,
      timestamp: event.timestamp,
      source: event.source,
      patientId: context.currentPatient || 'unknown',
      encounterId: context.encounterId,
      abnormal: false,
      critical: false,
    })
  }

  return observations
}

function isAbnormal(event: IntelligenceEvent): boolean {
  const abnormalTypes = ['CriticalVitalDetected', 'LabResultAbnormal', 'ImagingAbnormal', 'DrugInteractionDetected']
  return abnormalTypes.includes(event.type)
}

function isCritical(event: IntelligenceEvent): boolean {
  return event.priority === 'critical'
}

export function getObservationsForPatient(patientId: string): Observation[] {
  const results: Observation[] = []
  for (const [, observations] of observationBuffer) {
    results.push(...observations.filter(o => o.patientId === patientId))
  }
  return results
}

export function getObservationsForEncounter(encounterId: string): Observation[] {
  const results: Observation[] = []
  for (const [, observations] of observationBuffer) {
    results.push(...observations.filter(o => o.encounterId === encounterId))
  }
  return results
}

export function getRecentObservations(patientId: string, hours: number): Observation[] {
  const cutoff = Date.now() - hours * 60 * 60 * 1000
  return getObservationsForPatient(patientId).filter(o => o.timestamp >= cutoff)
}

export function clearObservations(patientId?: string): void {
  if (patientId) {
    for (const [key, observations] of observationBuffer) {
      observationBuffer.set(key, observations.filter(o => o.patientId !== patientId))
    }
  } else {
    observationBuffer.clear()
  }
}

export default {
  observe,
  getObservationsForPatient,
  getObservationsForEncounter,
  getRecentObservations,
  clearObservations,
}