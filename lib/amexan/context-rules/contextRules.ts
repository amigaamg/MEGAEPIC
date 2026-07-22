import type {
  EncounterBrainState,
  PatientContext,
  EncounterContext,
  AgeCategory,
  Sex,
  Acuity,
  ChronicDiseaseObject,
} from '../encounter-brain/types';

interface IllnessContextResult {
  hasChronicDisease: boolean;
  chronicDiseases: ChronicDiseaseObject[];
  hasPreviousSurgeries: boolean;
  surgeryCount: number;
  knownAllergies: string[];
  currentMedications: { name: string; dose: string; frequency: string }[];
  pastMedicalHistory: string[];
  relevantFamilyHistory: string[];
  socialHistory: string[];
  healthSeekingDelay: number;
}

function now(): number {
  return Date.now();
}

function computeAgeCategory(ageYears: number, ageMonths: number, ageDays: number): AgeCategory {
  if (ageDays < 28) return 'neonate';
  if (ageDays < 365 || ageMonths < 12 || ageYears < 1) return 'infant';
  if (ageYears < 10) return 'child';
  if (ageYears < 20) return 'adolescent';
  if (ageYears < 65) return 'adult';
  return 'older_adult';
}

function computePregnancyStatus(
  sex: Sex,
  ageYears: number,
  knownPregnancy: PatientContext['pregnancyStatus'] | undefined,
): PatientContext['pregnancyStatus'] {
  if (sex !== 'female') return 'not_applicable';
  if (knownPregnancy && knownPregnancy !== 'unknown') return knownPregnancy;
  if (ageYears >= 12 && ageYears <= 55) return 'unknown';
  return 'not_applicable';
}

function computeHasUterus(sex: Sex, ageYears: number): boolean {
  if (sex !== 'female') return false;
  return ageYears >= 12;
}

function computeAcuity(
  encounterType: string,
  priority?: string,
  department?: string,
): Acuity {
  if (priority && ['immediate', 'emergency', 'urgent'].includes(priority)) {
    return priority as Acuity;
  }
  if (encounterType === 'emergency') return 'emergency';
  if (encounterType === 'procedure') return 'urgent';
  if (department === 'icu') return 'immediate';
  if (encounterType === 'follow_up' || encounterType === 'antenatal' || encounterType === 'postnatal') {
    return 'routine';
  }
  return 'routine';
}

function computeEmergencyLevel(acuity: Acuity, isTrauma: boolean, department?: string): 'green' | 'yellow' | 'orange' | 'red' {
  if (acuity === 'immediate') return 'red';
  if (acuity === 'emergency') return 'orange';
  if (isTrauma) return 'orange';
  if (acuity === 'urgent') return 'yellow';
  if (department === 'icu') return 'orange';
  return 'green';
}

function computeReferralStatus(encounterType: string): EncounterContext['referralStatus'] {
  if (encounterType === 'referral') return 'referral';
  if (encounterType === 'follow_up') return 'follow_up';
  return 'self';
}

function isPostoperativeFromEncounter(encounterData: Record<string, unknown>): boolean {
  if (encounterData.isPostoperative === true) return true;
  if (encounterData.operationDate && encounterData.postOpDay !== undefined) return true;
  if (typeof encounterData.postOpDay === 'number' && encounterData.postOpDay > 0) return true;
  return false;
}

function isTraumaFromEncounter(encounterData: Record<string, unknown>): boolean {
  if (encounterData.isTrauma === true) return true;
  if (encounterData.traumaMechanism) return true;
  if (encounterData.department === 'orthopedics') return true;
  return false;
}

function ageDisplay(patient: PatientContext): string {
  if (patient.ageCategory === 'neonate') {
    const days = patient.ageMonths > 0
      ? Math.round(patient.ageMonths * 30.44)
      : Math.round(patient.ageYears * 365);
    return `${days}-day-old`;
  }
  if (patient.ageCategory === 'infant') {
    const months = patient.ageMonths || Math.round(patient.ageYears * 12) || 0;
    return `${months}-month-old`;
  }
  return `${patient.ageYears}-year-old`;
}

function getDurationFromTimeline(brain: EncounterBrainState): string {
  if (brain.timeline.length === 0) return 'unknown duration';
  const earliest = brain.timeline.reduce((earliest, event) => {
    if (event.date < earliest.date) return event;
    return earliest;
  }, brain.timeline[0]);
  const onsetDate = earliest.date;
  const now = new Date();
  const onset = new Date(onsetDate);
  const diffDays = Math.round((now.getTime() - onset.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'less than a day';
  if (diffDays === 1) return '1 day';
  if (diffDays < 30) return `${diffDays} days`;
  const diffMonths = Math.round(diffDays / 30.44);
  if (diffMonths < 12) return `${diffMonths} months`;
  const diffYears = Math.round(diffDays / 365.25);
  return `${diffYears} years`;
}

function getPrimaryComplaintLabel(brain: EncounterBrainState): string {
  if (brain.primarySymptomId && brain.symptoms[brain.primarySymptomId]) {
    return brain.symptoms[brain.primarySymptomId].label;
  }
  return 'the presenting complaint';
}

function getDepartmentalPathways(department: string): string[] {
  const pathwayMap: Record<string, string[]> = {
    surgery: ['general_surgery'],
    medicine: ['internal_medicine'],
    pediatrics: ['pediatrics'],
    obstetrics: ['obstetrics'],
    gynecology: ['gynecology'],
    emergency: ['emergency_medicine'],
    icu: ['critical_care'],
    psychiatry: ['psychiatry'],
    orthopedics: ['orthopedics'],
    neonatology: ['neonatology'],
    geriatrics: ['geriatrics'],
    ophthalmology: ['ophthalmology'],
    ent: ['ent'],
    dermatology: ['dermatology'],
    oncology: ['oncology'],
    cardiology: ['cardiology'],
    respiratory: ['respiratory_medicine'],
    neurology: ['neurology'],
    endocrinology: ['endocrinology'],
    nephrology: ['nephrology'],
    gastroenterology: ['gastroenterology'],
    general: ['general_medicine'],
  };
  return pathwayMap[department] || ['general_medicine'];
}

function getAgeBasedPathways(patient: PatientContext): string[] {
  const pathways: string[] = [];
  if (patient.ageCategory === 'neonate' || patient.ageCategory === 'infant') {
    pathways.push('neonatology');
  }
  if (patient.ageCategory === 'child' || patient.ageCategory === 'infant') {
    pathways.push('pediatrics');
  }
  if (patient.ageCategory === 'adolescent') {
    pathways.push('adolescent_health');
  }
  if (patient.ageCategory === 'older_adult') {
    pathways.push('geriatrics');
  }
  return pathways;
}

function getSexBasedPathways(patient: PatientContext): string[] {
  const pathways: string[] = [];
  if (patient.sex === 'female' && patient.ageYears >= 12 && patient.ageYears <= 55) {
    pathways.push('women_health');
    if (patient.pregnancyStatus === 'pregnant') {
      pathways.push('obstetrics');
    }
    if (patient.pregnancyStatus === 'postpartum') {
      pathways.push('postnatal');
    }
  }
  return pathways;
}

function getChronicDiseasePathways(brain: EncounterBrainState): string[] {
  const pathways: string[] = [];
  const chronicDiseasePathwayMap: Record<string, string[]> = {
    diabetes: ['diabetes_management'],
    diabetes_mellitus: ['diabetes_management'],
    type_1_diabetes: ['diabetes_management', 'diabetes_type_1'],
    type_2_diabetes: ['diabetes_management'],
    hypertension: ['cardiovascular_risk'],
    hypertensive: ['cardiovascular_risk'],
    heart_failure: ['cardiology', 'heart_failure_management'],
    asthma: ['respiratory_medicine', 'asthma_management'],
    copd: ['respiratory_medicine', 'copd_management'],
    hiv: ['infectious_disease', 'hiv_management'],
    tuberculosis: ['infectious_disease', 'tb_management'],
    chronic_kidney_disease: ['nephrology', 'ckd_management'],
    cirrhosis: ['gastroenterology', 'hepatology'],
    epilepsy: ['neurology', 'epilepsy_management'],
    rheumatoid_arthritis: ['rheumatology'],
    sickle_cell: ['hematology', 'sickle_cell_management'],
  };

  for (const cd of Object.values(brain.chronicDiseases)) {
    const diseaseKey = cd.diseaseName.toLowerCase().replace(/\s+/g, '_');
    const mapped = chronicDiseasePathwayMap[diseaseKey];
    if (mapped) {
      pathways.push(...mapped);
    }
  }

  return pathways;
}

function getTraumaPathway(brain: EncounterBrainState): string[] {
  if (brain.encounter.isTrauma) {
    return ['trauma'];
  }
  return [];
}

function getPostoperativePathway(brain: EncounterBrainState): string[] {
  if (brain.encounter.isPostoperative) {
    return ['postoperative_care'];
  }
  return [];
}

export function evaluatePatientContext(
  patient: Partial<PatientContext>,
): Partial<PatientContext> {
  const ageYears = patient.ageYears ?? 0;
  const ageMonths = patient.ageMonths ?? 0;
  const ageDays = ageMonths > 0 ? ageMonths * 30.44 : ageYears * 365;

  const ageCategory = patient.ageCategory || computeAgeCategory(ageYears, ageMonths, ageDays);
  const sex = patient.sex || 'other';
  const pregnancyStatus = patient.pregnancyStatus || computePregnancyStatus(sex, ageYears, patient.pregnancyStatus);
  const hasUterus = patient.hasUterus !== undefined ? patient.hasUterus : computeHasUterus(sex, ageYears);
  const requiresGuardian = patient.requiresGuardian !== undefined ? patient.requiresGuardian : ageYears < 18;

  return {
    ageCategory,
    pregnancyStatus,
    hasUterus,
    requiresGuardian,
  };
}

export function evaluateEncounterContext(
  encounterData: Record<string, unknown>,
): Partial<EncounterContext> {
  const encounterType = (encounterData.encounterType as string) || 'outpatient';
  const department = (encounterData.department as string) || 'general';
  const priority = encounterData.priority as string | undefined;

  const acuity = (encounterData.acuity as Acuity) || computeAcuity(encounterType, priority, department);
  const emergencyLevel = (encounterData.emergencyLevel as EncounterContext['emergencyLevel'])
    || computeEmergencyLevel(acuity, isTraumaFromEncounter(encounterData), department);
  const referralStatus = (encounterData.referralStatus as EncounterContext['referralStatus'])
    || computeReferralStatus(encounterType);
  const isPostoperative = encounterData.isPostoperative !== undefined
    ? Boolean(encounterData.isPostoperative)
    : isPostoperativeFromEncounter(encounterData);
  const isTrauma = encounterData.isTrauma !== undefined
    ? Boolean(encounterData.isTrauma)
    : isTraumaFromEncounter(encounterData);

  return {
    acuity,
    emergencyLevel,
    referralStatus,
    isPostoperative,
    isTrauma,
    postOpDay: isPostoperative ? (encounterData.postOpDay as number | undefined) : undefined,
    operationPerformed: isPostoperative ? (encounterData.operationPerformed as string | undefined) : undefined,
    operationDate: isPostoperative ? (encounterData.operationDate as string | undefined) : undefined,
    traumaMechanism: isTrauma ? (encounterData.traumaMechanism as string | undefined) : undefined,
    referringFacility: referralStatus === 'referral' ? (encounterData.referringFacility as string | undefined) : undefined,
    referringClinician: referralStatus === 'referral' ? (encounterData.referringClinician as string | undefined) : undefined,
    referralReason: referralStatus === 'referral' ? (encounterData.referralReason as string | undefined) : undefined,
  };
}

const BIODATA_PRIORS: Record<string, { condition: (p: PatientContext) => boolean; prob: number }[]> = {
  malaria: [
    { condition: () => true, prob: 0.10 },
  ],
  typhoid: [
    { condition: () => true, prob: 0.05 },
  ],
  pneumonia: [
    { condition: (p) => p.ageCategory === 'neonate' || p.ageCategory === 'infant' || p.ageCategory === 'older_adult', prob: 0.12 },
    { condition: () => true, prob: 0.04 },
  ],
  urinary_tract_infection: [
    { condition: (p) => p.sex === 'female', prob: 0.10 },
    { condition: () => true, prob: 0.03 },
  ],
  gastroenteritis: [
    { condition: (p) => p.ageCategory === 'neonate' || p.ageCategory === 'infant' || p.ageCategory === 'child', prob: 0.12 },
    { condition: () => true, prob: 0.04 },
  ],
  tuberculosis: [
    { condition: (p) => p.ageCategory === 'older_adult', prob: 0.06 },
    { condition: () => true, prob: 0.02 },
  ],
  hiv: [
    { condition: (p) => p.ageYears >= 15 && p.ageYears <= 49, prob: 0.04 },
    { condition: () => true, prob: 0.02 },
  ],
  hypertension: [
    { condition: (p) => p.ageCategory === 'older_adult', prob: 0.25 },
    { condition: (p) => p.ageCategory === 'adult', prob: 0.10 },
    { condition: () => true, prob: 0.03 },
  ],
  diabetes_mellitus: [
    { condition: (p) => p.ageCategory === 'older_adult', prob: 0.15 },
    { condition: (p) => p.ageCategory === 'adult', prob: 0.05 },
    { condition: () => true, prob: 0.02 },
  ],
  anaemia: [
    { condition: (p) => p.sex === 'female' && p.ageYears >= 12 && p.ageYears <= 55, prob: 0.20 },
    { condition: (p) => p.ageCategory === 'neonate' || p.ageCategory === 'infant', prob: 0.15 },
    { condition: () => true, prob: 0.05 },
  ],
  asthma: [
    { condition: (p) => p.ageCategory === 'child' || p.ageCategory === 'adolescent', prob: 0.06 },
    { condition: () => true, prob: 0.03 },
  ],
  chronic_kidney_disease: [
    { condition: (p) => p.ageCategory === 'older_adult', prob: 0.08 },
    { condition: () => true, prob: 0.02 },
  ],
  heart_failure: [
    { condition: (p) => p.ageCategory === 'older_adult', prob: 0.10 },
    { condition: () => true, prob: 0.02 },
  ],
};

function getPriorProb(diseaseKey: string, patient: PatientContext): number {
  const rules = BIODATA_PRIORS[diseaseKey];
  if (!rules) return 0.01;
  let best = 0.01;
  for (const rule of rules) {
    if (rule.condition(patient)) {
      best = Math.max(best, rule.prob);
    }
  }
  return best;
}

export function applyContextRules(brain: EncounterBrainState): EncounterBrainState {
  const patient = brain.patient;

  const diseaseStates = { ...brain.diseaseStates };

  for (const [diseaseKey, rules] of Object.entries(BIODATA_PRIORS)) {
    if (diseaseStates[diseaseKey]) continue;
    const prior = getPriorProb(diseaseKey, patient);
    const existing = diseaseStates[diseaseKey];
    if (!existing) {
      diseaseStates[diseaseKey] = {
        diseaseId: diseaseKey,
        diseaseName: diseaseKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        icdCode: '',
        priorProb: prior,
        currentProb: prior,
        previousProb: prior,
        probabilityHistory: [{ prob: prior, timestamp: now() }],
        supportingEvidence: [],
        againstEvidence: [],
        unknownEvidence: [],
        criticalUnknowns: [],
        scores: {},
        redFlagTriggered: false,
        redFlagFeatures: [],
        dangerLevel: 'low',
        mustNotMiss: false,
        currentStageIndex: 0,
        stageHistory: [{ stageId: 0, enteredAt: now() }],
        lastUpdated: now(),
        owner: 'disease_state_engine',
      };
    }
  }

  return {
    ...brain,
    version: brain.version + 1,
    updatedAt: now(),
    diseaseStates,
  };
}

export function getContextualIntroduction(brain: EncounterBrainState): string {
  const patient = brain.patient;
  const encounter = brain.encounter;
  const ageStr = ageDisplay(patient);
  const sex = patient.sex;

  const chronicDiseasesList = Object.values(brain.chronicDiseases);

  if (chronicDiseasesList.length > 0) {
    const primary = chronicDiseasesList[0];
    return `This is a ${ageStr} ${sex} with known ${primary.diseaseName} diagnosed in ${primary.diagnosisYear}.`;
  }

  if (encounter.referralStatus === 'referral' && encounter.referringFacility) {
    const reason = encounter.referralReason || 'further management';
    return `This is a ${ageStr} ${sex} referred from ${encounter.referringFacility} for ${reason}.`;
  }

  if (encounter.isPostoperative) {
    const postOpDay = encounter.postOpDay || 0;
    const procedure = encounter.operationPerformed || 'surgery';
    return `This is a ${ageStr} ${sex} on post-op day ${postOpDay} following ${procedure}.`;
  }

  const complaint = getPrimaryComplaintLabel(brain);
  const duration = getDurationFromTimeline(brain);
  return `A ${ageStr} ${sex} presents with ${complaint} for ${duration}.`;
}

export function getIllnessContext(brain: EncounterBrainState): IllnessContextResult {
  const chronicDiseasesList = Object.values(brain.chronicDiseases);
  const previousSurgeries = brain.previousSurgeries || [];

  const currentMedications = chronicDiseasesList.flatMap(cd =>
    cd.medications.map(m => ({
      name: m.name,
      dose: m.dose,
      frequency: m.frequency,
    })),
  );

  const pastMedicalHistory = chronicDiseasesList.map(cd => cd.diseaseName);

  const healthSeekingDelay = brain.healthSeekingJourney
    ? brain.healthSeekingJourney.totalDaysBeforePresentation
    : 0;

  return {
    hasChronicDisease: chronicDiseasesList.length > 0,
    chronicDiseases: chronicDiseasesList,
    hasPreviousSurgeries: previousSurgeries.length > 0,
    surgeryCount: previousSurgeries.length,
    knownAllergies: [],
    currentMedications,
    pastMedicalHistory,
    relevantFamilyHistory: [],
    socialHistory: [],
    healthSeekingDelay,
  };
}

export function getAutoActivatedPathways(brain: EncounterBrainState): string[] {
  const pathways = new Set<string>();

  const departmental = getDepartmentalPathways(brain.encounter.department);
  for (const p of departmental) pathways.add(p);

  const ageBased = getAgeBasedPathways(brain.patient);
  for (const p of ageBased) pathways.add(p);

  const sexBased = getSexBasedPathways(brain.patient);
  for (const p of sexBased) pathways.add(p);

  const chronic = getChronicDiseasePathways(brain);
  for (const p of chronic) pathways.add(p);

  const trauma = getTraumaPathway(brain);
  for (const p of trauma) pathways.add(p);

  const postop = getPostoperativePathway(brain);
  for (const p of postop) pathways.add(p);

  return Array.from(pathways);
}
