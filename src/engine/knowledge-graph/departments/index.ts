export interface DepartmentDefinition {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  color: string;
  sections: DepartmentSection[];
  commonSymptoms: string[];
  commonInvestigations: string[];
}

export interface DepartmentSection {
  id: string;
  name: string;
  description: string;
  diseaseCategories: string[];
}

export { internalMedicine } from './internal-medicine';
export { cardiology } from './cardiology';
export { endocrinology } from './endocrinology';
export { respiratory } from './respiratory';
export { nephrology } from './nephrology';
export { neurology } from './neurology';
export { gastroenterology } from './gastroenterology';
export { obstetrics } from './obstetrics';
export { gynecology } from './gynecology';
export { pediatrics } from './pediatrics';
export { psychiatry } from './psychiatry';
export { surgery } from './surgery';
export { orthopedics } from './orthopedics';
export { dermatology } from './dermatology';
export { hematology } from './hematology';
export { oncology } from './oncology';
export { emergencyMedicine } from './emergency-medicine';
export { criticalCare } from './critical-care';
export { ent } from './ent';
export { ophthalmology } from './ophthalmology';
export { urology } from './urology';
export { infectiousDisease } from './infectious-disease';
export { rheumatology } from './rheumatology';
export { geriatrics } from './geriatrics';
export { radiology } from './radiology';
export { laboratoryMedicine } from './laboratory-medicine';
export { pharmacy } from './pharmacy';
