// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Workforce Repository — Engine II Persistence Abstraction
// Same contract as Engine I: the engine never touches storage. Firestore is the
// concrete lane today; Postgres becomes authoritative later, Neo4j a projection.
// ═══════════════════════════════════════════════════════════════════════════════

import type {
  Assignment,
  Competency,
  Credential,
  Employment,
  Person,
  ProfessionalIdentity,
} from './constitutional-types';

export interface WorkforceRepository {
  savePerson(person: Person): Promise<void>;
  loadPerson(personId: string): Promise<Person | null>;
  saveIdentity(identity: ProfessionalIdentity): Promise<void>;
  loadIdentity(personId: string): Promise<ProfessionalIdentity | null>;
  saveEmployment(emp: Employment): Promise<void>;
  loadEmployments(personId: string): Promise<Employment[]>;
  saveAssignment(assignment: Assignment): Promise<void>;
  loadAssignments(personId: string): Promise<Assignment[]>;
  saveCredentials(personId: string, credentials: Credential[]): Promise<void>;
  loadCredentials(personId: string): Promise<Credential[]>;
  saveCompetencies(personId: string, competencies: Competency[]): Promise<void>;
  loadCompetencies(personId: string): Promise<Competency[]>;
  /** Lists all persons (for the Workforce Explorer). */
  listPersons(organizationId?: string): Promise<Person[]>;
}
