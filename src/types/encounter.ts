import type { DepartmentId } from './disease';

export type EncounterPhase =
  | 'triage' | 'presenting_complaint' | 'hpi' | 'pmh' | 'drug_allergy'
  | 'social_history' | 'examination' | 'ddx' | 'investigations'
  | 'diagnosis' | 'treatment' | 'disposition' | 'follow_up';

export interface EncounterState {
  id: string;
  patientId: string;
  departmentId: DepartmentId;
  phase: EncounterPhase;
  data: Record<string, any>;
  startedAt: string;
  updatedAt: string;
}
