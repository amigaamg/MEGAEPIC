import {
  doc, setDoc, updateDoc, deleteDoc, getDoc, getDocs, collection,
  query, where, orderBy, limit, onSnapshot, Timestamp, Unsubscribe, addDoc,
  collectionGroup,
} from 'firebase/firestore';
import {
  encounterRef, encountersCol, encounterEventsCol, encounterPhaseRef,
  patientRef, patientLifelineCol, patientEncountersCol,
} from './collections';
import type { Encounter, EncounterType, DocumentEvent, AIInsight } from '@/lib/encounterTypes';
import { db } from '@/lib/firebase';

const DEFAULT_ORG_ID = 'telemed-a98cf';

function resolveOrgId(orgId?: string): string {
  return orgId || DEFAULT_ORG_ID;
}

export interface EncounterData {
  id?: string;
  patientId: string;
  patientName: string;
  departmentId: string;
  unitId: string;
  encounterType: EncounterType;
  status: 'active' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt?: number;
  activePhase: string;
  completedPhases: string[];
  diagnosis: string[];
  clinicianNotes: string;
}

export async function createEncounter(data: EncounterData, orgId?: string): Promise<string> {
  const oid = resolveOrgId(orgId);
  const ref = doc(encountersCol(oid, data.departmentId, data.unitId));
  const encounter: Record<string, unknown> = {
    ...data,
    id: ref.id,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    status: data.status || 'active',
    activePhase: data.activePhase || 'triage',
    completedPhases: data.completedPhases || [],
    diagnosis: data.diagnosis || [],
    clinicianNotes: data.clinicianNotes || '',
    participants: [{ userId: data.createdBy, name: '', role: 'doctor', department: data.departmentId, joinedAt: Date.now() }],
  };
  await setDoc(ref, encounter);
  await setDoc(doc(patientEncountersCol(oid, data.patientId), ref.id), { encounterId: ref.id, departmentId: data.departmentId, unitId: data.unitId, encounterType: data.encounterType, createdAt: encounter.createdAt });
  await addDoc(patientLifelineCol(oid, data.patientId), {
    type: 'encounter_created',
    encounterId: ref.id,
    departmentId: data.departmentId,
    unitId: data.unitId,
    encounterType: data.encounterType,
    description: `${data.encounterType.replace(/_/g, ' ')} at ${data.unitId}`,
    timestamp: encounter.createdAt,
  });
  return ref.id;
}

export async function getEncounter(deptId: string, unitId: string, encounterId: string, orgId?: string): Promise<EncounterData | null> {
  const snap = await getDoc(encounterRef(resolveOrgId(orgId), deptId, unitId, encounterId));
  return snap.exists() ? snap.data() as EncounterData : null;
}

export async function updateEncounter(deptId: string, unitId: string, encounterId: string, updates: Partial<EncounterData>, orgId?: string): Promise<void> {
  await updateDoc(encounterRef(resolveOrgId(orgId), deptId, unitId, encounterId), { ...updates, updatedAt: Date.now() });
}

export async function deleteEncounter(deptId: string, unitId: string, encounterId: string, orgId?: string): Promise<void> {
  await deleteDoc(encounterRef(resolveOrgId(orgId), deptId, unitId, encounterId));
}

export function listenEncounter(
  deptId: string, unitId: string, encounterId: string,
  onData: (data: EncounterData | null) => void,
  onError?: (err: Error) => void,
  orgId?: string,
): Unsubscribe {
  const ref = encounterRef(resolveOrgId(orgId), deptId, unitId, encounterId);
  return onSnapshot(ref,
    (snap) => onData(snap.exists() ? snap.data() as EncounterData : null),
    (err) => onError?.(err),
  );
}

export function listenEncountersByUnit(
  deptId: string, unitId: string,
  onData: (encounters: EncounterData[]) => void,
  onError?: (err: Error) => void,
  orgId?: string,
): Unsubscribe {
  const q = query(
    encountersCol(resolveOrgId(orgId), deptId, unitId),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc'),
  );
  return onSnapshot(q,
    (snap) => onData(snap.docs.map(d => d.data() as EncounterData)),
    (err) => onError?.(err),
  );
}

export function listenEncountersByDepartment(
  deptId: string,
  onData: (encounters: EncounterData[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const cg = query(
    collectionGroup(db, 'encounters'),
    where('departmentId', '==', deptId),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc'),
  );
  return onSnapshot(cg,
    (snap) => onData(snap.docs.map(d => d.data() as EncounterData)),
    (err) => onError?.(err),
  );
}

export async function addEncounterEvent(
  deptId: string, unitId: string, encounterId: string,
  event: {
    type: string;
    description: string;
    actorName: string;
    actorRole: 'doctor' | 'nurse' | 'admin' | 'system';
    severity?: 'info' | 'warning' | 'critical';
    details?: Record<string, unknown>;
  },
  orgId?: string,
): Promise<string> {
  const oid = resolveOrgId(orgId);
  const ref = doc(encounterEventsCol(oid, deptId, unitId, encounterId));
  const data = {
    id: ref.id,
    ...event,
    severity: event.severity || 'info',
    timestamp: Date.now(),
  };
  await setDoc(ref, data);
  await updateDoc(encounterRef(oid, deptId, unitId, encounterId), { lastEventAt: Date.now() });
  return ref.id;
}

export function listenEncounterEvents(
  deptId: string, unitId: string, encounterId: string,
  onData: (events: DocumentEvent[]) => void,
  onError?: (err: Error) => void,
  maxEvents = 100,
  orgId?: string,
): Unsubscribe {
  const q = query(
    encounterEventsCol(resolveOrgId(orgId), deptId, unitId, encounterId),
    orderBy('timestamp', 'desc'),
    limit(maxEvents),
  );
  return onSnapshot(q,
    (snap) => onData(snap.docs.map(d => d.data() as DocumentEvent).reverse()),
    (err) => onError?.(err),
  );
}

export async function savePhaseData(
  deptId: string, unitId: string, encounterId: string,
  phaseId: string, data: Record<string, unknown>,
  orgId?: string,
): Promise<void> {
  await setDoc(encounterPhaseRef(resolveOrgId(orgId), deptId, unitId, encounterId, phaseId), { ...data, updatedAt: Date.now() }, { merge: true });
}

export function listenPhaseData(
  deptId: string, unitId: string, encounterId: string,
  phaseId: string,
  onData: (data: Record<string, unknown> | null) => void,
  orgId?: string,
): Unsubscribe {
  return onSnapshot(encounterPhaseRef(resolveOrgId(orgId), deptId, unitId, encounterId, phaseId),
    (snap) => onData(snap.exists() ? snap.data() as Record<string, unknown> : null),
  );
}

export function listenDepartmentStats(
  deptId: string,
  onStats: (stats: { activeCases: number; todayEncounters: number; pendingLabs: number; criticalAlerts: number }) => void,
): Unsubscribe[] {
  const unsubs: Unsubscribe[] = [];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayTs = today.getTime();
  const encUnsub = onSnapshot(
    query(collectionGroup(db, 'encounters'), where('departmentId', '==', deptId), where('status', '==', 'active')),
    (snap) => {
      const all = snap.docs.map(d => d.data());
      const activeCases = all.length;
      const todayEncounters = all.filter((d: any) => (d.createdAt || 0) >= todayTs).length;
      onStats({ activeCases, todayEncounters, pendingLabs: 0, criticalAlerts: 0 });
    },
  );
  unsubs.push(encUnsub);
  return unsubs;
}

export function listenPatientLifeline(
  patientId: string,
  onData: (events: { type: string; description: string; timestamp: number; encounterType?: string }[]) => void,
  orgId?: string,
): Unsubscribe {
  const q = query(patientLifelineCol(resolveOrgId(orgId), patientId), orderBy('timestamp', 'desc'), limit(50));
  return onSnapshot(q, (snap) => onData(snap.docs.map(d => d.data() as any)));
}

export { DEFAULT_ORG_ID as ORG_ID };
