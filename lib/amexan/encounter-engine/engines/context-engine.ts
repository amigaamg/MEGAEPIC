import { Biodata, AgeGroup, ModuleType } from '../types/ces';
import { detectActiveModules } from '../rules/modules';
import type { ConstitutionalContext, ComplaintObject } from '../knowledge/symptom-types';

export function determineAgeGroup(age: number): AgeGroup {
  if (age < 0.08) return 'neonate';
  if (age < 1) return 'infant';
  if (age < 13) return 'child';
  if (age < 18) return 'adolescent';
  if (age < 65) return 'adult';
  return 'elderly';
}

export function buildBiodata(raw: Partial<Biodata>): Biodata {
  const age = raw.age || 0;
  const ageGroup = determineAgeGroup(age);
  const weight = raw.weight || 0;
  const height = raw.height || 0;
  const bmi = weight > 0 && height > 0 ? Math.round((weight / ((height / 100) * (height / 100))) * 10) / 10 : undefined;

  return {
    patientName: raw.patientName || '',
    hospitalNumber: raw.hospitalNumber || '',
    age,
    ageGroup,
    dateOfBirth: raw.dateOfBirth || '',
    sex: raw.sex || 'male',
    gender: raw.gender,
    maritalStatus: raw.maritalStatus,
    occupation: raw.occupation,
    education: raw.education,
    religion: raw.religion,
    residence: raw.residence,
    nationality: raw.nationality,
    nextOfKin: raw.nextOfKin,
    contact: raw.contact,
    informant: raw.informant || 'Patient',
    informantRelation: raw.informantRelation,
    reliability: raw.reliability || 'Good',
    dateOfAdmission: raw.dateOfAdmission,
    department: raw.department || '',
    hospital: raw.hospital || '',
    encounterType: raw.encounterType || 'outpatient',
    encounterNumber: raw.encounterNumber,
    date: raw.date || new Date().toISOString().split('T')[0],
    time: raw.time || new Date().toTimeString().split(' ')[0],
    clinician: raw.clinician || '',
    referralSource: raw.referralSource,
    modeOfArrival: raw.modeOfArrival,
    triageCategory: raw.triageCategory,
    insurance: raw.insurance,
    language: raw.language,
    weight,
    height,
    bmi,
  };
}

export interface PatientContext {
  biodata: Biodata;
  activeModules: ModuleType[];
  isPregnant: boolean;
  isEmergency: boolean;
  isSurgical: boolean;
  isPsychiatric: boolean;
  ageSpecificLabel: string;
}

export function buildPatientContext(
  biodata: Biodata,
  complaints: { complaint: string }[],
  facts: Record<string, { value: any }>
): PatientContext {
  const activeModules = detectActiveModules(biodata, complaints as any, facts as any);

  const ageLabels: Record<AgeGroup, string> = {
    neonate: 'Neonatal',
    infant: 'Infant',
    child: 'Pediatric',
    adolescent: 'Adolescent',
    adult: 'Adult',
    elderly: 'Geriatric',
  };

  return {
    biodata,
    activeModules,
    isPregnant: activeModules.includes('pregnancy'),
    isEmergency: activeModules.includes('emergency'),
    isSurgical: activeModules.includes('surgery'),
    isPsychiatric: activeModules.includes('psychiatry'),
    ageSpecificLabel: ageLabels[biodata.ageGroup],
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTITUTIONAL CONTEXT BUILDER
// Produces the full ConstitutionalContext from biodata + clinical state.
// ═══════════════════════════════════════════════════════════════════════════════

export interface ConstitutionalContextInput {
  biodata: Biodata
  complaints: ComplaintObject[]
  knownDiseases?: { id: string; name: string; active: boolean }[]
  currentMedications?: { id: string; name: string; category: string }[]
  knownAllergies?: { id: string; allergen: string; severity: string }[]
  workingDiagnoses?: string[]
  capturedFacts?: Record<string, string | number | boolean | string[]>
}

export function buildConstitutionalContext(input: ConstitutionalContextInput): ConstitutionalContext {
  const { biodata, complaints, knownDiseases, currentMedications, knownAllergies, workingDiagnoses, capturedFacts } = input;

  const activeModules = detectActiveModules(biodata, complaints as any, {});

  return {
    age: biodata.age,
    sex: biodata.sex || 'male',
    pregnant: activeModules.includes('pregnancy'),
    encounterType: biodata.encounterType || 'outpatient',
    department: biodata.department || '',
    specialty: biodata.clinician?.split(' - ')[1],
    location: biodata.encounterType === 'inpatient' ? 'ward' : 'clinic',
    chiefComplaints: complaints,
    knownDiseases: knownDiseases || [],
    currentMedications: currentMedications || [],
    knownAllergies: knownAllergies || [],
    workingDiagnoses: workingDiagnoses || [],
    capturedFacts: capturedFacts || {},
    module: determineModule(biodata, activeModules),
  };
}

function determineModule(biodata: Biodata, activeModules: ModuleType[]): string {
  if (biodata.ageGroup === 'neonate') return 'neonatal';
  if (biodata.ageGroup === 'infant' || biodata.ageGroup === 'child') return 'pediatric';
  if (activeModules.includes('pregnancy')) return 'obstetric';
  if (activeModules.includes('psychiatry')) return 'psychiatric';
  if (activeModules.includes('surgery')) return 'surgical';
  return 'adult';
}
