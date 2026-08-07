// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Patient-Constitution Repository — Engine III Persistence Abstraction
// Same contract as Engines I & II: the kernel never touches storage. Firestore is
// the concrete lane today; Postgres becomes authoritative later, Neo4j a projection.
// ═══════════════════════════════════════════════════════════════════════════════

import type {
  AmxpId,
  PatientIdentity,
  CareService,
  JourneyObject,
  RegistrationState,
} from './types';

export interface PatientRepository {
  /** One lifetime identity per AmxpId, global (patients/{amxpId}). */
  saveIdentity(identity: PatientIdentity): Promise<void>;
  loadIdentity(amxpId: AmxpId): Promise<PatientIdentity | null>;

  /** Journey registry is per-identity (patients/{amxpId}/journeys/{journeyId}). */
  saveJourney(amxpId: AmxpId, journey: JourneyObject): Promise<void>;
  loadJourneys(amxpId: AmxpId): Promise<JourneyObject[]>;

  /** Care services (bookings) are per-identity (patients/{amxpId}/services/{serviceId}). */
  saveCareService(amxpId: AmxpId, service: CareService): Promise<void>;
  loadCareServices(amxpId: AmxpId): Promise<CareService[]>;

  /** Resumable registration flow, one per identity. */
  saveRegistration(amxpId: AmxpId, state: RegistrationState): Promise<void>;
  loadRegistration(amxpId: AmxpId): Promise<RegistrationState | null>;

  /** Search the registry by phone / national ID (dedupe on register). */
  findByPhone?(phone: string): Promise<PatientIdentity | null>;
  findByNationalId?(nationalId: string): Promise<PatientIdentity | null>;
}
