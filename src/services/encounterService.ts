import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Unsubscribe,
  serverTimestamp,
  arrayUnion,
  addDoc,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type {
  RegistrationData,
  PresentingComplaintData,
  HPIEntry,
  ExamEntry,
  BedsideScoreEntry,
  DDXEntry,
  InvestigationEntry,
  ImagingEntry,
  TreatmentEntry,
  OperativeNoteData,
  WardRoundEntry,
  ComplicationEntry,
  DispositionData,
} from '@/types/encounter';

const DEFAULT_ORG = 'telemed-a98cf';

function orgPath(orgId?: string) {
  return `organizations/${orgId || DEFAULT_ORG}`;
}

export async function createEncounter(data: {
  patientId: string;
  patientName: string;
  departmentSlug: string;
  unitSlug: string;
  encounterType: string;
  consultant: string;
  ward: string;
  bed: string;
  createdBy: string;
  orgId?: string;
}): Promise<string> {
  const ref = doc(collection(db, `${orgPath(data.orgId)}/departments/${data.departmentSlug}/units/${data.unitSlug}/encounters`));
  const encounter = {
    id: ref.id,
    patientId: data.patientId,
    patientName: data.patientName,
    hospitalId: data.orgId || DEFAULT_ORG,
    departmentSlug: data.departmentSlug,
    unitSlug: data.unitSlug,
    status: 'active',
    encounterType: data.encounterType,
    consultant: data.consultant,
    ward: data.ward,
    bed: data.bed,
    activePhase: 'registration',
    completedPhases: [],
    createdBy: data.createdBy,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    timeline: [{
      timestamp: Date.now(),
      event: 'Encounter created',
      details: `New ${data.encounterType} encounter created in ${data.unitSlug}`,
      userId: data.createdBy,
      userName: data.createdBy,
    }],
  };
  await setDoc(ref, encounter);
  return ref.id;
}

export async function getEncounter(encounterId: string, deptSlug: string, unitSlug: string, orgId?: string) {
  const snap = await getDoc(doc(db, `${orgPath(orgId)}/departments/${deptSlug}/units/${unitSlug}/encounters/${encounterId}`));
  return snap.exists() ? { id: snap.id, ...snap.data() } as any : null;
}

export function listenEncounter(
  encounterId: string,
  deptSlug: string,
  unitSlug: string,
  onData: (data: any) => void,
  onError?: (err: Error) => void,
  orgId?: string,
): Unsubscribe {
  const ref = doc(db, `${orgPath(orgId)}/departments/${deptSlug}/units/${unitSlug}/encounters/${encounterId}`);
  return onSnapshot(ref, (snap) => onData(snap.exists() ? { id: snap.id, ...snap.data() } : null), onError);
}

export async function updateEncounter(
  encounterId: string,
  deptSlug: string,
  unitSlug: string,
  updates: Record<string, any>,
  orgId?: string,
): Promise<void> {
  const ref = doc(db, `${orgPath(orgId)}/departments/${deptSlug}/units/${unitSlug}/encounters/${encounterId}`);
  await updateDoc(ref, { ...updates, updatedAt: Date.now() });
}

export async function addTimelineEvent(
  encounterId: string,
  deptSlug: string,
  unitSlug: string,
  event: string,
  details: string,
  userId: string,
  userName: string,
  orgId?: string,
): Promise<void> {
  const ref = doc(db, `${orgPath(orgId)}/departments/${deptSlug}/units/${unitSlug}/encounters/${encounterId}`);
  await updateDoc(ref, {
    timeline: arrayUnion({ timestamp: Date.now(), event, details, userId, userName }),
    updatedAt: Date.now(),
  });
}

export async function getSubcollection<T>(
  encounterId: string,
  deptSlug: string,
  unitSlug: string,
  subcollection: string,
  orgId?: string,
): Promise<T[]> {
  const col = collection(db, `${orgPath(orgId)}/departments/${deptSlug}/units/${unitSlug}/encounters/${encounterId}/${subcollection}`);
  const q = query(col, orderBy('timestamp', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as T));
}

export function listenSubcollection<T>(
  encounterId: string,
  deptSlug: string,
  unitSlug: string,
  subcollection: string,
  onData: (items: T[]) => void,
  onError?: (err: Error) => void,
  orgId?: string,
): Unsubscribe {
  const col = collection(db, `${orgPath(orgId)}/departments/${deptSlug}/units/${unitSlug}/encounters/${encounterId}/${subcollection}`);
  const q = query(col, orderBy('timestamp', 'desc'));
  return onSnapshot(q,
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as T))),
    onError,
  );
}

export async function addSubcollectionItem<T extends { id?: string }>(
  encounterId: string,
  deptSlug: string,
  unitSlug: string,
  subcollection: string,
  data: Omit<T, 'id'>,
  orgId?: string,
): Promise<string> {
  const col = collection(db, `${orgPath(orgId)}/departments/${deptSlug}/units/${unitSlug}/encounters/${encounterId}/${subcollection}`);
  const ref = doc(col);
  await setDoc(ref, { ...data, id: ref.id, timestamp: Date.now() });
  return ref.id;
}

export async function updateSubcollectionItem(
  encounterId: string,
  deptSlug: string,
  unitSlug: string,
  subcollection: string,
  itemId: string,
  updates: Record<string, any>,
  orgId?: string,
): Promise<void> {
  const ref = doc(db, `${orgPath(orgId)}/departments/${deptSlug}/units/${unitSlug}/encounters/${encounterId}/${subcollection}/${itemId}`);
  await updateDoc(ref, { ...updates, updatedAt: Date.now() });
}

export function listenActiveEncounters(
  deptSlug: string,
  unitSlug: string,
  onData: (encounters: any[]) => void,
  onError?: (err: Error) => void,
  orgId?: string,
): Unsubscribe {
  const col = collection(db, `${orgPath(orgId)}/departments/${deptSlug}/units/${unitSlug}/encounters`);
  const q = query(col, where('status', '==', 'active'), orderBy('createdAt', 'desc'));
  return onSnapshot(q,
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError,
  );
}
