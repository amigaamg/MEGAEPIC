// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Constitution — Firestore Persistence Layer
// CRUD for all constitutional types: Identity, Person, Professional,
// Organization, Employment, Assignment, Role
// ═══════════════════════════════════════════════════════════════════════════════

import {
  doc, setDoc, updateDoc, getDoc, getDocs, deleteDoc,
  collection, collectionGroup, query, where, orderBy, limit,
  type DocumentReference, type CollectionReference,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type {
  AmxUid, Identity, Person, ProfessionalIdentity, Organization,
  Employment, Assignment, Role, Department,
} from './types';

// ── Collection Paths ──────────────────────────────────────────────────────────

/**
 * Recursively strip every `undefined` value from an object or array so that
 * Firestore never receives `undefined` — which it rejects with:
 *   "Function setDoc() called with invalid data. Unsupported field value: undefined"
 *
 * `null` and `""` are preserved (Firestore supports them natively).
 * Dates are passed through unchanged.
 */
export function cleanFirestore<T extends Record<string, any> | any[]>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(cleanFirestore) as unknown as T;
  }
  if (obj instanceof Date) return obj;
  if (obj && typeof obj === 'object' && !(obj as any)._toBytes) {
    const out: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj as Record<string, any>)) {
      if (value === undefined) continue;
      out[key] = cleanFirestore(value as any);
    }
    return out as T;
  }
  return obj;
}

export function identityRef(uid: string): DocumentReference {
  return doc(db, 'identities', uid);
}
export function identitiesCol(): CollectionReference {
  return collection(db, 'identities');
}

export function personRef(uid: string): DocumentReference {
  return doc(db, 'persons', uid);
}
export function personsCol(): CollectionReference {
  return collection(db, 'persons');
}

export function professionalRef(uid: string): DocumentReference {
  return doc(db, 'professional_identities', uid);
}
export function professionalsCol(): CollectionReference {
  return collection(db, 'professional_identities');
}

export function orgRef(orgId: string): DocumentReference {
  return doc(db, 'organizations', orgId);
}
export function orgsCol(): CollectionReference {
  return collection(db, 'organizations');
}

export function orgDeptRef(orgId: string, deptId: string): DocumentReference {
  return doc(db, 'organizations', orgId, 'departments', deptId);
}
export function orgDeptsCol(orgId: string): CollectionReference {
  return collection(db, 'organizations', orgId, 'departments');
}

export function orgEmploymentRef(orgId: string, employmentId: string): DocumentReference {
  return doc(db, 'organizations', orgId, 'employments', employmentId);
}
export function orgEmploymentsCol(orgId: string): CollectionReference {
  return collection(db, 'organizations', orgId, 'employments');
}

export function orgAssignmentRef(orgId: string, assignmentId: string): DocumentReference {
  return doc(db, 'organizations', orgId, 'assignments', assignmentId);
}
export function orgAssignmentsCol(orgId: string): CollectionReference {
  return collection(db, 'organizations', orgId, 'assignments');
}

export function roleRef(roleId: string): DocumentReference {
  return doc(db, 'roles', roleId);
}
export function rolesCol(): CollectionReference {
  return collection(db, 'roles');
}

export function orgRoleRef(orgId: string, roleId: string): DocumentReference {
  return doc(db, 'organizations', orgId, 'roles', roleId);
}
export function orgRolesCol(orgId: string): CollectionReference {
  return collection(db, 'organizations', orgId, 'roles');
}

export function orgMemberRef(orgId: string, userId: string): DocumentReference {
  return doc(db, 'organizations', orgId, 'members', userId);
}
export function orgMembersCol(orgId: string): CollectionReference {
  return collection(db, 'organizations', orgId, 'members');
}

// ── Actor (Universal Root Record) ─────────────────────────────────────────────

export interface ActorRecord {
  actorId: string;
  amxuid: string;
  actorType: 'professional' | 'patient' | 'administrator' | 'system';
  status: 'active' | 'in_progress' | 'suspended' | 'deactivated';
  displayName: string;
  email: string;
  phone: string;
  firebaseUid: string;
  registrationStep: string;
  constitutionVersion: string;
  createdAt: number;
  updatedAt: number;
}

export function actorRef(actorId: string): DocumentReference {
  return doc(db, 'actors', actorId);
}
export function actorsCol(): CollectionReference {
  return collection(db, 'actors');
}

export async function createActor(uid: string, data: Omit<ActorRecord, 'actorId' | 'createdAt' | 'updatedAt'>): Promise<void> {
  const now = Date.now();
  await setDoc(actorRef(uid), cleanFirestore({
    actorId: uid,
    ...data,
    createdAt: now,
    updatedAt: now,
  }), { merge: true });
}

export async function getActor(uid: string): Promise<ActorRecord | null> {
  const snap = await getDoc(actorRef(uid));
  return docTo<ActorRecord>(snap);
}

export async function updateActor(uid: string, data: Partial<ActorRecord>): Promise<void> {
  await updateDoc(actorRef(uid), cleanFirestore({ ...data, updatedAt: Date.now() }));
}

// ── Internal helpers ───────────────────────────────────────────────────────────

function docTo<T>(snap: any): T | null {
  return snap.exists() ? { id: snap.id, ...snap.data() } as T : null;
}

function docsTo<T>(snap: any): T[] {
  return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }) as T);
}

// ── Identity ──────────────────────────────────────────────────────────────────

export async function createIdentity(uid: string, data: Omit<Identity, 'uid'>): Promise<void> {
  await setDoc(identityRef(uid), cleanFirestore({ ...data, uid }));
}

export async function getIdentity(uid: string): Promise<Identity | null> {
  const snap = await getDoc(identityRef(uid));
  return docTo<Identity>(snap);
}

export async function updateIdentity(uid: string, data: Partial<Identity>): Promise<void> {
  await updateDoc(identityRef(uid), cleanFirestore({ ...data, updatedAt: Date.now() }));
}

// ── Person ────────────────────────────────────────────────────────────────────

export async function createPerson(uid: string, data: Omit<Person, 'uid'>): Promise<void> {
  await setDoc(personRef(uid), cleanFirestore({ ...data, uid }));
}

export async function getPerson(uid: string): Promise<Person | null> {
  const snap = await getDoc(personRef(uid));
  return docTo<Person>(snap);
}

export async function updatePerson(uid: string, data: Partial<Person>): Promise<void> {
  await updateDoc(personRef(uid), cleanFirestore(data));
}

// ── Professional Identity ─────────────────────────────────────────────────────

export async function createProfessional(uid: string, data: Omit<ProfessionalIdentity, 'uid'>): Promise<void> {
  await setDoc(professionalRef(uid), cleanFirestore({ ...data, uid }));
}

export async function getProfessional(uid: string): Promise<ProfessionalIdentity | null> {
  const snap = await getDoc(professionalRef(uid));
  return docTo<ProfessionalIdentity>(snap);
}

export async function updateProfessional(uid: string, data: Partial<ProfessionalIdentity>): Promise<void> {
  await updateDoc(professionalRef(uid), cleanFirestore(data));
}

// ── Organization ──────────────────────────────────────────────────────────────

export async function createOrganization(data: Omit<Organization, 'id'>): Promise<string> {
  const ref = doc(orgsCol());
  const org: Organization = { ...data, id: ref.id, createdAt: Date.now(), updatedAt: Date.now() };
  await setDoc(ref, cleanFirestore(org));
  return ref.id;
}

export async function getOrganization(orgId: string): Promise<Organization | null> {
  const snap = await getDoc(orgRef(orgId));
  return docTo<Organization>(snap);
}

export async function updateOrganization(orgId: string, data: Partial<Organization>): Promise<void> {
  await updateDoc(orgRef(orgId), cleanFirestore({ ...data, updatedAt: Date.now() }));
}

export async function listOrganizations(): Promise<Organization[]> {
  const snap = await getDocs(orgsCol());
  return docsTo<Organization>(snap);
}

export async function searchOrganizations(field: string, value: string): Promise<Organization[]> {
  const q = query(orgsCol(), where(field, '==', value));
  const snap = await getDocs(q);
  return docsTo<Organization>(snap);
}

// ── Department ────────────────────────────────────────────────────────────────

export async function createDepartment(orgId: string, data: Omit<Department, 'id'>): Promise<Department> {
  const ref = doc(orgDeptsCol(orgId));
  const dept: Department = { ...data, id: ref.id, createdAt: Date.now() };
  await setDoc(ref, cleanFirestore(dept));
  return dept;
}

export async function getDepartment(orgId: string, deptId: string): Promise<Department | null> {
  const snap = await getDoc(orgDeptRef(orgId, deptId));
  return docTo<Department>(snap);
}

export async function updateDepartment(orgId: string, deptId: string, data: Partial<Department>): Promise<void> {
  await updateDoc(orgDeptRef(orgId, deptId), cleanFirestore(data));
}

export async function deleteDepartment(orgId: string, deptId: string): Promise<void> {
  await deleteDoc(orgDeptRef(orgId, deptId));
}

export async function listDepartments(orgId: string): Promise<Department[]> {
  const q = query(orgDeptsCol(orgId), orderBy('name'));
  const snap = await getDocs(q);
  return docsTo<Department>(snap);
}

// ── Employment ────────────────────────────────────────────────────────────────

export async function createEmployment(orgId: string, data: Omit<Employment, 'id'>): Promise<string> {
  const ref = doc(orgEmploymentsCol(orgId));
  const emp: Employment = { ...data, id: ref.id, createdAt: Date.now(), updatedAt: Date.now() };
  await setDoc(ref, cleanFirestore(emp));
  return ref.id;
}

export async function getEmployment(orgId: string, employmentId: string): Promise<Employment | null> {
  const snap = await getDoc(orgEmploymentRef(orgId, employmentId));
  return docTo<Employment>(snap);
}

export async function updateEmployment(orgId: string, employmentId: string, data: Partial<Employment>): Promise<void> {
  await updateDoc(orgEmploymentRef(orgId, employmentId), cleanFirestore({ ...data, updatedAt: Date.now() }));
}

export async function listEmployments(orgId: string): Promise<Employment[]> {
  const snap = await getDocs(orgEmploymentsCol(orgId));
  return docsTo<Employment>(snap);
}

export async function listPersonEmployments(orgId: string, personId: string): Promise<Employment[]> {
  const q = query(orgEmploymentsCol(orgId), where('personId', '==', personId));
  const snap = await getDocs(q);
  return docsTo<Employment>(snap);
}

// ── Assignment ────────────────────────────────────────────────────────────────

export async function createAssignment(orgId: string, data: Omit<Assignment, 'id'>): Promise<string> {
  const ref = doc(orgAssignmentsCol(orgId));
  const assignment: Assignment = { ...data, id: ref.id, assignedAt: Date.now() };
  await setDoc(ref, cleanFirestore(assignment));
  return ref.id;
}

export async function getAssignment(orgId: string, assignmentId: string): Promise<Assignment | null> {
  const snap = await getDoc(orgAssignmentRef(orgId, assignmentId));
  return docTo<Assignment>(snap);
}

export async function updateAssignment(orgId: string, assignmentId: string, data: Partial<Assignment>): Promise<void> {
  await updateDoc(orgAssignmentRef(orgId, assignmentId), cleanFirestore(data));
}

export async function listAssignments(orgId: string): Promise<Assignment[]> {
  const q = query(orgAssignmentsCol(orgId), orderBy('startTime', 'desc'));
  const snap = await getDocs(q);
  return docsTo<Assignment>(snap);
}

export async function listPersonAssignments(orgId: string, personId: string): Promise<Assignment[]> {
  const q = query(
    orgAssignmentsCol(orgId),
    where('personId', '==', personId),
    orderBy('startTime', 'desc'),
  );
  const snap = await getDocs(q);
  return docsTo<Assignment>(snap);
}

// ── Role ──────────────────────────────────────────────────────────────────────

export async function createRole(data: Omit<Role, 'id'>): Promise<string> {
  const ref = doc(rolesCol());
  const role: Role = { ...data, id: ref.id, createdAt: Date.now(), updatedAt: Date.now() };
  await setDoc(ref, cleanFirestore(role));
  return ref.id;
}

export async function createOrgRole(orgId: string, data: Omit<Role, 'id'>): Promise<string> {
  const ref = doc(orgRolesCol(orgId));
  const role: Role = { ...data, id: ref.id, createdAt: Date.now(), updatedAt: Date.now() };
  await setDoc(ref, cleanFirestore(role));
  return ref.id;
}

export async function getRole(roleId: string): Promise<Role | null> {
  const snap = await getDoc(roleRef(roleId));
  return docTo<Role>(snap);
}

export async function getOrgRole(orgId: string, roleId: string): Promise<Role | null> {
  const snap = await getDoc(orgRoleRef(orgId, roleId));
  return docTo<Role>(snap);
}

export async function updateRole(roleId: string, data: Partial<Role>): Promise<void> {
  await updateDoc(roleRef(roleId), cleanFirestore({ ...data, updatedAt: Date.now() }));
}

export async function listRoles(orgId?: string): Promise<Role[]> {
  if (orgId) {
    const snap = await getDocs(orgRolesCol(orgId));
    return docsTo<Role>(snap);
  }
  const snap = await getDocs(rolesCol());
  return docsTo<Role>(snap);
}

// ── Organization Members ──────────────────────────────────────────────────────

export interface OrgMemberRecord {
  userId: string;
  email: string;
  displayName: string;
  roleId: string;
  roleName: string;
  employmentId?: string;
  departmentIds: string[];
  isActive: boolean;
  joinedAt: number;
}

export async function addOrgMember(orgId: string, member: OrgMemberRecord): Promise<void> {
  await setDoc(orgMemberRef(orgId, member.userId), cleanFirestore(member));
}

export async function getOrgMember(orgId: string, userId: string): Promise<OrgMemberRecord | null> {
  const snap = await getDoc(orgMemberRef(orgId, userId));
  return docTo<OrgMemberRecord>(snap);
}

export async function updateOrgMember(orgId: string, userId: string, data: Partial<OrgMemberRecord>): Promise<void> {
  await updateDoc(orgMemberRef(orgId, userId), cleanFirestore(data));
}

export async function removeOrgMember(orgId: string, userId: string): Promise<void> {
  await deleteDoc(orgMemberRef(orgId, userId));
}

export async function listOrgMembers(orgId: string): Promise<OrgMemberRecord[]> {
  const snap = await getDocs(orgMembersCol(orgId));
  return docsTo<OrgMemberRecord>(snap);
}

export async function listUserOrganizations(userId: string): Promise<string[]> {
  const snap = await getDocs(query(collectionGroup(db, 'members'), where('userId', '==', userId)));
  return snap.docs.map(d => d.ref.parent.parent?.id ?? d.id);
}
