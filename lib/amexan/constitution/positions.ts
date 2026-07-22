import type { AmxUid, ProfessionalCategory } from './types';

export type PositionLevel =
  | 'intern' | 'medical_officer' | 'registrar' | 'senior_registrar'
  | 'consultant' | 'senior_consultant' | 'head_of_department'
  | 'clinical_director' | 'medical_director' | 'ceo'
  | 'nurse_intern' | 'staff_nurse' | 'senior_nurse' | 'nurse_manager'
  | 'chief_nursing_officer'
  | 'pharmacist_intern' | 'pharmacist' | 'senior_pharmacist' | 'chief_pharmacist'
  | 'lab_intern' | 'lab_technologist' | 'senior_lab_technologist' | 'lab_manager'
  | 'radiographer' | 'senior_radiographer' | 'radiologist'
  | 'physiotherapist' | 'senior_physiotherapist'
  | 'occupational_therapist' | 'senior_occupational_therapist'
  | 'nutritionist' | 'senior_nutritionist'
  | 'social_worker' | 'senior_social_worker'
  | 'psychologist' | 'senior_psychologist'
  | 'clinical_officer' | 'senior_clinical_officer'
  | 'midwife' | 'senior_midwife' | 'midwife_manager'
  | 'community_health_worker' | 'senior_community_health_worker'
  | 'receptionist' | 'records_officer' | 'administrator'
  | 'it_officer' | 'finance_officer' | 'hr_officer'
  | 'facility_admin' | 'super_admin';

export interface PositionInfo {
  level: PositionLevel;
  title: string;
  category: ProfessionalCategory;
  seniority: number;
  requiresLicense: boolean;
  canPrescribe: boolean;
  canOrderLabs: boolean;
  canOrderImaging: boolean;
  canAdmit: boolean;
  canDischarge: boolean;
  canPerformSurgery: boolean;
  canSupervise: boolean;
}

const POSITIONS: Record<PositionLevel, PositionInfo> = {
  intern: { level: 'intern', title: 'Medical Intern', category: 'medical_doctor', seniority: 1, requiresLicense: false, canPrescribe: false, canOrderLabs: false, canOrderImaging: false, canAdmit: false, canDischarge: false, canPerformSurgery: false, canSupervise: false },
  medical_officer: { level: 'medical_officer', title: 'Medical Officer', category: 'medical_doctor', seniority: 2, requiresLicense: true, canPrescribe: true, canOrderLabs: true, canOrderImaging: true, canAdmit: true, canDischarge: true, canPerformSurgery: false, canSupervise: false },
  registrar: { level: 'registrar', title: 'Registrar', category: 'medical_doctor', seniority: 3, requiresLicense: true, canPrescribe: true, canOrderLabs: true, canOrderImaging: true, canAdmit: true, canDischarge: true, canPerformSurgery: true, canSupervise: false },
  senior_registrar: { level: 'senior_registrar', title: 'Senior Registrar', category: 'medical_doctor', seniority: 4, requiresLicense: true, canPrescribe: true, canOrderLabs: true, canOrderImaging: true, canAdmit: true, canDischarge: true, canPerformSurgery: true, canSupervise: true },
  consultant: { level: 'consultant', title: 'Consultant', category: 'medical_doctor', seniority: 5, requiresLicense: true, canPrescribe: true, canOrderLabs: true, canOrderImaging: true, canAdmit: true, canDischarge: true, canPerformSurgery: true, canSupervise: true },
  senior_consultant: { level: 'senior_consultant', title: 'Senior Consultant', category: 'medical_doctor', seniority: 6, requiresLicense: true, canPrescribe: true, canOrderLabs: true, canOrderImaging: true, canAdmit: true, canDischarge: true, canPerformSurgery: true, canSupervise: true },
  head_of_department: { level: 'head_of_department', title: 'Head of Department', category: 'medical_doctor', seniority: 7, requiresLicense: true, canPrescribe: true, canOrderLabs: true, canOrderImaging: true, canAdmit: true, canDischarge: true, canPerformSurgery: true, canSupervise: true },
  clinical_director: { level: 'clinical_director', title: 'Clinical Director', category: 'medical_doctor', seniority: 8, requiresLicense: true, canPrescribe: true, canOrderLabs: true, canOrderImaging: true, canAdmit: true, canDischarge: true, canPerformSurgery: true, canSupervise: true },
  medical_director: { level: 'medical_director', title: 'Medical Director', category: 'medical_doctor', seniority: 9, requiresLicense: true, canPrescribe: false, canOrderLabs: false, canOrderImaging: false, canAdmit: false, canDischarge: false, canPerformSurgery: false, canSupervise: true },
  ceo: { level: 'ceo', title: 'Chief Executive Officer', category: 'administrator', seniority: 10, requiresLicense: false, canPrescribe: false, canOrderLabs: false, canOrderImaging: false, canAdmit: false, canDischarge: false, canPerformSurgery: false, canSupervise: true },

  nurse_intern: { level: 'nurse_intern', title: 'Nursing Intern', category: 'nurse', seniority: 1, requiresLicense: false, canPrescribe: false, canOrderLabs: false, canOrderImaging: false, canAdmit: false, canDischarge: false, canPerformSurgery: false, canSupervise: false },
  staff_nurse: { level: 'staff_nurse', title: 'Staff Nurse', category: 'nurse', seniority: 2, requiresLicense: true, canPrescribe: false, canOrderLabs: false, canOrderImaging: false, canAdmit: false, canDischarge: false, canPerformSurgery: false, canSupervise: false },
  senior_nurse: { level: 'senior_nurse', title: 'Senior Nurse', category: 'nurse', seniority: 3, requiresLicense: true, canPrescribe: false, canOrderLabs: false, canOrderImaging: false, canAdmit: false, canDischarge: false, canPerformSurgery: false, canSupervise: true },
  nurse_manager: { level: 'nurse_manager', title: 'Nurse Manager', category: 'nurse', seniority: 4, requiresLicense: true, canPrescribe: false, canOrderLabs: false, canOrderImaging: false, canAdmit: false, canDischarge: false, canPerformSurgery: false, canSupervise: true },
  chief_nursing_officer: { level: 'chief_nursing_officer', title: 'Chief Nursing Officer', category: 'nurse', seniority: 5, requiresLicense: true, canPrescribe: false, canOrderLabs: false, canOrderImaging: false, canAdmit: false, canDischarge: false, canPerformSurgery: false, canSupervise: true },

  pharmacist_intern: { level: 'pharmacist_intern', title: 'Pharmacy Intern', category: 'pharmacist', seniority: 1, requiresLicense: false, canPrescribe: false, canOrderLabs: false, canOrderImaging: false, canAdmit: false, canDischarge: false, canPerformSurgery: false, canSupervise: false },
  pharmacist: { level: 'pharmacist', title: 'Pharmacist', category: 'pharmacist', seniority: 2, requiresLicense: true, canPrescribe: false, canOrderLabs: false, canOrderImaging: false, canAdmit: false, canDischarge: false, canPerformSurgery: false, canSupervise: false },
  senior_pharmacist: { level: 'senior_pharmacist', title: 'Senior Pharmacist', category: 'pharmacist', seniority: 3, requiresLicense: true, canPrescribe: false, canOrderLabs: false, canOrderImaging: false, canAdmit: false, canDischarge: false, canPerformSurgery: false, canSupervise: true },
  chief_pharmacist: { level: 'chief_pharmacist', title: 'Chief Pharmacist', category: 'pharmacist', seniority: 4, requiresLicense: true, canPrescribe: false, canOrderLabs: false, canOrderImaging: false, canAdmit: false, canDischarge: false, canPerformSurgery: false, canSupervise: true },

  lab_intern: { level: 'lab_intern', title: 'Lab Intern', category: 'lab_technologist', seniority: 1, requiresLicense: false, canPrescribe: false, canOrderLabs: false, canOrderImaging: false, canAdmit: false, canDischarge: false, canPerformSurgery: false, canSupervise: false },
  lab_technologist: { level: 'lab_technologist', title: 'Lab Technologist', category: 'lab_technologist', seniority: 2, requiresLicense: true, canPrescribe: false, canOrderLabs: false, canOrderImaging: false, canAdmit: false, canDischarge: false, canPerformSurgery: false, canSupervise: false },
  senior_lab_technologist: { level: 'senior_lab_technologist', title: 'Senior Lab Technologist', category: 'lab_technologist', seniority: 3, requiresLicense: true, canPrescribe: false, canOrderLabs: false, canOrderImaging: false, canAdmit: false, canDischarge: false, canPerformSurgery: false, canSupervise: true },
  lab_manager: { level: 'lab_manager', title: 'Lab Manager', category: 'lab_technologist', seniority: 4, requiresLicense: true, canPrescribe: false, canOrderLabs: false, canOrderImaging: false, canAdmit: false, canDischarge: false, canPerformSurgery: false, canSupervise: true },

  radiographer: { level: 'radiographer', title: 'Radiographer', category: 'radiographer', seniority: 2, requiresLicense: true, canPrescribe: false, canOrderLabs: false, canOrderImaging: false, canAdmit: false, canDischarge: false, canPerformSurgery: false, canSupervise: false },
  senior_radiographer: { level: 'senior_radiographer', title: 'Senior Radiographer', category: 'radiographer', seniority: 3, requiresLicense: true, canPrescribe: false, canOrderLabs: false, canOrderImaging: false, canAdmit: false, canDischarge: false, canPerformSurgery: false, canSupervise: true },
  radiologist: { level: 'radiologist', title: 'Radiologist', category: 'medical_doctor', seniority: 5, requiresLicense: true, canPrescribe: false, canOrderLabs: false, canOrderImaging: true, canAdmit: false, canDischarge: false, canPerformSurgery: false, canSupervise: true },

  clinical_officer: { level: 'clinical_officer', title: 'Clinical Officer', category: 'clinical_officer', seniority: 2, requiresLicense: true, canPrescribe: true, canOrderLabs: true, canOrderImaging: true, canAdmit: true, canDischarge: true, canPerformSurgery: false, canSupervise: false },
  senior_clinical_officer: { level: 'senior_clinical_officer', title: 'Senior Clinical Officer', category: 'clinical_officer', seniority: 3, requiresLicense: true, canPrescribe: true, canOrderLabs: true, canOrderImaging: true, canAdmit: true, canDischarge: true, canPerformSurgery: true, canSupervise: true },

  midwife: { level: 'midwife', title: 'Midwife', category: 'midwife', seniority: 2, requiresLicense: true, canPrescribe: false, canOrderLabs: false, canOrderImaging: false, canAdmit: false, canDischarge: false, canPerformSurgery: false, canSupervise: false },
  senior_midwife: { level: 'senior_midwife', title: 'Senior Midwife', category: 'midwife', seniority: 3, requiresLicense: true, canPrescribe: false, canOrderLabs: false, canOrderImaging: false, canAdmit: false, canDischarge: false, canPerformSurgery: false, canSupervise: true },
  midwife_manager: { level: 'midwife_manager', title: 'Midwife Manager', category: 'midwife', seniority: 4, requiresLicense: true, canPrescribe: false, canOrderLabs: false, canOrderImaging: false, canAdmit: false, canDischarge: false, canPerformSurgery: false, canSupervise: true },

  community_health_worker: { level: 'community_health_worker', title: 'Community Health Worker', category: 'community_health_worker', seniority: 1, requiresLicense: false, canPrescribe: false, canOrderLabs: false, canOrderImaging: false, canAdmit: false, canDischarge: false, canPerformSurgery: false, canSupervise: false },
  senior_community_health_worker: { level: 'senior_community_health_worker', title: 'Senior CHW', category: 'community_health_worker', seniority: 2, requiresLicense: false, canPrescribe: false, canOrderLabs: false, canOrderImaging: false, canAdmit: false, canDischarge: false, canPerformSurgery: false, canSupervise: true },

  physiotherapist: { level: 'physiotherapist', title: 'Physiotherapist', category: 'physiotherapist', seniority: 2, requiresLicense: true, canPrescribe: false, canOrderLabs: false, canOrderImaging: false, canAdmit: false, canDischarge: false, canPerformSurgery: false, canSupervise: false },
  senior_physiotherapist: { level: 'senior_physiotherapist', title: 'Senior Physiotherapist', category: 'physiotherapist', seniority: 3, requiresLicense: true, canPrescribe: false, canOrderLabs: false, canOrderImaging: false, canAdmit: false, canDischarge: false, canPerformSurgery: false, canSupervise: true },

  occupational_therapist: { level: 'occupational_therapist', title: 'Occupational Therapist', category: 'occupational_therapist', seniority: 2, requiresLicense: true, canPrescribe: false, canOrderLabs: false, canOrderImaging: false, canAdmit: false, canDischarge: false, canPerformSurgery: false, canSupervise: false },
  senior_occupational_therapist: { level: 'senior_occupational_therapist', title: 'Senior OT', category: 'occupational_therapist', seniority: 3, requiresLicense: true, canPrescribe: false, canOrderLabs: false, canOrderImaging: false, canAdmit: false, canDischarge: false, canPerformSurgery: false, canSupervise: true },

  nutritionist: { level: 'nutritionist', title: 'Nutritionist', category: 'nutritionist', seniority: 2, requiresLicense: true, canPrescribe: false, canOrderLabs: false, canOrderImaging: false, canAdmit: false, canDischarge: false, canPerformSurgery: false, canSupervise: false },
  senior_nutritionist: { level: 'senior_nutritionist', title: 'Senior Nutritionist', category: 'nutritionist', seniority: 3, requiresLicense: true, canPrescribe: false, canOrderLabs: false, canOrderImaging: false, canAdmit: false, canDischarge: false, canPerformSurgery: false, canSupervise: true },

  social_worker: { level: 'social_worker', title: 'Social Worker', category: 'social_worker', seniority: 2, requiresLicense: true, canPrescribe: false, canOrderLabs: false, canOrderImaging: false, canAdmit: false, canDischarge: false, canPerformSurgery: false, canSupervise: false },
  senior_social_worker: { level: 'senior_social_worker', title: 'Senior Social Worker', category: 'social_worker', seniority: 3, requiresLicense: true, canPrescribe: false, canOrderLabs: false, canOrderImaging: false, canAdmit: false, canDischarge: false, canPerformSurgery: false, canSupervise: true },

  psychologist: { level: 'psychologist', title: 'Psychologist', category: 'psychologist', seniority: 2, requiresLicense: true, canPrescribe: false, canOrderLabs: false, canOrderImaging: false, canAdmit: false, canDischarge: false, canPerformSurgery: false, canSupervise: false },
  senior_psychologist: { level: 'senior_psychologist', title: 'Senior Psychologist', category: 'psychologist', seniority: 3, requiresLicense: true, canPrescribe: false, canOrderLabs: false, canOrderImaging: false, canAdmit: false, canDischarge: false, canPerformSurgery: false, canSupervise: true },

  receptionist: { level: 'receptionist', title: 'Receptionist', category: 'receptionist', seniority: 1, requiresLicense: false, canPrescribe: false, canOrderLabs: false, canOrderImaging: false, canAdmit: false, canDischarge: false, canPerformSurgery: false, canSupervise: false },
  records_officer: { level: 'records_officer', title: 'Records Officer', category: 'records_officer', seniority: 1, requiresLicense: false, canPrescribe: false, canOrderLabs: false, canOrderImaging: false, canAdmit: false, canDischarge: false, canPerformSurgery: false, canSupervise: false },
  administrator: { level: 'administrator', title: 'Administrator', category: 'administrator', seniority: 2, requiresLicense: false, canPrescribe: false, canOrderLabs: false, canOrderImaging: false, canAdmit: false, canDischarge: false, canPerformSurgery: false, canSupervise: false },
  it_officer: { level: 'it_officer', title: 'IT Officer', category: 'it_staff', seniority: 2, requiresLicense: false, canPrescribe: false, canOrderLabs: false, canOrderImaging: false, canAdmit: false, canDischarge: false, canPerformSurgery: false, canSupervise: false },
  finance_officer: { level: 'finance_officer', title: 'Finance Officer', category: 'finance_staff', seniority: 2, requiresLicense: false, canPrescribe: false, canOrderLabs: false, canOrderImaging: false, canAdmit: false, canDischarge: false, canPerformSurgery: false, canSupervise: false },
  hr_officer: { level: 'hr_officer', title: 'HR Officer', category: 'hr_staff', seniority: 2, requiresLicense: false, canPrescribe: false, canOrderLabs: false, canOrderImaging: false, canAdmit: false, canDischarge: false, canPerformSurgery: false, canSupervise: false },
  facility_admin: { level: 'facility_admin', title: 'Facility Admin', category: 'facility_admin', seniority: 5, requiresLicense: false, canPrescribe: false, canOrderLabs: false, canOrderImaging: false, canAdmit: false, canDischarge: false, canPerformSurgery: false, canSupervise: true },
  super_admin: { level: 'super_admin', title: 'Super Admin', category: 'super_admin', seniority: 10, requiresLicense: false, canPrescribe: false, canOrderLabs: false, canOrderImaging: false, canAdmit: false, canDischarge: false, canPerformSurgery: false, canSupervise: true },
};

export function getPositionInfo(level: PositionLevel): PositionInfo {
  return POSITIONS[level];
}

export function getPositionAuthority(level: PositionLevel): number {
  return POSITIONS[level]?.seniority ?? 0;
}

export function getSupervisorChain(levels: PositionLevel[]): PositionLevel[] {
  const currentSeniority = Math.max(...levels.map(l => POSITIONS[l]?.seniority ?? 0));
  return (Object.entries(POSITIONS) as [PositionLevel, PositionInfo][])
    .filter(([_, info]) => info.seniority > currentSeniority && info.canSupervise)
    .sort(([, a], [, b]) => a.seniority - b.seniority)
    .map(([level]) => level);
}

export function getPositionsByCategory(category: ProfessionalCategory): PositionInfo[] {
  return (Object.entries(POSITIONS) as [PositionLevel, PositionInfo][])
    .filter(([_, info]) => info.category === category)
    .sort(([, a], [, b]) => a.seniority - b.seniority)
    .map(([_, info]) => info);
}

export function getAllPositions(): PositionInfo[] {
  return Object.values(POSITIONS).sort((a, b) => a.seniority - b.seniority);
}

export function canSuperviseLevel(supervisorLevel: PositionLevel, superviseeLevel: PositionLevel): boolean {
  const sup = POSITIONS[supervisorLevel];
  const sub = POSITIONS[superviseeLevel];
  if (!sup || !sub) return false;
  return sup.seniority > sub.seniority && sup.canSupervise;
}
