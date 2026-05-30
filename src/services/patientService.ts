import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface PatientData {
  mrn: string;
  name: string;
  dob: number;
  sex: string;
  bloodGroup: string;
  allergies: string[];
  medicalHistory: string[];
  surgicalHistory: string[];
  familyHistory: string[];
  contact: string;
  address: string;
}

export async function registerPatient(data: PatientData, orgId?: string): Promise<string> {
  const patientsCol = collection(db, `organizations/${orgId || 'telemed-a98cf'}/patients`);
  const q = query(patientsCol, where('mrn', '==', data.mrn));
  const existing = await getDocs(q);
  if (!existing.empty) {
    return existing.docs[0].id;
  }
  const ref = doc(patientsCol);
  await setDoc(ref, { ...data, id: ref.id, createdAt: Date.now(), updatedAt: Date.now() });
  return ref.id;
}

export async function getPatient(patientId: string, orgId?: string): Promise<PatientData | null> {
  const snap = await getDoc(doc(db, `organizations/${orgId || 'telemed-a98cf'}/patients/${patientId}`));
  return snap.exists() ? snap.data() as PatientData : null;
}

export async function findPatientByMRN(mrn: string, orgId?: string): Promise<{ id: string; data: PatientData } | null> {
  const patientsCol = collection(db, `organizations/${orgId || 'telemed-a98cf'}/patients`);
  const q = query(patientsCol, where('mrn', '==', mrn));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, data: d.data() as PatientData };
}

export async function updatePatient(patientId: string, updates: Partial<PatientData>, orgId?: string): Promise<void> {
  const ref = doc(db, `organizations/${orgId || 'telemed-a98cf'}/patients/${patientId}`);
  await setDoc(ref, { ...updates, updatedAt: Date.now() }, { merge: true });
}
