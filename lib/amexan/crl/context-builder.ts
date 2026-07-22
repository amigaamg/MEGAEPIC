import type { RuleContext, AgeCategory, ComplaintContext } from './types';

export interface WorkflowState {
  biodata: {
    name: string;
    age: string;
    ageUnit: 'years' | 'months' | 'days';
    sex: '' | 'male' | 'female';
    residence: string;
    occupation: string;
  };
  complaints: Array<{
    concept: string;
    bodySystem: string;
    text?: string;
    onset?: string;
    duration?: string;
    severity?: number;
  }>;
  conditions: string[];
  currentStep: string;
  completedSteps: string[];
}

function computeAgeCategory(age: number, unit: 'days' | 'months' | 'years'): AgeCategory {
  let ageInDays: number;
  switch (unit) {
    case 'years': ageInDays = age * 365; break;
    case 'months': ageInDays = age * 30; break;
    case 'days': ageInDays = age; break;
    default: return 'adult';
  }
  if (ageInDays < 28) return 'neonate';
  if (ageInDays < 365) return 'infant';
  if (age < 10) return 'child';
  if (age < 20) return 'adolescent';
  if (age < 65) return 'adult';
  return 'older_adult';
}

export function buildRuleContext(state: WorkflowState): RuleContext {
  const age = parseInt(String(state.biodata.age)) || 0;
  const ageUnit = (state.biodata.ageUnit || 'years') as 'days' | 'months' | 'years';
  const rawSex: string = state.biodata.sex || 'unknown';
  const sex = (rawSex === '' ? 'unknown' : rawSex) as 'male' | 'female' | 'unknown';

  const complaintConcepts = state.complaints
    .map(c => c.concept)
    .filter((c): c is string => Boolean(c));

  const complaintContexts: ComplaintContext[] = state.complaints.map(c => ({
    id: c.concept || 'other',
    patientStatement: c.text || c.concept || 'Unknown',
    normalizedConcept: c.concept || 'other',
    bodySystem: c.bodySystem || 'general',
    onset: c.onset || '',
    duration: c.duration || '',
    severity: c.severity ?? 5,
    active: true,
  }));

  const ageCategory = state.biodata.age && state.biodata.ageUnit
    ? computeAgeCategory(age, ageUnit)
    : 'adult';

  return {
    patient: {
      id: 'current',
      age,
      ageUnit,
      sex,
      pregnant: null,
      postpartum: false,
      ageCategory,
      knownConditions: state.conditions.filter(Boolean),
      knownAllergies: [],
      knownMedications: [],
      occupation: state.biodata.occupation || undefined,
      residence: state.biodata.residence || undefined,
    },
    encounter: {
      id: 'enc-1',
      type: 'emergency',
      department: 'general',
      facility: 'default',
      priority: 'routine',
      status: 'active',
      complaints: complaintContexts,
      currentStep: state.currentStep,
      completedSteps: state.completedSteps,
      hasAbdominalPain: complaintConcepts.includes('abdominal_pain'),
      hasDiabeticFoot: complaintConcepts.includes('foot_ulcer') || complaintConcepts.includes('leg_ulcer'),
      isTrauma: complaintConcepts.includes('trauma') || complaintConcepts.includes('injury') || complaintConcepts.includes('wound'),
      isPostpartum: false,
    },
    user: {
      id: 'user-1',
      role: 'doctor',
      specialty: 'general',
      department: 'general',
      facilityId: 'default',
    },
    environment: {
      facilityType: 'hospital',
      country: 'unknown',
      region: 'unknown',
      hasICU: true,
      hasLab: true,
      hasRadiology: true,
      hasPharmacy: true,
      timeOfDay: new Date().getHours(),
    },
  };
}
