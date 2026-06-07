export { CARD_DISEASES } from './card';
export { IM_DISEASES } from './im';
export { OB_DISEASES } from './ob';
export { PAED_DISEASES } from './paed';
export { PSYCH_DISEASES } from './psych';
export { SURG_DISEASES } from './surgery';

import type { DiseaseIntelligence } from '../core';
import { CARD_DISEASES } from './card';
import { IM_DISEASES } from './im';
import { OB_DISEASES } from './ob';
import { PAED_DISEASES } from './paed';
import { PSYCH_DISEASES } from './psych';
import { SURG_DISEASES } from './surgery';

export const DISEASES_BY_DEPT: Record<string, DiseaseIntelligence[]> = {
  CARD: CARD_DISEASES,
  IM: IM_DISEASES,
  OB: OB_DISEASES,
  PAED: PAED_DISEASES,
  PSYCH: PSYCH_DISEASES,
  SURG: SURG_DISEASES,
};

export function getDiseasesForDept(deptKey: string): DiseaseIntelligence[] {
  return DISEASES_BY_DEPT[deptKey] || [];
}

export function getDiseasesForUnit(deptKey: string, unitId: string): DiseaseIntelligence[] {
  return (DISEASES_BY_DEPT[deptKey] || []).filter(d => d.subspecialtyId === unitId);
}

export function getDiseaseById(id: string): DiseaseIntelligence | undefined {
  for (const diseases of Object.values(DISEASES_BY_DEPT)) {
    const found = diseases.find(d => d.id === id);
    if (found) return found;
  }
  return undefined;
}
