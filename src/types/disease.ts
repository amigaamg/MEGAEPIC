export type DepartmentId =
  | 'IM' | 'CARD' | 'ENDO' | 'RESP' | 'RENAL' | 'NEURO' | 'GI'
  | 'OB' | 'GYN' | 'PAED' | 'PSYCH' | 'SURG' | 'ORTHO' | 'DERM'
  | 'HAEM' | 'ONCO' | 'EM' | 'ICU' | 'ENT' | 'OPHTH' | 'URO'
  | 'ID' | 'RHEUM' | 'GERI' | 'RAD' | 'LAB' | 'PHARM';

export interface DiseaseSummary {
  id: string;
  name: string;
  departmentId: DepartmentId;
  section: string;
  prevalence: 'very_common' | 'common' | 'uncommon' | 'rare';
  emergency: boolean;
  mustNotMiss: boolean;
}
