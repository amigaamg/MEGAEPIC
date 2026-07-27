import { ObjectType } from './book-I-objects';

export enum ClinicalContext {
  Adult = 'adult',
  Child = 'child',
  Neonate = 'neonate',
  Infant = 'infant',
  Adolescent = 'adolescent',
  OlderAdult = 'older_adult',

  Male = 'male',
  Female = 'female',
  Intersex = 'intersex',

  Pregnant = 'pregnant',
  Postpartum = 'postpartum',
  Breastfeeding = 'breastfeeding',
  Lactating = 'lactating',

  HIV = 'hiv',
  CKD = 'ckd',
  LiverDisease = 'liver_disease',
  Diabetes = 'diabetes',
  Hypertension = 'hypertension',
  Immunocompromised = 'immunocompromised',
  Malnutrition = 'malnutrition',
  Anaemia = 'anaemia',

  ICU = 'icu',
  Emergency = 'emergency',
  Inpatient = 'inpatient',
  Outpatient = 'outpatient',
  Community = 'community',
  Telemedicine = 'telemedicine',
  HomeCare = 'home_care',

  Surgery = 'surgery',
  PreOperative = 'pre_operative',
  PostOperative = 'post_operative',
  Trauma = 'trauma',
  Oncology = 'oncology',
  Palliative = 'palliative',
  Psychiatry = 'psychiatry',

  PrimaryCare = 'primary_care',
  Referral = 'referral',
  Specialist = 'specialist',

  Geriatric = 'geriatric',
  Cancer = 'cancer',
  Neutropenic = 'neutropenic',
  MechanicallyVentilated = 'mechanically_ventilated',
  Dialysis = 'dialysis',
  Transplant = 'transplant',
  Obese = 'obese',
  Malnourished = 'malnourished',
  MultiMorbid = 'multi_morbid',
  EndStage = 'end_stage',
  PreTerm = 'pre_term',
  TB = 'tb',
  COVID19 = 'covid19',
  PostCOVID = 'post_covid',
  OrganFailure = 'organ_failure',
  Septic = 'septic',
  Burn = 'burn',
  Congenital = 'congenital',
  Autoimmune = 'autoimmune',
  Tropical = 'tropical',
  Occupational = 'occupational',
  Environmental = 'environmental',
  PostSurgical = 'post_surgical',
}

export enum ContextCategory {
  Demographic = 'demographic',
  Clinical = 'clinical',
  CareSetting = 'care_setting',
  TreatmentPhase = 'treatment_phase',
  SystemLevel = 'system_level',
}

export const CONTEXT_CATEGORY: Record<ClinicalContext, ContextCategory> = {
  [ClinicalContext.Adult]: ContextCategory.Demographic,
  [ClinicalContext.Child]: ContextCategory.Demographic,
  [ClinicalContext.Neonate]: ContextCategory.Demographic,
  [ClinicalContext.Infant]: ContextCategory.Demographic,
  [ClinicalContext.Adolescent]: ContextCategory.Demographic,
  [ClinicalContext.OlderAdult]: ContextCategory.Demographic,
  [ClinicalContext.Male]: ContextCategory.Demographic,
  [ClinicalContext.Female]: ContextCategory.Demographic,
  [ClinicalContext.Intersex]: ContextCategory.Demographic,
  [ClinicalContext.Pregnant]: ContextCategory.Clinical,
  [ClinicalContext.Postpartum]: ContextCategory.Clinical,
  [ClinicalContext.Breastfeeding]: ContextCategory.Clinical,
  [ClinicalContext.Lactating]: ContextCategory.Clinical,
  [ClinicalContext.HIV]: ContextCategory.Clinical,
  [ClinicalContext.CKD]: ContextCategory.Clinical,
  [ClinicalContext.LiverDisease]: ContextCategory.Clinical,
  [ClinicalContext.Diabetes]: ContextCategory.Clinical,
  [ClinicalContext.Hypertension]: ContextCategory.Clinical,
  [ClinicalContext.Immunocompromised]: ContextCategory.Clinical,
  [ClinicalContext.Malnutrition]: ContextCategory.Clinical,
  [ClinicalContext.Anaemia]: ContextCategory.Clinical,
  [ClinicalContext.ICU]: ContextCategory.CareSetting,
  [ClinicalContext.Emergency]: ContextCategory.CareSetting,
  [ClinicalContext.Inpatient]: ContextCategory.CareSetting,
  [ClinicalContext.Outpatient]: ContextCategory.CareSetting,
  [ClinicalContext.Community]: ContextCategory.CareSetting,
  [ClinicalContext.Telemedicine]: ContextCategory.CareSetting,
  [ClinicalContext.HomeCare]: ContextCategory.CareSetting,
  [ClinicalContext.Surgery]: ContextCategory.TreatmentPhase,
  [ClinicalContext.PreOperative]: ContextCategory.TreatmentPhase,
  [ClinicalContext.PostOperative]: ContextCategory.TreatmentPhase,
  [ClinicalContext.Trauma]: ContextCategory.TreatmentPhase,
  [ClinicalContext.Oncology]: ContextCategory.TreatmentPhase,
  [ClinicalContext.Palliative]: ContextCategory.TreatmentPhase,
  [ClinicalContext.Psychiatry]: ContextCategory.TreatmentPhase,
  [ClinicalContext.PrimaryCare]: ContextCategory.SystemLevel,
  [ClinicalContext.Referral]: ContextCategory.SystemLevel,
  [ClinicalContext.Specialist]: ContextCategory.SystemLevel,
  [ClinicalContext.Geriatric]: ContextCategory.Demographic,
  [ClinicalContext.Cancer]: ContextCategory.Clinical,
  [ClinicalContext.Neutropenic]: ContextCategory.Clinical,
  [ClinicalContext.MechanicallyVentilated]: ContextCategory.CareSetting,
  [ClinicalContext.Dialysis]: ContextCategory.Clinical,
  [ClinicalContext.Transplant]: ContextCategory.Clinical,
  [ClinicalContext.Obese]: ContextCategory.Clinical,
  [ClinicalContext.Malnourished]: ContextCategory.Clinical,
  [ClinicalContext.MultiMorbid]: ContextCategory.Clinical,
  [ClinicalContext.EndStage]: ContextCategory.Clinical,
  [ClinicalContext.PreTerm]: ContextCategory.Demographic,
  [ClinicalContext.TB]: ContextCategory.Clinical,
  [ClinicalContext.COVID19]: ContextCategory.Clinical,
  [ClinicalContext.PostCOVID]: ContextCategory.Clinical,
  [ClinicalContext.OrganFailure]: ContextCategory.Clinical,
  [ClinicalContext.Septic]: ContextCategory.Clinical,
  [ClinicalContext.Burn]: ContextCategory.TreatmentPhase,
  [ClinicalContext.Congenital]: ContextCategory.Clinical,
  [ClinicalContext.Autoimmune]: ContextCategory.Clinical,
  [ClinicalContext.Tropical]: ContextCategory.Clinical,
  [ClinicalContext.Occupational]: ContextCategory.Clinical,
  [ClinicalContext.Environmental]: ContextCategory.Clinical,
  [ClinicalContext.PostSurgical]: ContextCategory.TreatmentPhase,
};

export interface ContextResolution {
  activeContexts: ClinicalContext[];
  contextScore: Record<string, number>;
  derivedFrom: ContextEvidence[];
}

export interface ContextEvidence {
  context: ClinicalContext;
  source: string;
  value: string | number | boolean;
  confidence: number;
  timestamp: number;
}

export interface ContextModifier {
  context: ClinicalContext;
  visibility: 'show' | 'hide' | 'disable' | 'require';
  targetType: ObjectType;
  targetId: string;
  reason: string;
}

export interface ContextualRule {
  context: ClinicalContext;
  objectType: ObjectType;
  field: string;
  action: 'show' | 'hide' | 'require' | 'disable' | 'set_default' | 'modify_range';
  value?: unknown;
  priority: number;
  reason: string;
}

export class ClinicalContextEngine {
  private contextModifiers: Map<string, ContextModifier[]> = new Map();
  private contextualRules: ContextualRule[] = [];

  resolve(patient: PatientContextData, encounter?: EncounterContextData): ContextResolution {
    const active: ClinicalContext[] = [];
    const evidence: ContextEvidence[] = [];
    const scores: Record<string, number> = {};

    this.resolveDemographic(patient, active, evidence, scores);
    this.resolveClinical(patient, active, evidence, scores);
    this.resolveCareSetting(encounter, active, evidence, scores);
    this.resolveTreatmentPhase(encounter, active, evidence, scores);

    return { activeContexts: active, contextScore: scores, derivedFrom: evidence };
  }

  getActiveContexts(patient: PatientContextData, encounter?: EncounterContextData): ClinicalContext[] {
    return this.resolve(patient, encounter).activeContexts;
  }

  getModifiers(contexts: ClinicalContext[]): ContextModifier[] {
    const modifiers: ContextModifier[] = [];
    for (const ctx of contexts) {
      const ctxMods = this.contextModifiers.get(ctx) || [];
      modifiers.push(...ctxMods);
    }
    return this.deduplicateWithPriority(modifiers);
  }

  getVisibility(contexts: ClinicalContext[], objectType: ObjectType, objectId: string): 'show' | 'hide' | 'disable' | 'require' | 'set_default' | 'modify_range' {
    const applicable = this.contextualRules.filter(
      r => contexts.includes(r.context) && r.objectType === objectType,
    );
    if (applicable.length === 0) return 'show';
    applicable.sort((a, b) => b.priority - a.priority);
    return applicable[0].action;
  }

  evaluateFieldRule(contexts: ClinicalContext[], objectType: ObjectType, field: string): ContextualRule | null {
    const applicable = this.contextualRules.filter(
      r => contexts.includes(r.context) && r.objectType === objectType && r.field === field,
    );
    if (applicable.length === 0) return null;
    applicable.sort((a, b) => b.priority - a.priority);
    return applicable[0];
  }

  registerModifier(modifier: ContextModifier): void {
    const key = `${modifier.targetType}:${modifier.targetId}`;
    const existing = this.contextModifiers.get(key) || [];
    existing.push(modifier);
    this.contextModifiers.set(key, existing);
  }

  registerRule(rule: ContextualRule): void {
    this.contextualRules.push(rule);
  }

  private resolveDemographic(
    patient: PatientContextData,
    active: ClinicalContext[],
    evidence: ContextEvidence[],
    scores: Record<string, number>,
  ): void {
    const ageYears = this.calcAge(patient.dateOfBirth, patient.age);
    if (ageYears < 0.08) { active.push(ClinicalContext.Neonate); scores.neonate = 1; }
    else if (ageYears < 1) { active.push(ClinicalContext.Infant); scores.infant = 1; }
    else if (ageYears < 13) { active.push(ClinicalContext.Child); scores.child = 1; }
    else if (ageYears < 18) { active.push(ClinicalContext.Adolescent); scores.adolescent = 1; }
    else if (ageYears < 65) { active.push(ClinicalContext.Adult); scores.adult = 1; }
    else { active.push(ClinicalContext.OlderAdult); scores.older_adult = 1; }
    evidence.push({ context: active[active.length - 1], source: 'demographic', value: ageYears, confidence: 1, timestamp: Date.now() });

    if (patient.sexAtBirth === 'female') active.push(ClinicalContext.Female);
    else if (patient.sexAtBirth === 'male') active.push(ClinicalContext.Male);
    else active.push(ClinicalContext.Intersex);
    evidence.push({ context: active[active.length - 1], source: 'demographic', value: patient.sexAtBirth, confidence: 1, timestamp: Date.now() });
  }

  private resolveClinical(
    patient: PatientContextData,
    active: ClinicalContext[],
    evidence: ContextEvidence[],
    _scores: Record<string, number>,
  ): void {
    if (patient.isPregnant) {
      active.push(ClinicalContext.Pregnant);
      evidence.push({ context: ClinicalContext.Pregnant, source: 'clinical', value: true, confidence: 1, timestamp: Date.now() });
    }
    if (patient.isPostpartum) {
      active.push(ClinicalContext.Postpartum);
      evidence.push({ context: ClinicalContext.Postpartum, source: 'clinical', value: true, confidence: 1, timestamp: Date.now() });
    }
    if (patient.isBreastfeeding) {
      active.push(ClinicalContext.Breastfeeding);
      evidence.push({ context: ClinicalContext.Breastfeeding, source: 'clinical', value: true, confidence: 1, timestamp: Date.now() });
    }
    if (patient.conditions) {
      for (const condition of patient.conditions) {
        const ctx = this.conditionToContext(condition);
        if (ctx) {
          active.push(ctx);
          evidence.push({ context: ctx, source: 'clinical', value: condition, confidence: 0.9, timestamp: Date.now() });
        }
      }
    }
  }

  private resolveCareSetting(
    encounter?: EncounterContextData,
    active?: ClinicalContext[],
    _evidence?: ContextEvidence[],
    _scores?: Record<string, number>,
  ): void {
    if (!encounter || !active) return;
    active.push(encounter.careSetting as ClinicalContext);
  }

  private resolveTreatmentPhase(
    encounter?: EncounterContextData,
    active?: ClinicalContext[],
    _evidence?: ContextEvidence[],
    _scores?: Record<string, number>,
  ): void {
    if (!encounter || !active) return;
    if (encounter.phase) {
      active.push(encounter.phase as ClinicalContext);
    }
  }

  private conditionToContext(condition: string): ClinicalContext | null {
    const map: Record<string, ClinicalContext> = {
      'hiv': ClinicalContext.HIV, 'hiv/aids': ClinicalContext.HIV,
      'ckd': ClinicalContext.CKD, 'chronic kidney disease': ClinicalContext.CKD,
      'liver disease': ClinicalContext.LiverDisease, 'cirrhosis': ClinicalContext.LiverDisease,
      'diabetes': ClinicalContext.Diabetes, 'diabetes mellitus': ClinicalContext.Diabetes,
      'hypertension': ClinicalContext.Hypertension,
      'immunocompromised': ClinicalContext.Immunocompromised, 'immunosuppressed': ClinicalContext.Immunocompromised,
      'malnutrition': ClinicalContext.Malnutrition,
      'anaemia': ClinicalContext.Anaemia, 'anemia': ClinicalContext.Anaemia,
    };
    return map[condition.toLowerCase()] || null;
  }

  private calcAge(dob?: string, age?: number): number {
    if (dob) {
      const birth = new Date(dob);
      return (Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    }
    return age || 30;
  }

  private deduplicateWithPriority(modifiers: ContextModifier[]): ContextModifier[] {
    const map = new Map<string, ContextModifier>();
    for (const m of modifiers) {
      const key = `${m.targetType}:${m.targetId}`;
      const existing = map.get(key);
      if (!existing || this.priority(m.visibility) > this.priority(existing.visibility)) {
        map.set(key, m);
      }
    }
    return Array.from(map.values());
  }

  private priority(v: string): number {
    return v === 'hide' ? 4 : v === 'disable' ? 3 : v === 'require' ? 2 : 1;
  }
}

export interface PatientContextData {
  dateOfBirth?: string;
  age?: number;
  sexAtBirth: string;
  isPregnant?: boolean;
  isPostpartum?: boolean;
  isBreastfeeding?: boolean;
  conditions?: string[];
  weightKg?: number;
  heightCm?: number;
}

export interface EncounterContextData {
  careSetting: string;
  phase?: string;
  department?: string;
  facility?: string;
  encounterType?: string;
}

export const contextEngine = new ClinicalContextEngine();
