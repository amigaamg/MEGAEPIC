import type { ClinicalEvent, ClinicalEventType, ProvenanceEntry, Snapshot } from './types'

const SNAPSHOT_INTERVAL = 50

const _eventStore = new Map<string, ClinicalEvent[]>()
const _snapshots = new Map<string, Snapshot>()

export function appendEvent(params: {
  patientId: string
  type: ClinicalEventType
  payload: Record<string, unknown>
  provenance: ProvenanceEntry
  encounterId?: string
  tags?: string[]
}): ClinicalEvent {
  const event: ClinicalEvent = {
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    patientId: params.patientId,
    encounterId: params.encounterId,
    type: params.type,
    timestamp: Date.now(),
    payload: params.payload,
    provenance: params.provenance,
    tags: params.tags,
  }

  if (!_eventStore.has(params.patientId)) _eventStore.set(params.patientId, [])
  const events = _eventStore.get(params.patientId)!
  events.push(event)

  if (events.length % SNAPSHOT_INTERVAL === 0) {
    createSnapshot(params.patientId)
  }

  return event
}

export function getPatientTimeline(patientId: string): ClinicalEvent[] {
  return _eventStore.get(patientId)?.slice().sort((a, b) => a.timestamp - b.timestamp) ?? []
}

export function getPatientEventsByType(patientId: string, type: ClinicalEventType): ClinicalEvent[] {
  return getPatientTimeline(patientId).filter(e => e.type === type)
}

export function getEventsForEncounter(encounterId: string): ClinicalEvent[] {
  const results: ClinicalEvent[] = []
  for (const [, events] of _eventStore) {
    for (const e of events) {
      if (e.encounterId === encounterId) results.push(e)
    }
  }
  return results.sort((a, b) => a.timestamp - b.timestamp)
}

export function reconstructState(patientId: string, atTime?: number): Record<string, unknown> {
  const snapshot = getSnapshotBefore(patientId, atTime)
  let state: Record<string, unknown> = snapshot ? { ...snapshot.state } : {}
  const events = getPatientTimeline(patientId).filter(e => {
    if (atTime && e.timestamp > atTime) return false
    if (snapshot && e.timestamp <= snapshot.atTime) return false
    return true
  })

  for (const event of events) {
    applyEventToState(state, event)
  }
  return state
}

function applyEventToState(state: Record<string, unknown>, event: ClinicalEvent) {
  switch (event.type) {
    case 'diagnosis_made':
      state.currentDiagnosis = event.payload
      state.diagnoses = [...((state.diagnoses as unknown[]) ?? []), event.payload]
      break
    case 'vitals_recorded':
      state.latestVitals = { ...(state.latestVitals as Record<string, unknown> ?? {}), ...event.payload as Record<string, unknown> }
      break
    case 'medication_prescribed':
      state.medications = [...((state.medications as unknown[]) ?? []), event.payload]
      break
    case 'medication_administered':
      state.administeredMeds = [...((state.administeredMeds as unknown[]) ?? []), event.payload]
      break
    case 'lab_ordered':
      state.pendingLabs = [...((state.pendingLabs as unknown[]) ?? []), event.payload]
      break
    case 'lab_result_received':
      state.labResults = [...((state.labResults as unknown[]) ?? []), event.payload]
      state.pendingLabs = ((state.pendingLabs as unknown[]) ?? []).filter(
        (l: any) => l.orderId !== (event.payload as any).orderId,
      )
      break
    case 'allergy_recorded':
      state.allergies = [...((state.allergies as unknown[]) ?? []), event.payload]
      break
    case 'state_transition':
      state.currentClinicalState = event.payload
      break
  }
}

function createSnapshot(patientId: string) {
  const events = _eventStore.get(patientId) ?? []
  const snapshot: Snapshot = {
    id: `snap_${patientId}_${Date.now()}`,
    patientId,
    atTime: Date.now(),
    state: reconstructState(patientId),
    version: Math.floor(events.length / SNAPSHOT_INTERVAL),
  }
  _snapshots.set(snapshot.id, snapshot)
}

function getSnapshotBefore(patientId: string, atTime?: number): Snapshot | null {
  const time = atTime ?? Date.now()
  const patientSnapshots = Array.from(_snapshots.values())
    .filter(s => s.patientId === patientId && s.atTime <= time)
    .sort((a, b) => b.atTime - a.atTime)
  return patientSnapshots[0] ?? null
}

export function getEventCount(patientId: string): number {
  return _eventStore.get(patientId)?.length ?? 0
}

export function getAllPatientIds(): string[] {
  return Array.from(_eventStore.keys())
}
