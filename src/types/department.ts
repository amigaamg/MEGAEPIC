import type { DepartmentSection } from '../engine/knowledge-graph/departments';

export interface DepartmentSummary {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  color: string;
  sectionCount: number;
  diseaseCount: number;
  activeEncounters: number;
}
