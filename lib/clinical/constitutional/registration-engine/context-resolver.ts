import type { Answer } from './types';
import type {
  ClinicalContext, DemographicContext, ClinicalContextState,
  EncounterContextState, EncounterCascadeFlags, WorkflowContextState,
  VisibilityRules, PermissionContext, DocumentationPlan, DSSContext,
  ReproductiveStage, ClinicalCohort, AgeGroup, DevelopmentalStage,
  GeriatricSubtype, ModuleType, WorkflowType, TriageCategory,
  EncounterType, Department, PregnancyStatus, NutritionalStatus, Sex,
  NeonatalDetails, PediatricGrowthDetails,
} from './types';
import { REGISTRATION_FIELDS } from './field-registry';

// ──────────────────────────────────────────────────────────────
// AGE & DEVELOPMENT RESOLUTION
// ──────────────────────────────────────────────────────────────

export function resolveAgeGroup(ageMonths: number, gestationWeeks?: number): AgeGroup {
  if (gestationWeeks !== undefined && gestationWeeks < 37) return 'preterm_neonate';
  if (ageMonths <= 1) return 'term_neonate';
  if (ageMonths <= 12) return 'infant';
  if (ageMonths <= 36) return 'toddler';
  if (ageMonths <= 72) return 'preschool';
  if (ageMonths <= 144) return 'school_age';
  if (ageMonths <= 228) return 'adolescent';
  if (ageMonths <= 780) return 'adult';
  return 'older_adult';
}

export function resolveDevelopmentalStage(ageMonths: number, correctedAgeMonths: number): DevelopmentalStage {
  const effectiveAge = correctedAgeMonths > 0 ? correctedAgeMonths : ageMonths;
  if (effectiveAge <= 1) return 'preterm_neonate';
  if (effectiveAge <= 3) return 'term_neonate';
  if (effectiveAge <= 12) return 'infant';
  if (effectiveAge <= 36) return 'toddler';
  if (effectiveAge <= 72) return 'preschool';
  if (effectiveAge <= 144) return 'school_age';
  if (effectiveAge <= 228) return 'adolescent';
  if (effectiveAge <= 480) return 'young_adult';
  if (effectiveAge <= 780) return 'middle_adult';
  if (effectiveAge <= 1020) return 'older_adult';
  return 'frail_elderly';
}

export function computeCorrectedAgeMonths(chronologicalMonths: number, gestationWeeks: number): number {
  if (!gestationWeeks || gestationWeeks >= 37) return chronologicalMonths;
  const weeksPreterm = 40 - gestationWeeks;
  const monthsPreterm = weeksPreterm / 4.33;
  return Math.max(0, chronologicalMonths - monthsPreterm);
}

export function computeDayOfLife(dateOfBirth: string): number {
  if (!dateOfBirth) return 0;
  const birth = new Date(dateOfBirth);
  const now = new Date();
  const diffMs = now.getTime() - birth.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export function computeChronologicalAgeMonths(age: number, ageUnit: string): number {
  if (ageUnit === 'years') return age * 12;
  if (ageUnit === 'months') return age;
  if (ageUnit === 'days') return Math.round(age / 30);
  return age * 12;
}

// ──────────────────────────────────────────────────────────────
// REPRODUCTIVE RESOLUTION
// ──────────────────────────────────────────────────────────────

export function resolveReproductiveStage(
  sex: string, ageMonths: number, rawStatus?: string, pregnant?: string,
): ReproductiveStage {
  if (sex === 'male') return 'male';
  if (rawStatus) {
    if (rawStatus === 'pregnant') return 'pregnant';
    if (rawStatus === 'labour') return 'labour';
    if (rawStatus === 'postpartum') return 'postpartum';
    return rawStatus as ReproductiveStage;
  }
  if (pregnant === 'pregnant') return 'pregnant';
  if (pregnant === 'postpartum') return 'postpartum';
  if (ageMonths < 144) return 'pre_menarche';
  if (ageMonths <= 480) return 'reproductive_age';
  if (ageMonths > 480) return 'post_menopausal';
  return 'unknown';
}

export function resolveGeriatricSubtype(ageMonths: number): GeriatricSubtype {
  if (ageMonths < 780) return 'not_geriatric';
  if (ageMonths < 900) return 'young_old';
  if (ageMonths < 1020) return 'middle_old';
  return 'oldest_old';
}

// ──────────────────────────────────────────────────────────────
// COHORT & NUTRITIONAL STATUS
// ──────────────────────────────────────────────────────────────

export function resolveClinicalCohort(
  ageGroup: AgeGroup, sex: string, pregnant: boolean, postpartum: boolean,
): ClinicalCohort {
  if (pregnant) return 'pregnant_female';
  if (postpartum) return 'postpartum_female';
  const prefix = ageGroup === 'preterm_neonate' || ageGroup === 'term_neonate' ? 'neonatal'
    : ageGroup === 'infant' || ageGroup === 'toddler' || ageGroup === 'preschool' || ageGroup === 'school_age' ? 'pediatric'
    : ageGroup === 'adolescent' ? 'pediatric'
    : ageGroup === 'older_adult' ? 'geriatric'
    : 'adult';
  const suffix = sex === 'female' ? 'female' : 'male';
  return `${prefix}_${suffix}` as ClinicalCohort;
}

export function computeNutritionalStatus(
  weightForAgeZ: number, weightForHeightZ: number, bmiPercentile: number, ageMonths: number, muac?: number,
): NutritionalStatus {
  if (muac !== undefined && muac !== null) {
    if (ageMonths >= 6 && ageMonths <= 60) {
      if (muac < 11.5) return 'severe_malnutrition';
      if (muac < 12.5) return 'moderate_malnutrition';
    }
  }
  if (ageMonths > 24) {
    if (bmiPercentile >= 95) return 'obese';
    if (bmiPercentile >= 85) return 'overweight';
  }
  if (weightForAgeZ < -3) return 'severe_malnutrition';
  if (weightForAgeZ < -2) return 'moderate_malnutrition';
  if (weightForHeightZ > 2 && ageMonths <= 60) return 'overweight';
  if (weightForHeightZ > 3 && ageMonths <= 60) return 'obese';
  return 'normal';
}

export function computeZScore(value: number, mean: number, sd: number): number {
  if (!sd || sd === 0) return 0;
  return (value - mean) / sd;
}

// ──────────────────────────────────────────────────────────────
// ENCOUNTER RESOLUTION
// ──────────────────────────────────────────────────────────────

export function resolveEncounterType(type: string): EncounterType {
  const valid: EncounterType[] = [
    'new_consultation', 'review', 'follow_up', 'ward_round',
    'admission', 'transfer', 'discharge', 'icu_review',
    'referral', 'procedure', 'operation', 'telemedicine',
    'community_visit', 'home_visit', 'outreach',
    'emergency', 'outpatient', 'inpatient',
    'theatre', 'icu', 'antenatal', 'postnatal',
    'well_baby', 'mental_health',
  ];
  return valid.includes(type as EncounterType) ? (type as EncounterType) : 'outpatient';
}

export function resolveDepartment(dept: string): Department {
  const valid: Department[] = [
    'medicine', 'surgery', 'pediatrics', 'obstetrics_gynaecology',
    'orthopedics', 'ent', 'ophthalmology', 'dermatology',
    'psychiatry', 'neurology', 'cardiology', 'respiratory',
    'icu', 'emergency_medicine', 'neonatology', 'renal',
    'endocrinology', 'hematology', 'oncology', 'infectious_disease',
    'general', 'other',
  ];
  return valid.includes(dept as Department) ? (dept as Department) : 'general';
}

export function resolveWorkflowType(
  encounterType: EncounterType,
  triageCategory: string,
  ageGroup?: AgeGroup,
  pregnant?: boolean,
): WorkflowType {
  if (encounterType === 'emergency' && triageCategory === 'red') return 'emergency_resuscitation';
  if (encounterType === 'ward_round') return 'ward_round_review';
  if (encounterType === 'follow_up') return 'follow_up_review';
  if (encounterType === 'telemedicine') return 'telemedicine_review';
  if (encounterType === 'procedure') return 'procedure_check_in';
  if (encounterType === 'operation') return 'procedure_check_in';
  if (encounterType === 'emergency' && triageCategory === 'green') return 'rapid_assessment';
  if (encounterType === 'transfer') return 'transfer_of_care';
  if (encounterType === 'referral') return 'referral_letter';
  if (encounterType === 'discharge') return 'discharge_summary';
  if (encounterType === 'icu_review') return 'icu_handover';
  if (encounterType === 'antenatal') return 'antenatal_visit';
  if (encounterType === 'postnatal') return 'postnatal_review';
  if (encounterType === 'well_baby') return 'well_child_visit';
  if (ageGroup === 'preterm_neonate' || ageGroup === 'term_neonate') {
    if (encounterType === 'inpatient') return 'neonatal_admission';
    return 'newborn_review';
  }
  if (['infant', 'toddler', 'preschool', 'school_age'].includes(ageGroup || '')) {
    return 'paediatric_clerking';
  }
  if (encounterType === 'theatre') return 'preoperative_assessment';
  if (encounterType === 'review' && triageCategory) return 'postoperative_review';
  return 'full_clerking';
}

// ──────────────────────────────────────────────────────────────
// ENCOUNTER CASCADE FLAGS
// ──────────────────────────────────────────────────────────────

export function resolveCascadeFlags(
  encounterType: EncounterType,
  modeOfArrival: string,
  triageCategory: string,
  referralSource: string,
): EncounterCascadeFlags {
  return {
    showPrehospitalCare: modeOfArrival === 'ambulance' || modeOfArrival === 'stretcher',
    showMedicoLegal: modeOfArrival === 'police',
    showTransferNotes: referralSource === 'hospital_transfer' || encounterType === 'transfer',
    showAbcdeResuscitation: encounterType === 'emergency' && triageCategory === 'red',
    skipFullHistory: (encounterType === 'emergency' && triageCategory === 'red')
                     || encounterType === 'ward_round'
                     || encounterType === 'icu_review',
    showReferralDetails: encounterType === 'referral' || encounterType === 'transfer'
                         || referralSource === 'hospital_transfer',
  };
}

// ──────────────────────────────────────────────────────────────
// MODULE RESOLUTION
// ──────────────────────────────────────────────────────────────

export function resolveActiveModules(
  ageGroup: AgeGroup,
  sex: string,
  pregnant: boolean,
  postpartum: boolean,
  encounterType: string,
  department: string,
  knownConditions: string[],
): ModuleType[] {
  const modules: Set<ModuleType> = new Set();

  if (ageGroup === 'preterm_neonate' || ageGroup === 'term_neonate') {
    modules.add('neonatal'); modules.add('pediatric');
  } else if (ageGroup === 'infant' || ageGroup === 'toddler') {
    modules.add('infant'); modules.add('pediatric');
  } else if (ageGroup === 'preschool' || ageGroup === 'school_age') {
    modules.add('pediatric');
  } else if (ageGroup === 'adolescent') {
    modules.add('adolescent');
  }
  if (ageGroup === 'adult') modules.add('adult');
  if (ageGroup === 'older_adult') { modules.add('geriatric'); modules.add('adult'); }

  if (sex === 'male') modules.add('male');
  if (sex === 'female') modules.add('female');
  if (pregnant) { modules.add('pregnancy'); modules.add('obstetrics'); }
  if (postpartum) { modules.add('postpartum'); modules.add('obstetrics'); }

  const deptModuleMap: Record<string, ModuleType> = {
    surgery: 'surgery', orthopedics: 'orthopedics', ent: 'ent',
    ophthalmology: 'ophthalmology', dermatology: 'dermatology',
    psychiatry: 'psychiatry', 'emergency_medicine': 'emergency',
    cardiology: 'cardiology', respiratory: 'respiratory',
    neurology: 'neurology', renal: 'renal', endocrinology: 'endo',
    oncology: 'oncology', hematology: 'hematology',
    'infectious_disease': 'infectious_disease', icu: 'icu_critical_care',
    neonatology: 'neonatology', pediatrics: 'pediatric',
  };
  if (deptModuleMap[department]) modules.add(deptModuleMap[department]);

  if (encounterType === 'emergency') modules.add('emergency');
  if (encounterType === 'operation' || encounterType === 'theatre' || department === 'surgery') {
    modules.add('surgery');
  }

  if (knownConditions.includes('trauma')) modules.add('trauma');
  if (knownConditions.includes('mental_illness')) modules.add('psychiatry');

  return Array.from(modules);
}

// ──────────────────────────────────────────────────────────────
// TEMPLATE & EXAMINATION RESOLUTION
// ──────────────────────────────────────────────────────────────

export function getAvailableHPITemplates(modules: ModuleType[]): string[] {
  const templates: string[] = ['general_hpi'];
  if (modules.includes('neonatal')) templates.push('neonatal_hpi');
  if (modules.includes('pediatric')) templates.push('pediatric_hpi');
  if (modules.includes('pregnancy') || modules.includes('obstetrics')) templates.push('obstetric_hpi');
  if (modules.includes('cardiology')) templates.push('cardiac_hpi');
  if (modules.includes('respiratory')) templates.push('respiratory_hpi');
  if (modules.includes('neurology')) templates.push('neurological_hpi');
  if (modules.includes('psychiatry')) templates.push('psychiatric_hpi');
  return templates;
}

export function getExaminationModules(modules: ModuleType[]): string[] {
  const examModules: string[] = ['general_examination', 'vital_signs'];
  if (modules.includes('neonatal')) examModules.push('neonatal_examination', 'primitive_reflexes', 'gestational_assessment');
  if (modules.includes('pediatric')) examModules.push('pediatric_examination', 'growth_assessment', 'pubertal_assessment');
  if (modules.includes('pregnancy') || modules.includes('obstetrics')) examModules.push('obstetric_examination', 'leopolds');
  if (modules.includes('postpartum')) examModules.push('postnatal_examination', 'lochia_assessment');
  if (modules.includes('cardiology')) examModules.push('cardiovascular_examination');
  if (modules.includes('respiratory')) examModules.push('respiratory_examination');
  if (modules.includes('neurology')) examModules.push('neurological_examination');
  if (modules.includes('gi')) examModules.push('gi_examination');
  if (modules.includes('orthopedics') || modules.includes('trauma')) examModules.push('musculoskeletal_examination');
  if (modules.includes('psychiatry')) examModules.push('mental_state_examination');
  if (modules.includes('ent')) examModules.push('ent_examination');
  if (modules.includes('ophthalmology')) examModules.push('eye_examination');
  if (modules.includes('dermatology')) examModules.push('skin_examination');
  if (modules.includes('geriatric')) examModules.push('geriatric_assessment', 'falls_assessment');
  if (modules.includes('neonatology')) examModules.push('neonatal_examination', 'gestational_assessment');
  if (modules.includes('emergency')) examModules.push('abcde_assessment');
  return examModules;
}

export function getRequiredScoringSystems(modules: ModuleType[], encounterType: string): string[] {
  const scores: string[] = [];
  if (encounterType === 'emergency') scores.push('news', 'gcs');
  if (modules.includes('neonatal')) scores.push('apgar', 'ballard', 'silverman_anderson');
  if (modules.includes('pediatric')) scores.push('pediatric_ews', 'blantyre_coma');
  if (modules.includes('cardiology')) scores.push('framingham_risk');
  if (modules.includes('neurology')) scores.push('nihss');
  if (modules.includes('psychiatry')) scores.push('phq9', 'gad7');
  if (modules.includes('geriatric')) scores.push('rockwood_frailty');
  return scores;
}

// ──────────────────────────────────────────────────────────────
// VISIBILITY RULES
// ──────────────────────────────────────────────────────────────

export function resolveVisibilityRules(
  data: Record<string, Answer>,
  activeModules: ModuleType[],
  ageGroup: AgeGroup,
  sex: string,
  encounterType: string,
  department: string,
): VisibilityRules {
  const visibleSections = new Set<string>();
  const hiddenFields = new Set<string>();
  const disabledFields = new Set<string>();
  const visibleModules = new Set<ModuleType>(activeModules);

  for (const [fieldId, fieldDef] of Object.entries(REGISTRATION_FIELDS)) {
    let isVisible = true;
    for (const rule of fieldDef.visibility) {
      isVisible = evaluateVisibilityRule(rule, data, activeModules, ageGroup, sex, encounterType, department);
      if (!isVisible) break;
    }
    if (!isVisible) {
      hiddenFields.add(fieldId);
    }
    if (isVisible) {
      let isHidden = false;
      for (const rule of fieldDef.hideWhen) {
        if (evaluateVisibilityRule(rule, data, activeModules, ageGroup, sex, encounterType, department)) {
          isHidden = true;
          break;
        }
      }
      if (isHidden) hiddenFields.add(fieldId);
    }
  }

  visibleSections.add('identity');
  if (activeModules.includes('neonatal')) {
    visibleSections.add('neonatal_identity'); visibleSections.add('birth_history'); visibleSections.add('perinatal_history');
  }
  if (activeModules.includes('pediatric') || activeModules.includes('neonatal')) {
    visibleSections.add('growth'); visibleSections.add('nutrition'); visibleSections.add('immunization');
  }
  if (sex === 'female') visibleSections.add('reproductive');
  visibleSections.add('demographics');
  visibleSections.add('residence');
  visibleSections.add('contact');
  visibleSections.add('encounter');
  if (encounterType === 'ambulance' || encounterType === 'stretcher') visibleSections.add('prehospital');
  if (activeModules.includes('pregnancy') || activeModules.includes('obstetrics')) {
    visibleSections.add('pregnancy');
    visibleSections.add('obstetric_history');
  }

  const requiredFields: Record<string, string[]> = {};
  for (const [fieldId, fieldDef] of Object.entries(REGISTRATION_FIELDS)) {
    if (hiddenFields.has(fieldId)) continue;
    let isRequired = true;
    if (fieldDef.required.length > 0) {
      isRequired = fieldDef.required.every(rule =>
        evaluateVisibilityRule(rule, data, activeModules, ageGroup, sex, encounterType, department)
      );
    }
    if (isRequired) {
      if (!requiredFields[fieldDef.section]) requiredFields[fieldDef.section] = [];
      requiredFields[fieldDef.section].push(fieldId);
    }
  }

  return { visibleSections, requiredFields, hiddenFields, disabledFields, visibleModules };
}

function evaluateVisibilityRule(
  rule: any,
  data: Record<string, Answer>,
  activeModules: ModuleType[],
  ageGroup: AgeGroup,
  sex: string,
  encounterType: string,
  department: string,
): boolean {
  switch (rule.type) {
    case 'always': return true;
    case 'never': return false;
    case 'sex': return rule.values.includes(sex);
    case 'age_group': return rule.values.includes(ageGroup);
    case 'age_min_months': {
      const ageMonths = computeChronologicalAgeMonths(
        data['age']?.value as number || 0,
        data['age_unit']?.value as string || 'years',
      );
      return ageMonths >= rule.months;
    }
    case 'age_max_months': {
      const ageMonths = computeChronologicalAgeMonths(
        data['age']?.value as number || 0,
        data['age_unit']?.value as string || 'years',
      );
      return ageMonths <= rule.months;
    }
    case 'encounter_type': return rule.values.includes(encounterType);
    case 'department': return rule.values.includes(department);
    case 'module_active': return activeModules.includes(rule.module);
    case 'module_inactive': return !activeModules.includes(rule.module);
    case 'mode_of_arrival': return rule.values.includes(data['mode_of_arrival']?.value as string);
    case 'triage_category': return rule.values.includes(data['triage_category']?.value as string);
    case 'field_equals': {
      const answer = data[rule.field];
      return answer?.value === rule.value;
    }
    case 'field_not_empty': {
      const answer = data[rule.field];
      return answer?.value !== null && answer?.value !== undefined && answer?.value !== '';
    }
    case 'field_in': {
      const answer = data[rule.field];
      return rule.values.includes(answer?.value);
    }
    default: return true;
  }
}

// ──────────────────────────────────────────────────────────────
// NEONATAL & PEDIATRIC DETAILS
// ──────────────────────────────────────────────────────────────

function resolveNeonatalDetails(data: Record<string, Answer>, ageMonths: number): NeonatalDetails {
  const gestationWeeks = data['gestation_at_birth']?.value as number || 40;
  return {
    gestationAtBirth: data['gestation_at_birth'] as Answer<number>,
    correctedAgeMonths: computeCorrectedAgeMonths(ageMonths, gestationWeeks),
    chronologicalAgeMonths: ageMonths,
    dayOfLife: data['date_of_birth']
      ? computeDayOfLife(data['date_of_birth']?.value as string)
      : computeDayOfLife(new Date(Date.now() - ageMonths * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
    birthWeight: data['birth_weight'] as Answer<number>,
    birthLength: data['birth_length'] as Answer<number>,
    birthHeadCircumference: data['birth_head_circumference'] as Answer<number>,
    deliveryMode: data['delivery_mode'] as Answer<string>,
    apgar1min: data['apgar_1min'] as Answer<number>,
    apgar5min: data['apgar_5min'] as Answer<number>,
    resuscitationAtBirth: data['resuscitation_at_birth'] as Answer<string>,
    nicuAdmission: data['nicu_admission'] as Answer<boolean>,
    nicuReason: data['nicu_reason'] as Answer<string>,
  };
}

function resolvePediatricGrowth(data: Record<string, Answer>, correctedAgeMonths: number): PediatricGrowthDetails {
  const weight = data['current_weight']?.value as number || 0;
  const height = data['current_height']?.value as number || 0;
  const hc = data['current_head_circumference']?.value as number || 0;
  const muac = data['muac']?.value as number;
  const bmi = weight > 0 && height > 0 ? Math.round((weight / ((height / 100) ** 2)) * 10) / 10 : 0;

  const weightForAgeZ = weight > 0 ? computeZScore(weight, 0, 1) : 0;
  const heightForAgeZ = height > 0 ? computeZScore(height, 0, 1) : 0;
  const weightForHeightZ = weight > 0 && height > 0 ? computeZScore(weight, 0, 1) : 0;
  const bmiPercentile = bmi > 0 ? 50 : 0;

  return {
    currentWeight: data['current_weight'] as Answer<number>,
    currentHeight: data['current_height'] as Answer<number>,
    currentHeadCircumference: data['current_head_circumference'] as Answer<number>,
    weightForAgeZ,
    heightForAgeZ,
    weightForHeightZ,
    bmi,
    bmiPercentile,
    nutritionalStatus: computeNutritionalStatus(weightForAgeZ, weightForHeightZ, bmiPercentile, correctedAgeMonths, muac),
    muac: data['muac'] as Answer<number>,
  };
}

// ──────────────────────────────────────────────────────────────
// CLINICAL CONTEXT
// ──────────────────────────────────────────────────────────────

export function resolveClinicalContext(
  data: Record<string, Answer>,
  ageGroup: AgeGroup,
  sex: string,
): ClinicalContextState {
  const pregnant = data['are_you_pregnant']?.value === 'pregnant';
  const postpartum = data['postpartum_status']?.value?.toString().includes('postpartum') ?? false;
  const activeModules = resolveActiveModules(
    ageGroup, sex, pregnant, postpartum,
    data['encounter_type']?.value as string || 'outpatient',
    data['department']?.value as string || 'general',
    (data['known_conditions']?.value as string[]) || [],
  );

  return {
    pregnancy: (data['are_you_pregnant']?.value as PregnancyStatus) || 'unknown',
    pregnancyDetails: {
      confirmed: { value: pregnant, state: 'captured', source: 'clinician', confidence: 1, timestamp: Date.now(), author: 'system' },
      confirmationMethod: data['pregnancy_confirmation_method'] as Answer<'upt' | 'ultrasound' | 'clinical' | 'unknown'>,
      lmp: data['lmp'] as Answer<string>,
      gestationalAgeWeeks: data['gestational_age_weeks'] as Answer<number>,
      gestationalAgeDays: { value: 0, state: 'unknown', source: 'system', confidence: 0, timestamp: Date.now(), author: 'system' },
      edd: { value: null, state: 'unknown', source: 'system', confidence: 0, timestamp: Date.now(), author: 'system' },
      trimester: { value: null, state: 'unknown', source: 'system', confidence: 0, timestamp: Date.now(), author: 'system' },
      datingUltrasoundPerformed: data['dating_ultrasound'] as Answer<boolean>,
      gravida: data['gravida'] as Answer<number>,
      para: data['para'] as Answer<number>,
      abortus: { value: null, state: 'unknown', source: 'system', confidence: 0, timestamp: Date.now(), author: 'system' },
      livingChildren: { value: null, state: 'unknown', source: 'system', confidence: 0, timestamp: Date.now(), author: 'system' },
    },
    isNeonatal: ['preterm_neonate', 'term_neonate'].includes(ageGroup),
    isPediatric: ['preterm_neonate', 'term_neonate', 'infant', 'toddler', 'preschool', 'school_age', 'adolescent'].includes(ageGroup),
    isGeriatric: ageGroup === 'older_adult',
    isPsychiatric: activeModules.includes('psychiatry'),
    isSurgical: activeModules.includes('surgery'),
    isTrauma: activeModules.includes('trauma'),
    activeModules,
  };
}

// ──────────────────────────────────────────────────────────────
// BUILD CLINICAL CONTEXT (MAIN ENTRY POINT)
// ──────────────────────────────────────────────────────────────

export function buildClinicalContext(data: Record<string, Answer>): ClinicalContext {
  const age = data['age']?.value as number || 0;
  const ageUnit = data['age_unit']?.value as string || 'years';
  const ageMonths = computeChronologicalAgeMonths(age, ageUnit);
  const sex = data['sex']?.value as string || 'unknown';
  const gestationWeeks = data['gestation_at_birth']?.value as number || 40;
  const correctedAgeMonths = computeCorrectedAgeMonths(ageMonths, gestationWeeks);
  const dayOfLife = computeDayOfLife(data['date_of_birth']?.value as string);
  const ageGroup = resolveAgeGroup(ageMonths, gestationWeeks);
  const developmentalStage = resolveDevelopmentalStage(ageMonths, correctedAgeMonths);
  const reproductiveStage = resolveReproductiveStage(
    sex, ageMonths, data['reproductive_status']?.value as string,
    data['are_you_pregnant']?.value as string,
  );
  const cohort = resolveClinicalCohort(
    ageGroup, sex,
    data['are_you_pregnant']?.value === 'pregnant',
    data['postpartum_status']?.value?.toString().includes('postpartum') ?? false,
  );
  const encounterType = resolveEncounterType(data['encounter_type']?.value as string || 'outpatient');
  const department = resolveDepartment(data['department']?.value as string || 'general');
  const triageCategory = data['triage_category']?.value as TriageCategory || 'none';
  const modeOfArrival = data['mode_of_arrival']?.value as string || 'walking';
  const referralSource = data['referral_source']?.value as string || 'self';

  const cascadeFlags = resolveCascadeFlags(encounterType, modeOfArrival, triageCategory, referralSource);

  const neonatalDetails = resolveNeonatalDetails(data, ageMonths);
  const pediatricGrowth = resolvePediatricGrowth(data, correctedAgeMonths);

  const demographic: DemographicContext = {
    age: data['age'] as Answer<number>,
    ageUnit: data['age_unit'] as Answer<'years' | 'months' | 'days'>,
    ageGroup,
    developmentalStage,
    clinicalCohort: cohort,
    reproductiveStage,
    geriatricSubtype: resolveGeriatricSubtype(ageMonths),
    sex: data['sex'] as Answer<Sex>,
    dateOfBirth: data['date_of_birth'] as Answer<string>,
    chronologicalAgeMonths: ageMonths,
    correctedAgeMonths,
    dayOfLife,
    neonatal: neonatalDetails,
    pediatricGrowth,
  };

  const clinical = resolveClinicalContext(data, ageGroup, sex);

  const encounter: EncounterContextState = {
    encounterType,
    department,
    specialty: department,
    service: data['service']?.value as string || '',
    unit: data['unit']?.value as string || '',
    ward: data['ward'] as Answer<string>,
    bed: data['bed'] as Answer<string>,
    team: data['team'] as Answer<string>,
    consultant: data['consultant'] as Answer<string>,
    triageCategory,
    modeOfArrival: data['mode_of_arrival']?.value as any || 'walking',
    referralSource,
    cascadeFlags,
    isEmergency: encounterType === 'emergency',
    isInpatient: encounterType === 'inpatient' || encounterType === 'icu' || encounterType === 'theatre' || encounterType === 'admission',
    isWardRound: encounterType === 'ward_round',
    isFollowUp: encounterType === 'follow_up',
    isTransfer: encounterType === 'transfer',
    isReferral: encounterType === 'referral',
    isNewConsultation: encounterType === 'new_consultation',
    isReview: encounterType === 'review',
    isProcedure: encounterType === 'procedure',
    isOperation: encounterType === 'operation',
    isDischarge: encounterType === 'discharge',
    isTelemedicine: encounterType === 'telemedicine',
    isCommunityVisit: encounterType === 'community_visit' || encounterType === 'home_visit',
  };

  const workflowType = resolveWorkflowType(encounterType, triageCategory, ageGroup, clinical.pregnancy === 'pregnant');

  const workflow: WorkflowContextState = {
    workflowType,
    availableHpiTemplates: getAvailableHPITemplates(clinical.activeModules),
    availableExaminationModules: getExaminationModules(clinical.activeModules),
    activeDocumentationFlows: ['hpi', 'examination', 'summary', 'differentials', 'management'],
    requiredScoringSystems: getRequiredScoringSystems(clinical.activeModules, encounterType),
    suggestedQuestionGroups: clinical.activeModules.map(m => `${m}_questions`),
  };

  const visibility = resolveVisibilityRules(data, clinical.activeModules, ageGroup, sex, encounterType, department);

  const omittedSections: string[] = [];
  if (cascadeFlags.skipFullHistory) omittedSections.push('biodata', 'history', 'full_examination');
  if (encounterType === 'ward_round') omittedSections.push('biodata', 'history');
  if (encounterType === 'discharge') omittedSections.push('hpi', 'examination');

  const permissions: PermissionContext = {
    canEdit: true,
    canSign: true,
    canDelete: false,
    canOverride: false,
    canViewSensitive: false,
    restrictedFields: [],
  };

  const documentation: DocumentationPlan = {
    prefilledSections: [],
    omittedSections,
    autoGenerateSections: ['clinical_summary', 'hpi_narrative'],
    requiresClinicianInput: ['assessment', 'plan'],
    signatureRequired: !cascadeFlags.skipFullHistory,
  };

  const decisionSupport: DSSContext = {
    activeRules: clinical.activeModules.map(m => `${m}_rules`),
    activeCalculators: getRequiredScoringSystems(clinical.activeModules, encounterType),
    activeAlerts: cascadeFlags.showMedicoLegal ? ['medico_legal_case'] : [],
    suggestedDifferentialCategories: [],
  };

  return {
    demographic,
    clinical,
    encounter,
    workflow,
    visibility,
    permissions,
    documentation,
    decisionSupport,
  };
}
