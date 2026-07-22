import type {
  FunctionalStatus,
  ADLStatus,
  ADLDomain,
  SymptomAttribute,
} from '../encounter-brain/types';

type ImpactLevel = 'none' | 'mild' | 'moderate' | 'severe' | 'bedridden';

const ALL_ADL_DOMAINS: ADLDomain[] = [
  'mobility', 'feeding', 'bathing', 'dressing', 'toileting', 'continence', 'transfer',
];

const OCCUPATION_IMPACTS: Record<string, string> = {
  teacher: 'affects teaching ability',
  driver: 'affects driving ability',
  student: 'affects school performance',
  nurse: 'affects patient care duties',
  farmer: 'affects manual labour capacity',
  office_worker: 'affects desk-work concentration',
  factory_worker: 'affects physical task performance',
};

export function createFunctionalStatus(occupation: string): FunctionalStatus {
  return {
    occupation,
    workImpact: 'unknown',
    dailyActivities: ALL_ADL_DOMAINS.map(domain => ({
      domain,
      independence: 'unknown',
      details: '',
    })),
    overallImpact: 'none',
    caregiverAvailable: false,
  };
}

function getSeverityLevel(symptomAttributes: Record<string, SymptomAttribute>): ImpactLevel {
  const painAttr = symptomAttributes['pain_severity'];
  if (!painAttr) return 'mild';
  const value = typeof painAttr.value === 'number' ? painAttr.value : Number(painAttr.value);
  if (isNaN(value)) return 'mild';
  if (value > 7) return 'severe';
  if (value > 4) return 'moderate';
  return 'mild';
}

function getOccupationImpact(occupation: string): string {
  const lower = occupation.toLowerCase();
  for (const [key, desc] of Object.entries(OCCUPATION_IMPACTS)) {
    if (lower.includes(key)) return desc;
  }
  return 'affects occupational performance';
}

function isStudent(occupation: string): boolean {
  return occupation.toLowerCase().includes('student');
}

export function assessFunctionalImpact(
  symptomAttributes: Record<string, SymptomAttribute>,
  occupation: string,
): { overallImpact: ImpactLevel; workImpact: string; schoolAttendance: string } {
  const severity = getSeverityLevel(symptomAttributes);
  const occImpact = getOccupationImpact(occupation);

  let workImpact = occImpact;
  let schoolAttendance = 'not_applicable';

  if (severity === 'severe' || severity === 'bedridden') {
    workImpact = `Unable to work — ${occImpact}`;
    if (isStudent(occupation)) {
      schoolAttendance = 'unable_to_attend';
    }
  } else if (severity === 'moderate') {
    workImpact = `Working with difficulty — ${occImpact}`;
    if (isStudent(occupation)) {
      schoolAttendance = 'attending_with_difficulty';
    }
  } else {
    workImpact = `Working normally — ${occImpact}`;
    if (isStudent(occupation)) {
      schoolAttendance = 'attending_normally';
    }
  }

  return { overallImpact: severity, workImpact, schoolAttendance };
}

export function getFunctionalStatusQuestions(
  age: number,
  occupation: string,
  hasChronicDisease: boolean,
): string[] {
  const questions: string[] = [
    'functional_impact',
    'impact_daily_activity',
    'impact_sleep',
    'impact_work',
    'impact_social',
  ];

  const lowerOcc = occupation.toLowerCase();

  if (lowerOcc.includes('student')) {
    questions.push('school_attendance', 'school_performance');
  }

  if (!lowerOcc.includes('student') && !lowerOcc.includes('retired') && !lowerOcc.includes('unemployed')) {
    questions.push('work_capacity', 'work_days_missed');
  }

  if (age >= 65) {
    questions.push('walking', 'bathing', 'dressing', 'toileting', 'turning');
  }

  if (hasChronicDisease) {
    questions.push('disease_self_management');
  }

  return questions;
}

export function getFunctionalStatusNarrative(status: FunctionalStatus): string {
  const parts: string[] = [];

  parts.push(`Occupation: ${status.occupation}.`);
  parts.push(`Overall functional impact: ${status.overallImpact}.`);

  if (status.workImpact && status.workImpact !== 'unknown') {
    parts.push(`Work impact: ${status.workImpact}.`);
  }

  if (status.schoolAttendance && status.schoolAttendance !== 'not_applicable') {
    parts.push(`School attendance: ${status.schoolAttendance}.`);
  }

  const dependentActivities = status.dailyActivities.filter(
    a => a.independence !== 'independent' && a.independence !== 'unknown',
  );
  if (dependentActivities.length > 0) {
    const adlDescriptions = dependentActivities.map(
      a => `${a.domain}: ${a.independence}${a.details ? ` (${a.details})` : ''}`,
    );
    parts.push(`Activities of daily living affected: ${adlDescriptions.join('; ')}.`);
  }

  if (status.caregiverAvailable) {
    parts.push(`Caregiver available: ${status.caregiverName ?? 'Yes'}.`);
  } else {
    parts.push('No caregiver available.');
  }

  return parts.join(' ');
}

function getADLIndependence(
  domain: ADLDomain,
  age: number,
  impact: ImpactLevel,
): { independence: ADLStatus['independence']; details: string } {
  if (impact === 'bedridden') {
    return { independence: 'dependent', details: `Completely dependent for ${domain} due to being bedridden` };
  }

  if (impact === 'severe') {
    if (domain === 'mobility' || domain === 'bathing' || domain === 'transfer') {
      return { independence: 'requires_assistance', details: `Requires significant assistance with ${domain}` };
    }
    return { independence: 'independent', details: '' };
  }

  if (impact === 'moderate') {
    if (domain === 'mobility') {
      return { independence: 'requires_assistance', details: 'Requires some assistance with mobility' };
    }
    return { independence: 'independent', details: '' };
  }

  if (age >= 65 && (domain === 'mobility' || domain === 'bathing' || domain === 'dressing')) {
    return { independence: 'independent', details: 'Age-related baseline without acute impairment' };
  }

  return { independence: 'independent', details: '' };
}

export function getADLAssessment(age: number, functionalImpact: ImpactLevel): ADLStatus[] {
  return ALL_ADL_DOMAINS.map(domain => {
    const { independence, details } = getADLIndependence(domain, age, functionalImpact);
    return { domain, independence, details };
  });
}
