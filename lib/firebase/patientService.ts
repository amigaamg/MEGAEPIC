import { doc, getDoc, setDoc, updateDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { patientsCol, patientRef, patientEncountersCol, patientLifelineCol } from './collections';

export interface PatientRecord {
  amxpId: string;
  fullName: string;
  givenName: string;
  familyName: string;
  dateOfBirth: string;
  sex: 'male' | 'female' | 'other' | 'undisclosed';
  phone: string;
  email: string;
  address: { country: string; county: string; subCounty?: string; city?: string };
  nationality: string;
  nationalId: string;
  bloodGroup?: string;
  allergies?: string[];
  emergencyContact?: { name: string; relationship: string; phone: string };
  identifiers: Record<string, string>;
  createdAt: number;
  updatedAt: number;
  createdBy?: string;
  active: boolean;
}

export async function createPatientRecord(orgId: string, data: Omit<PatientRecord, 'createdAt' | 'updatedAt' | 'active'>): Promise<string> {
  const ref = doc(patientsCol(orgId));
  const now = Date.now();
  await setDoc(ref, {
    ...data,
    id: ref.id,
    createdAt: now,
    updatedAt: now,
    active: true,
  });
  return ref.id;
}

export async function getPatientRecord(orgId: string, patientId: string): Promise<(PatientRecord & { id: string }) | null> {
  const snap = await getDoc(patientRef(orgId, patientId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as PatientRecord & { id: string }) : null;
}

export async function updatePatientRecord(orgId: string, patientId: string, updates: Partial<PatientRecord>): Promise<void> {
  await updateDoc(patientRef(orgId, patientId), { ...updates, updatedAt: Date.now() });
}

export async function listPatients(orgId: string, maxResults = 100): Promise<(PatientRecord & { id: string })[]> {
  const snap = await getDocs(query(patientsCol(orgId), orderBy('createdAt', 'desc'), limit(maxResults)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as PatientRecord & { id: string });
}

export async function searchPatients(orgId: string, term: string, maxResults = 20): Promise<(PatientRecord & { id: string })[]> {
  const q = term.trim();
  const all = await listPatients(orgId, 500);
  if (!q) return all.slice(0, maxResults);
  const lower = q.toLowerCase();
  return all
    .filter(p =>
      p.fullName?.toLowerCase().includes(lower) ||
      p.givenName?.toLowerCase().includes(lower) ||
      p.familyName?.toLowerCase().includes(lower) ||
      p.amxpId?.toLowerCase().includes(lower) ||
      p.phone?.toLowerCase().includes(lower) ||
      p.nationalId?.toLowerCase().includes(lower)
    )
    .slice(0, maxResults);
}

export async function getPatientEncounters(orgId: string, patientId: string, maxResults = 20) {
  const snap = await getDocs(query(patientEncountersCol(orgId, patientId), orderBy('createdAt', 'desc'), limit(maxResults)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addPatientLifelineEntry(orgId: string, patientId: string, entry: { type: string; title: string; detail?: string; byName?: string; byRole?: string }): Promise<string> {
  const ref = doc(patientLifelineCol(orgId, patientId));
  const now = Date.now();
  await setDoc(ref, { ...entry, createdAt: now });
  return ref.id;
}

export async function getPatientLifeline(orgId: string, patientId: string, maxResults = 100) {
  const snap = await getDocs(query(patientLifelineCol(orgId, patientId), orderBy('createdAt', 'desc'), limit(maxResults)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export function formatAge(dateOfBirth: string): string {
  if (!dateOfBirth) return '—';
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return '—';
  const years = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  if (years < 1) {
    const months = Math.floor((Date.now() - dob.getTime()) / (30.44 * 24 * 60 * 60 * 1000));
    return `${months} mo`;
  }
  return `${years} yrs`;
}

export function initialOf(name: string): string {
  return (name || '?').trim().charAt(0).toUpperCase() || '?';
}
