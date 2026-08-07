// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Firestore Workforce Repository — Engine II (current persistence lane)
// Persons are global (persons/{personId}); employments/assignments/credentials
// live under the organization (organizations/{orgId}/workforce/{personId}/…).
// All writes sanitised (undefined-safe). Swappable for Postgres later behind the
// same WorkforceRepository interface.
// ═══════════════════════════════════════════════════════════════════════════════

import { collection, doc, getDoc, getDocs, query, setDoc, where, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { sanitizeForFirestore } from '@/lib/firebase/sanitize';
import type {
  Assignment,
  Competency,
  Credential,
  Employment,
  Person,
  ProfessionalIdentity,
} from './constitutional-types';
import type { WorkforceRepository } from './repository';

export class FirestoreWorkforceRepository implements WorkforceRepository {
  constructor(private readonly organizationId?: string) {}

  private personDoc(id: string) {
    return doc(db, 'persons', id);
  }
  private orgColl() {
    return collection(db, `organizations/${this.organizationId}/workforce`);
  }
  private orgDoc(personId: string, sub: string) {
    return doc(db, `organizations/${this.organizationId}/workforce/${personId}/${sub}`);
  }

  async savePerson(person: Person): Promise<void> {
    await setDoc(this.personDoc(person.id), sanitizeForFirestore(person));
  }
  async loadPerson(personId: string): Promise<Person | null> {
    const snap = await getDoc(this.personDoc(personId));
    return snap.exists() ? (snap.data() as Person) : null;
  }

  async saveIdentity(identity: ProfessionalIdentity): Promise<void> {
    await setDoc(this.orgDoc(identity.personId, 'identity'), sanitizeForFirestore(identity));
  }
  async loadIdentity(personId: string): Promise<ProfessionalIdentity | null> {
    const snap = await getDoc(this.orgDoc(personId, 'identity'));
    return snap.exists() ? (snap.data() as ProfessionalIdentity) : null;
  }

  async saveEmployment(emp: Employment): Promise<void> {
    await setDoc(doc(db, `organizations/${this.organizationId}/workforce/${emp.personId}/employments`, emp.id), sanitizeForFirestore(emp));
  }
  async loadEmployments(personId: string): Promise<Employment[]> {
    const snap = await getDocs(collection(db, `organizations/${this.organizationId}/workforce/${personId}/employments`));
    return snap.docs.map((d) => d.data() as Employment);
  }

  async saveAssignment(assignment: Assignment): Promise<void> {
    await setDoc(doc(db, `organizations/${this.organizationId}/workforce/${assignment.personId}/assignments`, assignment.id), sanitizeForFirestore(assignment));
  }
  async loadAssignments(personId: string): Promise<Assignment[]> {
    const snap = await getDocs(collection(db, `organizations/${this.organizationId}/workforce/${personId}/assignments`));
    return snap.docs.map((d) => d.data() as Assignment);
  }

  async saveCredentials(personId: string, credentials: Credential[]): Promise<void> {
    const batch = writeBatch(db);
    const ref = collection(db, `organizations/${this.organizationId}/workforce/${personId}/credentials`);
    credentials.forEach((c) => batch.set(doc(ref, c.id), sanitizeForFirestore(c)));
    await batch.commit();
  }
  async loadCredentials(personId: string): Promise<Credential[]> {
    const snap = await getDocs(collection(db, `organizations/${this.organizationId}/workforce/${personId}/credentials`));
    return snap.docs.map((d) => d.data() as Credential);
  }

  async saveCompetencies(personId: string, competencies: Competency[]): Promise<void> {
    const batch = writeBatch(db);
    const ref = collection(db, `organizations/${this.organizationId}/workforce/${personId}/competencies`);
    competencies.forEach((c) => batch.set(doc(ref, c.id), sanitizeForFirestore(c)));
    await batch.commit();
  }
  async loadCompetencies(personId: string): Promise<Competency[]> {
    const snap = await getDocs(collection(db, `organizations/${this.organizationId}/workforce/${personId}/competencies`));
    return snap.docs.map((d) => d.data() as Competency);
  }

  async listPersons(): Promise<Person[]> {
    if (!this.organizationId) return [];
    try {
      // Persons who hold an employment doc under this org.
      const snap = await getDocs(query(collection(db, `organizations/${this.organizationId}/workforce`), where('__exists', '!=', '')));
      const persons: Person[] = [];
      for (const d of snap.docs) {
        const p = await this.loadPerson(d.id).catch(() => null);
        if (p) persons.push(p);
      }
      return persons;
    } catch {
      return [];
    }
  }
}
