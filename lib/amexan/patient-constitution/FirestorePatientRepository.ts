// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Firestore Patient-Constitution Repository — Engine III (current lane)
// One lifetime identity per AmxpId. Journeys/services/registration are per-identity
// subcollections. All writes sanitised (undefined-safe). Swappable for Postgres
// behind the same PatientRepository interface.
// ═══════════════════════════════════════════════════════════════════════════════

import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { sanitizeForFirestore } from '@/lib/firebase/sanitize';
import type {
  AmxpId,
  CareService,
  JourneyObject,
  PatientIdentity,
  RegistrationState,
} from './types';
import type { PatientRepository } from './repository';

export class FirestorePatientRepository implements PatientRepository {
  private identityDoc(amxpId: AmxpId) {
    return doc(db, 'patient_identities', amxpId);
  }
  private sub(amxpId: AmxpId, name: string) {
    return collection(db, `patient_identities/${amxpId}/${name}`);
  }
  private item(amxpId: AmxpId, name: string, itemId: string) {
    return doc(db, `patient_identities/${amxpId}/${name}`, itemId);
  }

  async saveIdentity(identity: PatientIdentity): Promise<void> {
    await setDoc(this.identityDoc(identity.amxpId), sanitizeForFirestore(identity));
  }
  async loadIdentity(amxpId: AmxpId): Promise<PatientIdentity | null> {
    const snap = await getDoc(this.identityDoc(amxpId));
    return snap.exists() ? (snap.data() as PatientIdentity) : null;
  }

  async saveJourney(amxpId: AmxpId, journey: JourneyObject): Promise<void> {
    await setDoc(this.item(amxpId, 'journeys', journey.id), sanitizeForFirestore(journey));
  }
  async loadJourneys(amxpId: AmxpId): Promise<JourneyObject[]> {
    const snap = await getDocs(this.sub(amxpId, 'journeys'));
    return snap.docs.map((d) => d.data() as JourneyObject);
  }

  async saveCareService(amxpId: AmxpId, service: CareService): Promise<void> {
    await setDoc(this.item(amxpId, 'services', service.id), sanitizeForFirestore(service));
  }
  async loadCareServices(amxpId: AmxpId): Promise<CareService[]> {
    const snap = await getDocs(this.sub(amxpId, 'services'));
    return snap.docs.map((d) => d.data() as CareService);
  }

  async saveRegistration(amxpId: AmxpId, state: RegistrationState): Promise<void> {
    await setDoc(this.item(amxpId, 'registration', 'current'), sanitizeForFirestore(state));
  }
  async loadRegistration(amxpId: AmxpId): Promise<RegistrationState | null> {
    const snap = await getDoc(this.item(amxpId, 'registration', 'current'));
    return snap.exists() ? (snap.data() as RegistrationState) : null;
  }

  /** Registry-wide dedupe scans are meaningful only for the small population of
   *  identifiers we can query; Firestore cannot index arbitrary fields except
   *  via explicit secondary indexes, so these are best-effort and guarded. */
  async findByPhone(phone: string): Promise<PatientIdentity | null> {
    try {
      const snap = await getDocs(
        query(collection(db, 'patient_identities'), where('human.phone', '==', phone))
      );
      return snap.empty ? null : (snap.docs[0].data() as PatientIdentity);
    } catch {
      return null;
    }
  }
  async findByNationalId(nationalId: string): Promise<PatientIdentity | null> {
    try {
      const snap = await getDocs(
        query(collection(db, 'patient_identities'), where('human.nationalId', '==', nationalId))
      );
      return snap.empty ? null : (snap.docs[0].data() as PatientIdentity);
    } catch {
      return null;
    }
  }
}