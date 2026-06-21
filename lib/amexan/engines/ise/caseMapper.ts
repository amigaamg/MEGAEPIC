import type { FeatureRegistry, FeatureEntry } from '../../core/types';

export interface ClinicalCaseInput {
  demographics: {
    age: number;
    sex: 'male' | 'female' | 'unknown';
    isChild?: boolean;
    isElderly?: boolean;
    pregnant?: boolean;
  };
  symptoms: {
    abdominalPain?: boolean;
    periumbilicalPain?: boolean;
    painMigratedToRIF?: boolean;
    rightIliacFossaPain?: boolean;
    painDurationHours?: number;
    painAggravatedByMovement?: boolean;
    painOnCoughing?: boolean;
    painOnWalking?: boolean;
    anorexia?: boolean;
    nausea?: boolean;
    vomiting?: boolean;
    vomitingBeforePain?: boolean;
    fever?: boolean;
    temperature?: number;
    malaise?: boolean;
    constipation?: boolean;
    diarrhea?: boolean;
    dysuria?: boolean;
    previousAttacks?: boolean;
  };
  signs: {
    temperature?: number;
    heartRate?: number;
    bloodPressure?: string;
    RIFTenderness?: boolean;
    mcburneyTenderness?: boolean;
    reboundTenderness?: boolean;
    localizedGuarding?: boolean;
    percussionTenderness?: boolean;
    rigidity?: boolean;
    rovsingSign?: boolean;
    psoasSign?: boolean;
    obturatorSign?: boolean;
    coughSign?: boolean;
    generalizedGuarding?: boolean;
    generalizedRigidity?: boolean;
    absentBowelSounds?: boolean;
    palpableMass?: boolean;
    septicAppearance?: boolean;
    dehydration?: boolean;
  };
  labs?: {
    wbc?: number;
    crp?: number;
    lactate?: number;
    betaHcg?: string;
    neutrophils?: number;
  };
}

export function mapCaseToRegistry(input: ClinicalCaseInput): FeatureRegistry {
  const r: FeatureRegistry = {};

  function set(id: string, present: boolean, weight = 5, source: FeatureEntry['source'] = 'history'): void {
    r[id] = {
      id,
      present,
      weight,
      diseaseWeights: {},
      negativeDiseaseWeights: {},
      source,
    };
  }

  // ── History symptoms ──
  if (input.symptoms.abdominalPain) set('abdominal_pain', true, 5, 'history');
  if (input.symptoms.periumbilicalPain) set('periumbilical_pain', true, 5, 'history');
  if (input.symptoms.painMigratedToRIF) set('pain_migration_to_RIF', true, 9, 'history');
  if (input.symptoms.rightIliacFossaPain) set('right_iliac_fossa_pain', true, 8, 'history');
  if (input.symptoms.painAggravatedByMovement) set('pain_aggravated_by_movement', true, 5, 'history');
  if (input.symptoms.painOnCoughing) set('pain_on_coughing', true, 4, 'history');
  if (input.symptoms.painOnWalking) set('pain_on_walking', true, 4, 'history');
  if (input.symptoms.anorexia) set('anorexia', true, 6, 'history');
  if (input.symptoms.nausea) set('nausea', true, 3, 'history');
  if (input.symptoms.vomiting) set('vomiting', true, 3, 'history');
  if (input.symptoms.vomitingBeforePain) set('pain_before_vomiting', true, 4, 'history');
  if (input.symptoms.fever !== undefined && input.symptoms.fever) {
    const temp = input.symptoms.temperature ?? input.signs.temperature;
    if (temp && temp >= 38) set('fever_high', true, 4, 'history');
    else set('low_grade_fever', true, 3, 'history');
  }
  if (input.symptoms.malaise) set('malaise', true, 1, 'history');
  if (input.symptoms.constipation) set('constipation', true, 2, 'history');
  if (input.symptoms.diarrhea) set('diarrhea', true, 1, 'history');
  if (input.symptoms.dysuria) set('dysuria', true, 1, 'history');

  // ── Vital signs ──
  if (input.signs.temperature !== undefined) {
    set('present_temp', true, 2, 'vital');
    if (input.signs.temperature > 37.3) set('present_temp_above_37_3', true, 2, 'vital');
    if (input.signs.temperature > 38.5) set('high_fever', true, 5, 'vital');
  }
  if (input.signs.heartRate !== undefined) {
    set('tachycardia', input.signs.heartRate > 100, 3, 'vital');
    if (input.signs.heartRate > 120) set('tachycardia_severe', true, 4, 'vital');
  }
  if (input.signs.bloodPressure) {
    const parts = input.signs.bloodPressure.split('/');
    const sbp = parseInt(parts[0], 10);
    if (!isNaN(sbp) && sbp < 90) set('hypotension', true, 5, 'vital');
  }

  // ── Exam signs ──
  if (input.signs.RIFTenderness) set('RIF_tenderness', true, 10, 'exam');
  if (input.signs.mcburneyTenderness) set('mcburney_tenderness', true, 10, 'exam');
  if (input.signs.reboundTenderness) set('rebound_tenderness', true, 8, 'exam');
  if (input.signs.localizedGuarding) set('localized_guarding', true, 8, 'exam');
  if (input.signs.percussionTenderness) set('percussion_tenderness', true, 6, 'exam');
  if (input.signs.rigidity) set('rigidity', true, 9, 'exam');
  if (input.signs.rovsingSign) set('rovsing_sign', true, 8, 'exam');
  if (input.signs.psoasSign) set('psoas_sign', true, 7, 'exam');
  if (input.signs.obturatorSign) set('obturator_sign', true, 7, 'exam');
  if (input.signs.coughSign) set('cough_sign', true, 6, 'exam');
  if (input.signs.generalizedGuarding) set('generalized_guarding', true, 10, 'exam');
  if (input.signs.generalizedRigidity) set('generalized_rigidity', true, 10, 'exam');
  if (input.signs.absentBowelSounds) set('absent_bowel_sounds', true, 6, 'exam');
  if (input.signs.palpableMass) set('palpable_rlq_mass', true, 7, 'exam');
  if (input.signs.septicAppearance) set('septic_appearance', true, 10, 'exam');
  if (input.signs.dehydration) set('dehydration', true, 2, 'exam');

  // ── Lab results ──
  if (input.labs) {
    if (input.labs.wbc !== undefined) {
      set('wbc_available', true, 1, 'lab');
      if (input.labs.wbc > 10000) set('leukocytosis', true, 3, 'lab');
      if (input.labs.wbc > 12000) set('wbc_above_12k', true, 3, 'lab');
      if (input.labs.wbc > 15000) set('wbc_above_15k', true, 4, 'lab');
    }
    if (input.labs.neutrophils !== undefined && input.labs.neutrophils > 75) {
      set('neutrophilia', true, 3, 'lab');
      set('left_shift', true, 2, 'lab');
    }
    if (input.labs.crp !== undefined) {
      set('crp_available', true, 1, 'lab');
    }
    if (input.labs.lactate !== undefined) {
      set('lactate_available', true, 1, 'lab');
      if (input.labs.lactate > 2) set('lactate_elevated', true, 4, 'lab');
      if (input.labs.lactate > 4) set('lactate_gt_4', true, 6, 'lab');
    }
    if (input.labs.betaHcg) {
      const positive = input.labs.betaHcg === 'positive' || input.labs.betaHcg.toLowerCase().includes('pos');
      set('beta_hcg_positive', positive, 5, 'lab');
    }
  }

  return r;
}

export function caseToAlvarado(input: ClinicalCaseInput): { score: number; risk: 'low' | 'moderate' | 'high' | 'very_high' } {
  let score = 0;
  if (input.symptoms.painMigratedToRIF) score += 1;
  if (input.symptoms.anorexia) score += 1;
  if (input.symptoms.nausea || input.symptoms.vomiting) score += 1;
  if (input.signs.RIFTenderness || input.signs.mcburneyTenderness) score += 2;
  if (input.signs.reboundTenderness) score += 1;
  if ((input.symptoms.fever && (input.symptoms.temperature ?? input.signs.temperature ?? 0) > 37.3) || (input.signs.temperature ?? 0) > 37.3) score += 1;
  if ((input.labs?.wbc ?? 0) > 10000) score += 2;
  if ((input.labs?.neutrophils ?? 0) > 75) score += 1;

  let risk: 'low' | 'moderate' | 'high' | 'very_high';
  if (score <= 3) risk = 'low';
  else if (score <= 6) risk = 'moderate';
  else if (score <= 8) risk = 'high';
  else risk = 'very_high';

  return { score, risk };
}
