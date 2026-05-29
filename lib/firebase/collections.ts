import { collection, doc, CollectionReference, DocumentReference, collectionGroup } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ── Users (top-level for auth) ───────────────────────────────────────────────

export function userRef(userId: string): DocumentReference {
  return doc(db, 'users', userId);
}

export function usersCol(): CollectionReference {
  return collection(db, 'users');
}

// ── Organizations ────────────────────────────────────────────────────────────

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

export function orgUnitRef(orgId: string, deptId: string, unitId: string): DocumentReference {
  return doc(db, 'organizations', orgId, 'departments', deptId, 'units', unitId);
}

export function orgUnitsCol(orgId: string, deptId: string): CollectionReference {
  return collection(db, 'organizations', orgId, 'departments', deptId, 'units');
}

// ── Encounters (under org tree) ──────────────────────────────────────────────

export function encounterRef(orgId: string, deptId: string, unitId: string, encounterId: string): DocumentReference {
  return doc(db, 'organizations', orgId, 'departments', deptId, 'units', unitId, 'encounters', encounterId);
}

export function encountersCol(orgId: string, deptId: string, unitId: string): CollectionReference {
  return collection(db, 'organizations', orgId, 'departments', deptId, 'units', unitId, 'encounters');
}

export function encounterEventsCol(orgId: string, deptId: string, unitId: string, encounterId: string): CollectionReference {
  return collection(db, 'organizations', orgId, 'departments', deptId, 'units', unitId, 'encounters', encounterId, 'events');
}

export function encounterPhasesCol(orgId: string, deptId: string, unitId: string, encounterId: string): CollectionReference {
  return collection(db, 'organizations', orgId, 'departments', deptId, 'units', unitId, 'encounters', encounterId, 'phases');
}

export function encounterPhaseRef(orgId: string, deptId: string, unitId: string, encounterId: string, phaseId: string): DocumentReference {
  return doc(db, 'organizations', orgId, 'departments', deptId, 'units', unitId, 'encounters', encounterId, 'phases', phaseId);
}

// ── Patients (under org tree) ────────────────────────────────────────────────

export function patientRef(orgId: string, patientId: string): DocumentReference {
  return doc(db, 'organizations', orgId, 'patients', patientId);
}

export function patientsCol(orgId: string): CollectionReference {
  return collection(db, 'organizations', orgId, 'patients');
}

export function patientEncountersCol(orgId: string, patientId: string): CollectionReference {
  return collection(db, 'organizations', orgId, 'patients', patientId, 'encounters');
}

export function patientLifelineCol(orgId: string, patientId: string): CollectionReference {
  return collection(db, 'organizations', orgId, 'patients', patientId, 'lifeline');
}

// ── Organization Members ─────────────────────────────────────────────────────

export function orgMemberRef(orgId: string, userId: string): DocumentReference {
  return doc(db, 'organizations', orgId, 'members', userId);
}

export function orgMembersCol(orgId: string): CollectionReference {
  return collection(db, 'organizations', orgId, 'members');
}

// ── Settings ─────────────────────────────────────────────────────────────────

export function orgSettingsRef(orgId: string): DocumentReference {
  return doc(db, 'organizations', orgId, 'settings', 'general');
}

// ── Analytics ────────────────────────────────────────────────────────────────

export function orgAnalyticsCol(orgId: string): CollectionReference {
  return collection(db, 'organizations', orgId, 'analytics');
}

// ── Audit Logs ───────────────────────────────────────────────────────────────

export function orgAuditLogsCol(orgId: string): CollectionReference {
  return collection(db, 'organizations', orgId, 'auditLogs');
}

// ── Legacy paths (backward compat) ───────────────────────────────────────────

export {
  collectionGroup,
  collection,
  doc,
};
