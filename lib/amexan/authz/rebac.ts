import type { AmxUid } from '../constitution/types'
import type { PatientRelationship } from './types'

const _relationships = new Map<string, PatientRelationship>()

function key(clinicianId: AmxUid, patientId: string): string {
  return `${clinicianId}:${patientId}`
}

export function addRelationship(
  clinicianId: AmxUid,
  patientId: string,
  relationship: PatientRelationship['relationship'],
  expiresAt?: number,
) {
  const rel: PatientRelationship = {
    clinicianId,
    patientId,
    relationship,
    since: Date.now(),
    expiresAt,
  }
  _relationships.set(key(clinicianId, patientId), rel)
  return rel
}

export function removeRelationship(clinicianId: AmxUid, patientId: string) {
  _relationships.delete(key(clinicianId, patientId))
}

export function getPatientRelationship(clinicianId: AmxUid, patientId: string): PatientRelationship['relationship'] {
  const rel = _relationships.get(key(clinicianId, patientId))
  if (!rel) return 'none'
  if (rel.expiresAt && rel.expiresAt < Date.now()) {
    _relationships.delete(key(clinicianId, patientId))
    return 'none'
  }
  return rel.relationship
}

export function getClinicianPatients(clinicianId: AmxUid): PatientRelationship[] {
  const results: PatientRelationship[] = []
  for (const [, rel] of _relationships) {
    if (rel.clinicianId === clinicianId && (!rel.expiresAt || rel.expiresAt > Date.now())) {
      results.push(rel)
    }
  }
  return results
}

export function getPatientClinicians(patientId: string): PatientRelationship[] {
  const results: PatientRelationship[] = []
  for (const [, rel] of _relationships) {
    if (rel.patientId === patientId && (!rel.expiresAt || rel.expiresAt > Date.now())) {
      results.push(rel)
    }
  }
  return results
}

export function updateRelationship(
  clinicianId: AmxUid,
  patientId: string,
  relationship: PatientRelationship['relationship'],
) {
  const existing = _relationships.get(key(clinicianId, patientId))
  if (existing) {
    existing.relationship = relationship
    return existing
  }
  return addRelationship(clinicianId, patientId, relationship)
}
