import type { AmxUid } from '../constitution/types'
import type { FhirPatient, FhirEncounter, FhirObservation } from './types'

export interface LocalPatient {
  id: string
  name: string
  givenName: string
  familyName: string
  gender: string
  dateOfBirth: string
  phone: string
  email: string
  address: { city: string; country: string; line: string[] }
  identifiers: { type: string; value: string }[]
}

export interface LocalEncounter {
  id: string
  patientId: string
  status: string
  classCode: string
  classDisplay: string
  type: { code: string; display: string }[]
  periodStart: number
  periodEnd?: number
  location: string
  participants: { id: string; name: string }[]
}

export interface LocalObservation {
  id: string
  patientId: string
  encounterId?: string
  code: string
  codeDisplay: string
  value: number
  unit: string
  effectiveTime: number
  status: string
  interpretation?: string
  referenceRangeLow?: number
  referenceRangeHigh?: number
}

export function toFhirPatient(patient: LocalPatient): FhirPatient {
  return {
    resourceType: 'Patient',
    id: patient.id,
    identifier: [
      ...patient.identifiers.map(id => ({ system: `urn:${id.type}`, value: id.value })),
      { system: 'urn:amexan:uid', value: patient.id },
    ],
    name: [{ use: 'official', family: patient.familyName, given: [patient.givenName] }],
    gender: patient.gender,
    birthDate: patient.dateOfBirth,
    telecom: [
      { system: 'phone', value: patient.phone, use: 'mobile' },
      { system: 'email', value: patient.email },
    ],
    address: [{ line: patient.address.line, city: patient.address.city, country: patient.address.country }],
  }
}

export function toFhirEncounter(encounter: LocalEncounter): FhirEncounter {
  return {
    resourceType: 'Encounter',
    id: encounter.id,
    status: encounter.status,
    class: { code: encounter.classCode, display: encounter.classDisplay },
    type: [{ coding: encounter.type.map(t => ({ system: 'http://snomed.info/sct', code: t.code, display: t.display })) }],
    subject: { reference: `Patient/${encounter.patientId}` },
    participant: encounter.participants.map(p => ({
      individual: { reference: `Practitioner/${p.id}` },
    })),
    period: {
      start: new Date(encounter.periodStart).toISOString(),
      end: encounter.periodEnd ? new Date(encounter.periodEnd).toISOString() : undefined,
    },
    location: [{ location: { reference: `Location/${encounter.location}` } }],
  }
}

export function toFhirObservation(obs: LocalObservation): FhirObservation {
  return {
    resourceType: 'Observation',
    id: obs.id,
    status: obs.status,
    code: {
      coding: [{ system: 'http://loinc.org', code: obs.code, display: obs.codeDisplay }],
    },
    subject: { reference: `Patient/${obs.patientId}` },
    effectiveDateTime: new Date(obs.effectiveTime).toISOString(),
    valueQuantity: {
      value: obs.value,
      unit: obs.unit,
      system: 'http://unitsofmeasure.org',
      code: obs.unit,
    },
    interpretation: obs.interpretation ? {
      coding: [{ system: 'http://hl7.org/fhir/ValueSet/observation-interpretation', code: obs.interpretation, display: obs.interpretation }],
    } : undefined,
    referenceRange: obs.referenceRangeLow !== undefined ? [{
      low: { value: obs.referenceRangeLow },
      high: obs.referenceRangeHigh !== undefined ? { value: obs.referenceRangeHigh } : undefined,
    }] : undefined,
  }
}

export function fromFhirPatient(fhir: FhirPatient): LocalPatient {
  return {
    id: fhir.id,
    name: fhir.name[0]?.given.join(' ') + ' ' + fhir.name[0]?.family,
    givenName: fhir.name[0]?.given[0] ?? '',
    familyName: fhir.name[0]?.family ?? '',
    gender: fhir.gender,
    dateOfBirth: fhir.birthDate,
    phone: fhir.telecom.find(t => t.system === 'phone')?.value ?? '',
    email: fhir.telecom.find(t => t.system === 'email')?.value ?? '',
    address: { line: fhir.address[0]?.line ?? [], city: fhir.address[0]?.city ?? '', country: fhir.address[0]?.country ?? '' },
    identifiers: fhir.identifier.map(i => ({ type: i.system.split(':').pop() ?? 'unknown', value: i.value })),
  }
}

export function toFhirBundle(resources: (FhirPatient | FhirEncounter | FhirObservation)[]): object {
  return {
    resourceType: 'Bundle',
    type: 'collection',
    entry: resources.map(r => ({
      resource: r,
      fullUrl: `urn:uuid:${r.id}`,
    })),
  }
}
