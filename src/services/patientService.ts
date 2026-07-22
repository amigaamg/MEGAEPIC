// localStorage-based patient storage — no Firestore dependency
import { registerPatient as localRegister, getPatient as localGet, findPatientByMRN as localFind, updatePatient as localUpdate } from '@/lib/amexan/persistence/localStorage';
import type { PatientData } from '@/lib/amexan/persistence/localStorage';

export type { PatientData };

export async function registerPatient(data: PatientData, orgId?: string): Promise<string> {
  return localRegister(data, orgId);
}

export async function getPatient(patientId: string, orgId?: string): Promise<PatientData | null> {
  return localGet(patientId) || null;
}

export async function findPatientByMRN(mrn: string, orgId?: string): Promise<{ id: string; data: PatientData } | null> {
  return localFind(mrn);
}

export async function updatePatient(patientId: string, updates: Partial<PatientData>, orgId?: string): Promise<void> {
  localUpdate(patientId, updates);
}
