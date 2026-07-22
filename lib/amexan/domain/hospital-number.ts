// localStorage-based hospital number — no Firestore dependency
import { generateHospitalNumber as localGenerate } from '@/lib/amexan/persistence/localStorage';

export function generateHospitalNumberLocal(sequential: number): string {
  const year = new Date().getFullYear();
  return `HN-${year}-${String(sequential).padStart(5, '0')}`;
}

export async function generateHospitalNumber(orgId: string): Promise<string> {
  return localGenerate(orgId);
}
