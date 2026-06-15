import { doc, setDoc, getDoc, updateDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const COLLECTION = 'clinicalIntelligenceEncounters';

export interface EncounterSnapshot {
  id: string;
  createdAt: number;
  updatedAt: number;
  patientName?: string;
  status: 'active' | 'completed';
  storeState: any;
}

/**
 * Save the current history store state to Firestore.
 * Creates a new encounter doc if no id provided, or updates existing.
 */
export async function saveEncounter(
  state: any,
  encounterId?: string,
  patientName?: string,
): Promise<string> {
  if (encounterId) {
    const ref = doc(db, COLLECTION, encounterId);
    await updateDoc(ref, {
      storeState: state,
      patientName: patientName || null,
      status: 'active',
      updatedAt: Date.now(),
    });
    return encounterId;
  } else {
    const ref = doc(collection(db, COLLECTION));
    await setDoc(ref, {
      storeState: state,
      patientName: patientName || null,
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return ref.id;
  }
}

/**
 * Load a previously saved encounter from Firestore.
 */
export async function loadEncounter(encounterId: string): Promise<EncounterSnapshot | null> {
  const ref = doc(db, COLLECTION, encounterId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    patientName: data.patientName,
    status: data.status,
    storeState: data.storeState,
  };
}

/**
 * Mark an encounter as completed.
 */
export async function completeEncounter(encounterId: string): Promise<void> {
  const ref = doc(db, COLLECTION, encounterId);
  await updateDoc(ref, {
    status: 'completed',
    updatedAt: Date.now(),
  });
}
