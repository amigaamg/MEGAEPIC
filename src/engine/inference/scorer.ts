// ── scorer.ts ──
// AMEXAN clinical inference engine — consultant-level reasoning
// Bayesian-inspired: priors → feature likelihoods → posterior probability
// Layers: age gating → syndrome activation → scoring → temporal → competing suppression
//          → pathognomonic overrides → investigation feedback → subtype scoring
//          → safety net override

import { PatientForm } from '../../types';
import { DiseaseNode, Investigation, ManagementProtocol, HistoryFeature, ExamFeature } from '../knowledge-graph/types';
import { PatientContext, Evidence, SeverityInfo } from './types';
import { ALL_DISEASES } from '../knowledge-graph/loadDiseases';
import { interpretForm, ClinicalInterpretation } from './clinicalInterpreter';
import { identifySyndromes, SyndromeResult } from './syndromeEngine';
import { localizeDisease, LocalizationResult } from './localizationEngine';
import { matchIllnessScripts, ScriptMatchResult } from './illnessScriptMatcher';

// ── EXPORTED TYPES ──────────────────────────────────────────────────────────
export interface InvestigationResult {
  type: 'lab' | 'imaging' | 'procedure';
  name: string;
  result: string | number;
  details?: Record<string, any>;
}

export interface ConsultantDiagnosis {
  disease: DiseaseNode;
  diseaseId: string;
  diseaseName: string;
  rawScore: number;
  probability: number;
  confidence: number;
  risk: 'critical' | 'high' | 'moderate' | 'low';
  evidence: Evidence;
  explanation: string;
  suppressed: boolean;
  suppressedBy?: string[];
  relation: 'primary' | 'secondary' | 'complication' | 'comorbidity';
  management: ManagementProtocol[];
  investigations: Investigation[];
}

// ── CONTEXT EXTRACTION ──────────────────────────────────────────────────────
function extractContext(form: PatientForm): PatientContext {
  return {
    ageMonths: parseInt(form.biodata.ageMonths) || 0,
    isHIVPositive: !!form.pmh.hiv,
    isMalnourished: parseFloat(form.vitals.muac) < 12.5 || (form.nutrition.malnutritionSigns?.length ?? 0) > 0,
    hasAtopy: !!(form.family.atopyFamily || form.pmh.asthmaDx),
    hasFamilyAsthma: !!(form.family.asthmaFamily),
    isSmokingExposure: !!(form.family.smokingExposure),
    hasTbContact: !!(form.hpi.tbContact),
    isOvercrowding: !!(form.family.housingConditions?.toLowerCase().includes('crowded')),
    isUnvaccinated: !!(form.immunization.status?.toLowerCase() === 'none' || form.immunization.status?.toLowerCase() === 'incomplete'),
  };
}

// ── SYMPTOM MAP ─────────────────────────────────────────────────────────────
// Maps symptom feature IDs to a function that checks the form for presence.
// Each disease JSON references features by these IDs.
type SymptomChecker = (form: PatientForm, ctx: PatientContext) => boolean;

export const symptomMap: Record<string, SymptomChecker> = {
  // ── Chief complaint symptoms ───────────────────────────────────────────
  cough:                 (f) => f.complaints.includes('cough'),
  fever:                 (f) => f.complaints.includes('fever'),
  wheeze:                (f) => f.complaints.includes('wheeze'),
  difficulty_breathing:  (f) => f.complaints.includes('difficulty_breathing'),
  stridor:               (f) => f.complaints.includes('stridor'),
  chest_pain:            (f) => f.complaints.includes('chest_pain'),
  hemoptysis:            (f) => f.complaints.includes('hemoptysis'),
  noisy_breathing:       (f) => f.complaints.includes('noisy_breathing'),
  lethargy:              (f) => f.complaints.includes('lethargy'),
  cyanosis:              (f) => f.complaints.includes('cyanosis'),
  nasal_discharge:       (f) => f.complaints.includes('nasal_discharge'),
  sore_throat:           (f) => f.complaints.includes('sore_throat'),
  chest_tightness:       (f) => f.complaints.includes('chest_tightness'),
  rash:                  (f) => f.complaints.includes('rash'),
  ear_pain:              (f) => f.complaints.includes('ear_pain'),
  abdominal_pain:        (f) => f.complaints.includes('abdominal_pain'),
  fast_breathing:        (f) => f.vitals.rr !== '',
  poor_feeding:          (f) => f.nutrition.appetite === 'poor' || f.nutrition.appetite === 'reduced' || !!f.hpi.feedingDiff,

  // ── HPI-level symptoms ──────────────────────────────────────────────────
  reduced_feeding:       (f) => !!f.hpi.feedingDiff,
  difficulty_feeding:    (f) => !!f.hpi.feedingDiff,
  night_sweats:          (f) => !!f.hpi.nightSweats,
  weight_loss:           (f) => !!f.hpi.weightLoss,
  tb_contact:            (f) => !!f.hpi.tbContact,
  orthopnea:             (f) => !!f.hpi.orthopnea,
  sweating_during_feeds: (f) => !!f.hpi.sweatingFeeds,
  hoarseness:            (f) => !!f.hpi.hoarseness,
  barking_cough:         (f) => f.hpi.coughChar === 'barking',
  choking_episode:       (f) => !!f.hpi.suddenOnset,
  sudden_cough:          (f) => !!f.hpi.suddenOnset,
  unilateral_wheeze:     (f) => !!f.hpi.unilateralWheeze,
  chronic_cough:         (f) => f.hpi.coughDuration === 'chronic' || f.hpi.coughDuration === '>=14_days' || f.hpi.coughDuration === 'over_2_weeks' || f.hpi.coughDuration === '14_days' || (f.hpi.coughDuration !== 'acute' && f.hpi.coughDuration !== ''),
  dysphagia:             (f) => !!f.hpi.drooling,
  difficulty_swallowing: (f) => !!f.hpi.drooling,
  paroxysmal_cough:      (f) => !!f.hpi.pertussisContact,
  post_tussive_vomiting: (f) => !!f.hpi.postTussiveVomiting,
  exercise_triggered_symptoms: (f) => !!f.hpi.exerciseTriggered,
  recurrent_respiratory_infections: (f) => !!f.pmh.recurrentChest,
  irritability:          (f) => !!f.hpi.vomitingHPI || !!f.ros.vomiting,
  apnoeic_spells:        (f) => !!f.hpi.cyanoticEpisodes,
  vomiting_hpi:          (f) => !!f.hpi.vomitingHPI,
  seizure_hpi:           (f) => !!f.hpi.seizureHPI,

  // ── ROS symptoms ───────────────────────────────────────────────────────
  fatigue:               (f) => !!f.ros.fatigue,
  palpitations:          (f) => !!f.ros.palpitations,
  headache:              (f) => !!f.ros.headache,
  seizures:              (f) => !!f.ros.seizures || !!f.hpi.seizureHPI,
  vomiting:              (f) => !!f.ros.vomiting,
  lethargy_ros:          (f) => !!f.ros.lethargyRos,
  cyanosis_ros:          (f) => !!f.ros.cyanosisRos,
  constipation:          (f) => !!f.ros.constipation,
  altered_mental_state:  (f) => f.vitals.examConsciousLevel !== '' && f.vitals.examConsciousLevel !== 'alert',

  // ── CNS / other ────────────────────────────────────────────────────────
  hypothermia:           (f) => { const t = parseFloat(f.vitals.temp); return !isNaN(t) && t < 36; },
  lymphadenopathy:       (f) => f.vitals.lymphNodes !== '' && f.vitals.lymphNodes !== 'none',
  muscle_spasms:         (f) => !!f.vitals.examCnsTone && f.vitals.examCnsTone.includes('spasm'),
  trismus:               (f) => !!f.vitals.examCnsTone && f.vitals.examCnsTone.includes('trismus'),
  ascending_weakness:    (f) => !!f.vitals.examMuscleWasting,
  photophobia:           (f) => f.hpi.character?.includes('light') || f.hpi.site === 'head',
  joint_pain:            (f) => !!f.vitals.examJointSwelling,
  conjunctivitis:        (f) => !!(f.vitals.examSkinRash && f.ros.rash),
  visual_disturbance:    (f) => f.hpi.site === 'head' || !!f.ros.headache,
  developmental_regression: (f) => !!(f.development.concerns),

  // ── Extended respiratory features ────────────────────────────────────
  viral_prodrome:          (f) => !!f.hpi.recentURTI || f.complaints.includes('nasal_discharge'),
  bronchodilator_response: (f) => (f.hpi.txResponse?.toLowerCase().includes('improved') || f.hpi.txResponse?.toLowerCase().includes('resolved')) || false,
  dyspnea:                 (f) => f.complaints.includes('difficulty_breathing'),
  family_atopy:            (f) => !!(f.family.atopyFamily || f.family.asthmaFamily),
  personal_atopy:          (f) => !!(f.pmh.asthmaDx || f.family.atopyFamily || f.pmh.recurrentChest),
  recurrent_episodes:      (f) => f.hpi.wheezePattern === 'recurrent' || !!f.pmh.recurrentChest,
  trigger_exposure:        (f) => !!f.hpi.allergenExposure || !!f.hpi.exerciseTriggered || !!f.hpi.allergenTrigger,
  apnoea:                  (f) => !!f.hpi.cyanoticEpisodes,
  first_wheeze_episode:    (f) => f.hpi.wheezePattern === 'first',
  nasal_congestion:        (f) => !!f.ros.nasalDischargeRos || f.complaints.includes('nasal_discharge'),
  chronic_fatigue:         (f) => !!f.ros.fatigue,
  poor_weight_gain:        (f) => !!f.hpi.weightLoss,
  recurrent_pneumonia:     (f) => !!f.pmh.recurrentChest,
  weight_loss_or_failure_to_thrive: (f) => !!f.hpi.weightLoss || parseFloat(f.nutrition.muac) < 12.5,

  // ── Cough-specific features (added for KG disease coverage) ─────────────
  productive_cough:         (f) => f.hpi.coughChar === 'productive' || f.complaints.includes('productive_cough'),
  sputum_production:        (f) => !!f.hpi.sputumDetail,
  cough_non_productive:     (f) => f.hpi.coughChar === 'dry' || f.hpi.coughChar === 'non-productive',
  acute_cough:              (f) => f.hpi.coughDuration === 'acute',
  coryza:                   (f) => f.complaints.includes('nasal_discharge'),
  sneezing:                 (f) => f.ros.nasalDischargeRos || f.complaints.includes('nasal_discharge'),
  malaise:                  (f) => !!f.ros.fatigue,
  myalgia:                  (f) => !!f.ros.fatigue,
  myalgia_severe:           (f) => !!(f as any).hpi.myalgia,
  fever_low_grade:          (f) => f.hpi.feverPattern === 'low_grade',
  fever_sudden_onset_high:  (f) => f.hpi.feverPattern === 'high_grade' || f.hpi.feverPattern === 'continuous',
  high_fever_above_39_point_5: (f) => !!f.hpi.highFever,
  fatigue_profound:         (f) => !!f.ros.fatigue,
  seasonal_community_outbreak: (f) => !!f.hpi.sickContact,
  nocturnal_cough:          (f) => !!f.hpi.nocturnalCough,
  nocturnal_worsening:      (f) => !!f.hpi.nocturnalCough,
  heartburn_or_regurgitation: (f) => !!f.hpi.heartburnRegurg,
  sensation_of_post_nasal_drip: (f) => !!f.hpi.pnd,
  morning_cough_worse:      (f) => !!f.hpi.nocturnalCough,
  lower_limb_swelling:      (f) => !!f.ros.peripheralEdema,
  ankle_swelling:           (f) => !!f.ros.peripheralEdema,
  paroxysmal_nocturnal_dyspnea: (f) => !!f.hpi.pnd,
  chest_discomfort:         (f) => f.complaints.includes('chest_pain') || !!f.hpi.pleuriticPain,
  focal_chest_pain:         (f) => f.complaints.includes('chest_pain'),
  worsening_cough:          (f) => f.hpi.progression === 'worsening' || f.hpi.progression === 'worsening',
  recurrent_infections:     (f) => !!f.pmh.recurrentChest,
  dysphonia:                (f) => !!f.hpi.hoarseness,
  sinusitis_history:        (f) => !!(f as any).pmh.sinusitis,
  ace_inhibitor_use:        (f) => !!(f.pmh.medications && f.pmh.medications.toLowerCase().includes('ace')),
  allergic_rhinitis_history: (f) => !!f.family.atopyFamily,
  throat_clearing:          (f) => !!f.hpi.pnd,
  globus_sensation:         (f) => !!(f as any).hpi.dysphagia,
  low_grade_fever:          (f) => f.hpi.feverPattern === 'low_grade',
  previous_pneumonia:       (f) => !!f.pmh.recurrentChest,
  antibiotic_failure:       (f) => !!f.hpi.prevTx && f.hpi.txResponse === 'no_response',
  watery_eyes:              (f) => f.ros.nasalDischargeRos || f.complaints.includes('nasal_discharge'),
  smoking:                  (f) => !!f.family.smokingExposure,
  hiv_exposure_or_infection: (f) => !!f.pmh.hiv,
  diabetes:                 (f) => !!f.pmh.diabetesDx,
  cardiac_history:          (f) => !!f.pmh.cardiacDisease,
  immunodeficiency:         (f) => !!f.pmh.immunodeficiencyDx,
  cystic_fibrosis_history:  (f) => !!f.pmh.cysticFibrosisDx,
  overcrowding:             (f) => !!(f.family.housingConditions && f.family.housingConditions.toLowerCase().includes('crowded')),
  malnutrition:             (f) => !!(f.nutrition.malnutritionSigns && f.nutrition.malnutritionSigns.length > 0),
  prematurity:              (f) => !!(f.birth.neonatalComplications && f.birth.neonatalComplications.includes('prematurity')),
  incomplete_vaccination:   (f) => f.immunization.status === 'incomplete' || f.immunization.status === 'none',
  allergy_history:          (f) => !!f.pmh.allergies,
  tb_household_contact:     (f) => !!f.family.tbHousehold,
  recurrent_exacerbations:  (f) => !!f.pmh.recurrentChest,
  morning_headache:         (f) => !!f.ros.headache,
  playing_with_small_objects: (f) => !!f.hpi.suddenOnset,
  choking_episode_subite:   (f) => !!f.hpi.suddenOnset,
  cyanosis_episode:         (f) => !!f.hpi.cyanoticEpisodes || f.complaints.includes('cyanosis'),
  bronchiolitis_first_episode: (f) => f.hpi.wheezePattern === 'first',
  poor_feeding_infant:      (f) => !!f.hpi.feedingDiff || f.nutrition.appetite === 'poor' || f.nutrition.appetite === 'reduced',
};

// ── SIGN MAP ───────────────────────────────────────────────────────────────
// Maps sign feature IDs to a function that checks the form for examination findings.
type SignChecker = (form: PatientForm) => boolean;

export const signMap: Record<string, SignChecker> = {
  crackles:               (f) => !!f.vitals.examCrackles,
  bronchial_breathing:    (f) => !!f.vitals.examBronchial,
  chest_indrawing:        (f) => !!f.vitals.examIndrawing,
  tachypnea:              (f) => { const rr = parseInt(f.vitals.rr); return !isNaN(rr) && rr > 40; },
  hypoxia:                (f) => { const s = parseFloat(f.vitals.spo2); return !isNaN(s) && s < 92; },
  wheeze:                 (f) => !!f.vitals.examWheeze,
  stridor:                (f) => !!f.vitals.examStridor,
  prolonged_expiration:   (f) => !!f.vitals.examWheeze || !!f.vitals.airEntry,
  hyperinflation:         (f) => !!f.vitals.examHyperResonance,
  dullness_to_percussion: (f) => !!f.vitals.examDullness,
  reduced_air_entry:      (f) => !!f.vitals.examReducedBS,
  tracheal_deviation:     (f) => !!f.vitals.examTrachealDeviation,
  hyperresonance:         (f) => !!f.vitals.examHyperResonance,
  absent_breath_sounds:   (f) => !!f.vitals.examReducedBS,
  toxic_appearance:       (f) => f.vitals.generalCondition === 'toxic' || f.vitals.generalCondition === 'severe' || f.vitals.generalCondition === 'critical',
  drooling:               (f) => !!f.hpi.drooling,
  tripod_posture:         (f) => !!f.hpi.tripodPosition,
  asymmetrical_air_entry: (f) => !!f.vitals.examReducedBS,
  clubbing:               (f) => !!f.vitals.clubbingExam,
  murmur:                 (f) => f.vitals.examMurmur !== '' && f.vitals.examMurmur !== 'none',
  cyanosis:               (f) => !!f.vitals.cyanosisExam || !!f.ros.cyanosisRos,
  hepatomegaly:           (f) => !!f.vitals.examHepatomegaly,
  gallop_rhythm:          (f) => f.vitals.examHeartSounds === 'gallop',
  tachycardia:            (f) => { const hr = parseInt(f.vitals.hr); return !isNaN(hr) && hr > 140; },
  hypotension:            (f) => { const bp = parseInt(f.vitals.bpSystolic); return !isNaN(bp) && bp < 80; },
  prolonged_cap_refill:   (f) => { const cr = parseInt(f.vitals.capRefill); return !isNaN(cr) && cr >= 3; },
  pallor:                 (f) => !!f.vitals.pallorExam,
  jaundice:               (f) => !!f.vitals.jaundiceExam,
  petechiae:              (f) => !!f.vitals.examSkinPetechiae,
  splenomegaly:           (f) => !!f.vitals.examSplenomegaly,
  neck_stiffness:         (f) => !!f.vitals.examNeckStiffness,
  bulging_fontanelle:     (f) => f.vitals.examFontanelle === 'bulging',
  altered_consciousness:  (f) => f.vitals.examConsciousLevel !== '' && f.vitals.examConsciousLevel !== 'alert',
  prolonged_convulsion:   (f) => !!f.ros.seizures,
  reduced_tone:           (f) => f.vitals.examCnsTone === 'hypotonia' || f.vitals.examCnsTone === 'reduced',
  areflexia:              (f) => f.vitals.examCnsReflexes === 'absent',
  elevated_bp:            (f) => { const bp = parseInt(f.vitals.bpSystolic); return !isNaN(bp) && bp > 120; },
  cervical_lymphadenopathy: (f) => f.vitals.lymphNodes === 'cervical' || f.vitals.lymphNodeSite !== '',
  muffled_heart_sounds:   (f) => f.vitals.examHeartSounds === 'muffled',
  pericardial_rub:        (f) => f.vitals.examHeartSounds === 'rub',
  arthritis_signs:        (f) => !!f.vitals.examJointSwelling,
  conjunctival_injection: (f) => !!f.ros.rash || !!f.hpi.hoarseness,
  oral_mucosa_changes:    (f) => !!(f.vitals.examSkinRash),
  koplik_spots:           (f) => !!(f.vitals.examSkinRash),
  pseudomembrane:         (f) => false, // requires ENT exam — not in current form
  bull_neck:              (f) => f.vitals.lymphNodes === 'cervical' && f.vitals.lymphNodeSite !== '',
  rose_spots:             (f) => false,
  risus_sardonicus:       (f) => false,
  opisthotonos:           (f) => false,
  generalised_rigidity:   (f) => false,
  whoop:                  (f) => !!f.hpi.pertussisContact,
  weak_pulses:            (f) => f.vitals.capRefill === 'prolonged' || parseInt(f.vitals.capRefill) >= 3,
  splinter_haemorrhages:  (f) => !!f.vitals.examSkinPetechiae,
  respiratory_muscle_weakness: (f) => !!f.vitals.examMuscleWasting,
  papilledema:            (f) => false,
  focal_neurological_signs: (f) => false,
  ophthalmoplegia:        (f) => false,
  failure_to_thrive:      (f) => parseFloat(f.nutrition.muac) < 12.5 || !!f.development.concerns,
  nasal_flaring:          (f) => !!f.vitals.examNasalFlaring,
  grunting:               (f) => !!f.vitals.examGrunting,
  extremity_changes:      (f) => !!f.vitals.examJointSwelling || !!f.vitals.edemaExam,

  // ── Extended respiratory signs ──────────────────────────────────────
  accessory_muscle_use:    (f) => !!f.vitals.examIndrawing || !!f.vitals.chestShape,
  chest_recession:         (f) => !!f.vitals.examIndrawing,
  silent_chest:            (f) => !!f.vitals.examReducedBS && !f.vitals.examWheeze,
  fine_crackles:           (f) => !!f.vitals.examCrackles,
  pleural_effusion_signs:  (f) => !!f.vitals.examDullness || !!f.vitals.examReducedBS || !!f.vitals.examTrachealDeviation,
  respiratory_distress:    (f) => !!f.vitals.examIndrawing || !!f.vitals.examNasalFlaring || !!f.vitals.examGrunting || parseFloat(f.vitals.spo2) < 92,
};

// ── EVALUATION HELPERS ─────────────────────────────────────────────────────
function isSymptomPresent(symptomId: string, form: PatientForm, ctx: PatientContext): boolean {
  return symptomMap[symptomId] ? symptomMap[symptomId](form, ctx) : false;
}

function isSignPresent(signId: string, form: PatientForm): boolean {
  return signMap[signId] ? signMap[signId](form) : false;
}

// ── SYNDROME ACTIVATION ────────────────────────────────────────────────────
function activateSyndromes(form: PatientForm): Set<string> {
  const tags = new Set<string>();

  if (form.complaints.includes('difficulty_breathing') || form.vitals.rr) tags.add('respiratory_distress');
  if (form.vitals.examStridor || form.complaints.includes('stridor')) tags.add('upper_airway_obstruction');
  if (form.vitals.examWheeze || form.complaints.includes('wheeze')) tags.add('lower_airway_obstruction');
  if (form.complaints.includes('fever') || parseFloat(form.vitals.temp) >= 38) tags.add('fever');
  if (form.complaints.includes('cough')) tags.add('cough');
  if (form.hpi.seizureHPI || form.ros.seizures) tags.add('seizure');
  if (form.vitals.examConsciousLevel !== '' && form.vitals.examConsciousLevel !== 'alert') tags.add('altered_consciousness');
  if (form.vitals.examHepatomegaly || form.ros.hepatomegaly) tags.add('hepatomegaly');
  if (form.vitals.examNeckStiffness || form.vitals.examFontanelle === 'bulging') tags.add('meningism');
  if (form.hpi.drooling || form.vitals.examStridor) tags.add('upper_airway_danger');
  if (form.vitals.examCrackles || form.vitals.examBronchial) tags.add('lower_tract_signs');
  if (form.hpi.tbContact || form.hpi.nightSweats || form.hpi.coughDuration === 'chronic') tags.add('tb_suspect');
  if (form.complaints.includes('chest_pain') || form.hpi.pleuriticPain) tags.add('chest_pain_syndrome');
  if (form.complaints.includes('cyanosis') || form.vitals.cyanosisExam || form.ros.cyanosisRos) tags.add('cyanosis');
  if (form.complaints.includes('palpitations') || form.vitals.hr) tags.add('palpitation');
  if (form.complaints.includes('rash') || form.vitals.examSkinRash) tags.add('rash_syndrome');
  if (form.vitals.examMurmur && form.vitals.examMurmur !== 'none') tags.add('cardiac_murmur');
  if (form.vitals.examCrackles && !form.vitals.examWheeze) tags.add('consolidation_syndrome');
  if (form.vitals.examHyperResonance || form.vitals.examTrachealDeviation) tags.add('air_leak_syndrome');
  if (form.vitals.examDullness || form.vitals.examReducedBS) tags.add('pleural_syndrome');
  if (form.vitals.examIndrawing || form.vitals.examNasalFlaring) tags.add('respiratory_difficulty');
  if (form.hpi.feedingDiff || form.nutrition.appetite === 'poor' || form.nutrition.appetite === 'reduced') tags.add('feeding_difficulty');
  if (form.ros.lethargyRos || form.complaints.includes('lethargy')) tags.add('lethargy');
  if (form.hpi.hoarseness || form.hpi.coughChar === 'barking') tags.add('croup_syndrome');
  if (form.vitals.examGrunting) tags.add('grunting');
  if (form.hpi.nightSweats || form.hpi.weightLoss) tags.add('constitutional');
  if (form.pmh.hiv) tags.add('hiv');

  return tags;
}

// ── SEVERITY ASSESSMENT ────────────────────────────────────────────────────
export function getSeverity(form: PatientForm): SeverityInfo {
  const spo2 = parseFloat(form.vitals.spo2);
  const temp = parseFloat(form.vitals.temp);
  const spo2Valid = !isNaN(spo2);
  const tempValid = !isNaN(temp);

  // Critical: life-threatening
  const critical =
    (spo2Valid && spo2 < 85) ||
    form.vitals.examConsciousLevel === 'unconscious' ||
    (form.hpi.drooling && form.hpi.tripodPosition) ||
    (form.vitals.examTrachealDeviation && form.vitals.examHyperResonance);

  if (critical) return { level: 'critical', color: '#dc2626', bg: '#fef2f2', msg: 'Life-threatening — immediate intervention required' };

  // Severe: urgent
  const severe =
    (spo2Valid && spo2 < 92) ||
    !!form.vitals.examGrunting ||
    (!!form.vitals.examIndrawing && !!form.vitals.examStridor) ||
    form.vitals.examConsciousLevel === 'drowsy' ||
    form.vitals.examConsciousLevel === 'unresponsive' ||
    (!!form.ros.seizures && !!form.vitals.examNeckStiffness);

  if (severe) return { level: 'severe', color: '#dc2626', bg: '#fee2e2', msg: 'Severe illness — urgent management needed' };

  // Moderate
  const moderate =
    !!form.vitals.examIndrawing ||
    !!form.vitals.examNasalFlaring ||
    (spo2Valid && spo2 < 94) ||
    (tempValid && temp >= 39.5) ||
    !!form.hpi.feedingDiff ||
    !!form.ros.lethargyRos;

  if (moderate) return { level: 'moderate', color: '#f59e0b', bg: '#fffbeb', msg: 'Moderate severity — close monitoring required' };

  return { level: 'mild', color: '#16a34a', bg: '#f0fdf4', msg: 'Mild illness — supportive care and observation' };
}

// ── SCORING CORE ───────────────────────────────────────────────────────────

function computeHistoryScore(disease: DiseaseNode, form: PatientForm, ctx: PatientContext): number {
  let score = 0;
  for (const feat of disease.historyFeatures || []) {
    if (isSymptomPresent(feat.symptomId, form, ctx)) {
      let w = feat.weight || 1;

      // ── Contextual weights: modify weight based on vitals/context ─────────
      if (feat.contextualWeights) {
        for (const cw of feat.contextualWeights) {
          if (evalCondition(cw.condition, form, ctx)) {
            w += cw.weightBoost;
          }
        }
      }

      score += w;

      // ── Negative predictor: presence reduces overall score ──────────────
      if (feat.negativePredictor && feat.symptomId !== feat.negativePredictor.description) {
        // Immediate reduction applied later via applyNegativePredictors
      }
    }
  }
  return score;
}

function computeExamScore(disease: DiseaseNode, form: PatientForm, ctx: PatientContext): number {
  let score = 0;
  for (const feat of disease.examFeatures || []) {
    if (isSignPresent(feat.signId, form)) {
      let w = feat.baseWeight || 1;
      if (feat.doubleWeight) w *= 2;

      // ── Subtype modulation ──────────────────────────────────────────────
      if (feat.subtypeModulation && disease.subtypes) {
        for (const [subId, mod] of Object.entries(feat.subtypeModulation)) {
          // Modulation stored for subtype scoring later
        }
      }

      score += w;
    }
  }
  return score;
}

function applyRiskFactors(disease: DiseaseNode, ctx: PatientContext): number {
  let boost = 0;
  for (const rf of disease.riskFactors || []) {
    const matched =
      (rf.id === 'hiv' && ctx.isHIVPositive) ||
      (rf.id === 'hiv_exposure_or_infection' && ctx.isHIVPositive) ||
      (rf.id === 'malnutrition' && ctx.isMalnourished) ||
      (rf.id === 'atopy' && ctx.hasAtopy) ||
      (rf.id === 'family_asthma' && ctx.hasFamilyAsthma) ||
      (rf.id === 'smoking' && ctx.isSmokingExposure) ||
      (rf.id === 'smoking_exposure' && ctx.isSmokingExposure) ||
      (rf.id === 'tb_contact' && ctx.hasTbContact) ||
      (rf.id === 'tb_household_contact' && ctx.hasTbContact) ||
      (rf.id === 'overcrowding' && ctx.isOvercrowding) ||
      (rf.id === 'lack_of_BCG_vaccination' && ctx.isUnvaccinated);
    if (matched) {
      boost += rf.multiplier || 0.2;
    }
  }
  return boost;
}

// ── DYNAMIC PREVALENCE ─────────────────────────────────────────────────────
function getDynamicPrevalence(disease: DiseaseNode, ctx: PatientContext): number {
  let p = disease.prevalenceWeight || 0.5;

  // HIV: boost TB, PCP, LIP, severe pneumonia
  if (ctx.isHIVPositive) {
    if (['pulmonary_tuberculosis', 'pcp', 'lip'].includes(disease.id)) p = Math.min(1, p * 2.5);
    if (disease.id === 'pneumonia') p = Math.min(1, p * 1.4);
  }

  // Malnutrition: boost TB, severe pneumonia, sepsis
  if (ctx.isMalnourished) {
    if (['pulmonary_tuberculosis', 'pneumonia', 'sepsis'].includes(disease.id)) p = Math.min(1, p * 1.6);
  }

  // Atopy: boost asthma
  if (ctx.hasAtopy && disease.id === 'asthma') p = Math.min(1, p * 2.0);

  // Smoking exposure
  if (ctx.isSmokingExposure && disease.id === 'asthma') p = Math.min(1, p * 1.3);

  return p;
}

// ── CONDITION EVALUATOR ────────────────────────────────────────────────────
function evalCondition(condition: string, form: PatientForm, ctx: PatientContext): boolean {
  switch (condition) {
    // Temperature conditions
    case 'temp >= 38.5':
    case 'fever_high':      return parseFloat(form.vitals.temp) >= 38.5;
    case 'temp >= 39':
    case 'fever_very_high': return parseFloat(form.vitals.temp) >= 39;
    case 'temp < 38':
    case 'fever_low':       return parseFloat(form.vitals.temp) < 38 && parseFloat(form.vitals.temp) >= 37.5;

    // General appearance
    case 'toxic':           return form.vitals.generalCondition === 'toxic' || form.vitals.generalCondition === 'severe';
    case 'not_toxic':       return form.vitals.generalCondition !== 'toxic' && form.vitals.generalCondition !== 'severe';

    // Age conditions
    case 'age < 12':        return ctx.ageMonths < 12;
    case 'age < 24':        return ctx.ageMonths < 24;
    case 'age >= 60':       return ctx.ageMonths >= 60;
    case 'age >= 12':       return ctx.ageMonths >= 12;

    // Hypoxia
    case 'spo2 < 92':       return parseFloat(form.vitals.spo2) < 92;
    case 'spo2 >= 92':      return parseFloat(form.vitals.spo2) >= 92;

    // Cough characteristics
    case 'cough_barking':   return form.hpi.coughChar === 'barking';
    case 'cough_chronic':   return form.hpi.coughDuration === 'chronic';
    case 'cough_acute':     return form.hpi.coughDuration === 'acute';

    // Wheeze
    case 'wheeze_present':  return !!form.vitals.examWheeze || !!form.hpi.wheeze;
    case 'wheeze_absent':   return !form.vitals.examWheeze && !form.hpi.wheeze;

    // Onset
    case 'onset_sudden':    return !!form.hpi.suddenOnset;
    case 'onset_gradual':   return form.hpi.onsetType === 'gradual' || (!!form.hpi.suddenOnset === false);

    // Risk factors
    case 'hiv_positive':    return ctx.isHIVPositive;
    case 'malnourished':    return ctx.isMalnourished;

    // TB-specific
    case 'tb_contact_pos':  return ctx.hasTbContact;
    case 'night_sweats':    return !!form.hpi.nightSweats;

    // Feeding
    case 'feeding_diff':    return !!form.hpi.feedingDiff;

    // Default
    default:                return false;
  }
}

// ── NEGATIVE PREDICTOR HANDLING ────────────────────────────────────────────
function applyNegativePredictors(disease: DiseaseNode, form: PatientForm, ctx: PatientContext, baseScore: number): number {
  let score = baseScore;
  for (const feat of disease.historyFeatures || []) {
    if (feat.negativePredictor && isSymptomPresent(feat.symptomId, form, ctx)) {
      score -= feat.negativePredictor.scoreReduction || 0;
    }
  }
  for (const feat of disease.examFeatures || []) {
    if (feat.negativePredictorForPneumonia && isSignPresent(feat.signId, form)) {
      score -= 4; // standard negative predictor penalty for exam features
    }
    if (feat.excludePneumonia && isSignPresent(feat.signId, form)) {
      score = 0; // absolute exclusion
    }
  }
  return Math.max(score, 0);
}

// ── SUBTYPE SCORING ────────────────────────────────────────────────────────
function scoreSubtypes(disease: DiseaseNode, form: PatientForm, ctx: PatientContext): { subtypeId: string; score: number }[] {
  const results: { subtypeId: string; score: number }[] = [];
  if (!disease.subtypes) return results;

  for (const sub of disease.subtypes) {
    let subScore = 0;

    // Key features
    for (const kf of sub.keyFeatures || []) {
      if (isSymptomPresent(kf.feature, form, ctx) || isSignPresent(kf.feature, form)) {
        subScore += kf.weight || 1;
      }
    }

    // Negative predictors per subtype
    for (const np of sub.negativePredictors || []) {
      if (isSymptomPresent(np.feature, form, ctx) || isSignPresent(np.feature, form)) {
        subScore -= np.weightReduction || 2;
      }
    }

    // Age peak
    if (sub.agePeak) {
      const [min, max] = sub.agePeak;
      if (ctx.ageMonths >= min && ctx.ageMonths <= max) {
        subScore += 2;
      }
    }

    // Risk factors
    for (const rf of sub.riskFactors || []) {
      if (
        (rf === 'hiv' && ctx.isHIVPositive) ||
        (rf === 'malnutrition' && ctx.isMalnourished) ||
        (rf === 'atopy' && ctx.hasAtopy) ||
        (rf === 'asthma' && ctx.hasAtopy) ||
        (rf === 'sickle_cell' && !!form.pmh.sickleCellDisease)
      ) {
        subScore += 3;
      }
    }

    results.push({ subtypeId: sub.id, score: Math.max(subScore, 0) });
  }

  return results.sort((a, b) => b.score - a.score);
}

// ── MIMIC DISCRIMINATOR HANDLING ───────────────────────────────────────────
function applyMimicPenalties(disease: DiseaseNode, form: PatientForm, ctx: PatientContext, score: number): number {
  let adjusted = score;
  for (const mimic of disease.mimics || []) {
    const mimicDisease = ALL_DISEASES.find(d => d.id === mimic.diseaseId);
    if (!mimicDisease) continue;

    // Count how many discriminators match
    let discriminatorHits = 0;
    for (const disc of mimic.discriminators || []) {
      if (isSymptomPresent(disc, form, ctx) || isSignPresent(disc, form)) {
        discriminatorHits++;
      }
    }

    if (discriminatorHits > 0) {
      const impact = mimic.negativeImpactOnParen ?? 0.5;
      const reduction = discriminatorHits * impact;
      adjusted -= reduction;
    }
  }
  return Math.max(adjusted, 0);
}

// ── PATHOGNOMONIC CONSTELLATION OVERRIDES ──────────────────────────────────
interface ConstellationOverride {
  description: string;
  check: (form: PatientForm) => boolean;
  targetDisease: string;
  overrideScore: number;   // score to set (effectively 100% probability)
  safetyAlert: string;
}

const CONSTELLATION_OVERRIDES: ConstellationOverride[] = [
  {
    description: 'Epiglottitis: drooling + tripod + toxic',
    check: (f) => !!f.hpi.drooling && !!f.hpi.tripodPosition && (f.vitals.generalCondition === 'toxic' || f.vitals.generalCondition === 'severe'),
    targetDisease: 'epiglottitis',
    overrideScore: 100,
    safetyAlert: 'IMMEDIATE AIRWAY ALERT: Epiglottitis suspected — do NOT examine throat; prepare for intubation',
  },
  {
    description: 'Tension pneumothorax: hyperresonance + absent BS + tracheal deviation',
    check: (f) => !!f.vitals.examHyperResonance && !!f.vitals.examReducedBS && !!f.vitals.examTrachealDeviation,
    targetDisease: 'pneumothorax',
    overrideScore: 100,
    safetyAlert: 'EMERGENCY: Tension pneumothorax — immediate needle decompression required',
  },
  {
    description: 'Foreign body: sudden choking + unilateral wheeze + asymmetrical air entry',
    check: (f) => !!f.hpi.suddenOnset && !!f.hpi.unilateralWheeze && !!f.vitals.examReducedBS,
    targetDisease: 'foreign_body_aspiration',
    overrideScore: 100,
    safetyAlert: 'URGENT: Suspect foreign body aspiration — prepare for bronchoscopy',
  },
  {
    description: 'Croup vs epiglottitis: barking cough + stridor + no drooling',
    check: (f) => f.hpi.coughChar === 'barking' && !!f.vitals.examStridor && !f.hpi.drooling,
    targetDisease: 'croup',
    overrideScore: 60,
    safetyAlert: '',
  },
  {
    description: 'Croup danger: stridor + indrawing + toxic',
    check: (f) => !!f.vitals.examStridor && !!f.vitals.examIndrawing && (f.vitals.generalCondition === 'toxic' || f.vitals.generalCondition === 'severe'),
    targetDisease: 'epiglottitis',
    overrideScore: 50,
    safetyAlert: 'CAUTION: Severe upper airway obstruction — consider epiglottitis / bacterial tracheitis',
  },
  {
    description: 'Pneumonia: crackles + fever + no wheeze',
    check: (f) => !!f.vitals.examCrackles && (f.complaints.includes('fever') || parseFloat(f.vitals.temp) >= 38) && !f.vitals.examWheeze,
    targetDisease: 'pneumonia',
    overrideScore: 30,
    safetyAlert: '',
  },
  {
    description: 'Kenyan TB criteria: 2+ symptoms + TB contact',
    check: (f) => {
      let symptoms = 0;
      if (f.hpi.coughDuration === 'chronic' || f.hpi.coughChar === 'chronic' || f.complaints.includes('cough')) symptoms++;
      if (f.complaints.includes('fever')) symptoms++;
      if (f.hpi.weightLoss) symptoms++;
      if (f.complaints.includes('lethargy') || f.ros.lethargyRos) symptoms++;
      return symptoms >= 2 && !!f.hpi.tbContact;
    },
    targetDisease: 'pulmonary_tuberculosis',
    overrideScore: 90,
    safetyAlert: 'CLINICAL TB per Kenyan Guidelines — start TB therapy workup',
  },
  {
    description: 'TB: chronic cough + night sweats + weight loss',
    check: (f) => {
      const hasCough = f.hpi.coughDuration === 'chronic' || f.hpi.coughDuration === '>=14_days' || !!(f.hpi.nightSweats && f.complaints.includes('cough'));
      return hasCough && !!f.hpi.nightSweats && !!f.hpi.weightLoss;
    },
    targetDisease: 'pulmonary_tuberculosis',
    overrideScore: 85,
    safetyAlert: 'SUSPECT TB: Send GeneXpert and chest X-ray; initiate infection control',
  },
];

// ── SAFETY OVERRIDE ────────────────────────────────────────────────────────
// If any critical red flag is present, ensure mustNotMiss diseases are elevated
function applySafetyOverride(scores: Map<string, number>, form: PatientForm, ctx: PatientContext): void {
  const redFlagsPresent = [
    parseFloat(form.vitals.spo2) < 85,
    form.vitals.examConsciousLevel === 'unconscious',
    form.hpi.drooling && form.hpi.tripodPosition,
    form.vitals.examTrachealDeviation && form.vitals.examHyperResonance,
    form.ros.seizures && form.vitals.examNeckStiffness,
  ];

  const hasCritical = redFlagsPresent.some(Boolean);
  if (!hasCritical) return;

  // Boost any mustNotMiss disease that is relevant
  for (const d of ALL_DISEASES) {
    if (d.mustNotMiss && scores.has(d.id)) {
      const cur = scores.get(d.id)!;
      scores.set(d.id, Math.max(cur, 20));
    }
  }
}

// ── TEMPORAL MULTIPLIER ────────────────────────────────────────────────────
// Uses both onsetType and coughDuration. Chronic diseases (TB, empyema, effusion)
// are NOT penalised when the patient actually has chronic cough documented.
function applyTemporalMultiplier(scores: Map<string, number>, form: PatientForm): void {
  const onset = form.hpi.onsetType;
  const duration = form.hpi.coughDuration;
  const hasChronicCough = form.hpi.coughDuration === 'chronic' || (form.hpi.nightSweats && form.hpi.weightLoss);

  const acuteDiseases = ['foreign_body_aspiration', 'pneumothorax', 'epiglottitis', 'pneumonia', 'croup'];
  const chronicDiseases = ['pulmonary_tuberculosis', 'empyema', 'pleural_effusion'];

  scores.forEach((score, id) => {
    let mult = 1.0;

    if (onset === 'sudden') {
      if (acuteDiseases.includes(id)) mult = 1.4;
      // Don't penalise TB/empyema/effusion when chronic cough is documented
      else if (chronicDiseases.includes(id) && !hasChronicCough) mult = 0.5;
      else if (chronicDiseases.includes(id) && hasChronicCough) mult = 1.0;
    }
    if (onset === 'gradual') {
      if (chronicDiseases.includes(id)) mult = 1.4;
      if (acuteDiseases.includes(id)) mult = 0.6;
    }

    // Cough duration-based adjustments (override onset-based if more specific)
    if (duration === 'chronic' && chronicDiseases.includes(id)) mult = 1.5;
    if (duration === 'acute' && acuteDiseases.includes(id)) mult = 1.2;
    if (duration === 'chronic' && acuteDiseases.includes(id)) mult = 0.4;

    scores.set(id, score * mult);
  });
}

// ── COMPETING SUPPRESSION ──────────────────────────────────────────────────
function applyCompetingSuppression(
  scores: Map<string, number>,
  form: PatientForm,
  suppressMap: Map<string, string[]>
): void {
  const rules: { winner: string; loser: string; condition: (f: PatientForm) => boolean }[] = [
    {
      winner: 'epiglottitis',
      loser: 'croup',
      condition: (f) => !!f.hpi.drooling && !!f.hpi.tripodPosition,
    },
    {
      winner: 'foreign_body_aspiration',
      loser: 'asthma',
      condition: (f) => !!f.hpi.suddenOnset && !!f.vitals.examWheeze,
    },
    {
      winner: 'pneumothorax',
      loser: 'pleural_effusion',
      condition: (f) => !!f.vitals.examHyperResonance && !!f.vitals.examTrachealDeviation,
    },
    {
      winner: 'croup',
      loser: 'epiglottitis',
      condition: (f) => f.hpi.coughChar === 'barking' && !f.hpi.drooling,
    },
    {
      winner: 'pneumonia',
      loser: 'bronchiolitis',
      condition: (f) => !!f.vitals.examCrackles && (f.complaints.includes('fever') || parseFloat(f.vitals.temp) >= 38) && !f.vitals.examWheeze,
    },
    {
      winner: 'pulmonary_tuberculosis',
      loser: 'pneumonia',
      condition: (f) => f.hpi.coughDuration === 'chronic' && !!f.hpi.weightLoss && !!f.hpi.nightSweats,
    },
    {
      winner: 'pulmonary_tuberculosis',
      loser: 'hiv_related_infections',
      condition: (f) => !!f.hpi.tbContact && !!f.hpi.weightLoss && (f.hpi.coughDuration === 'chronic' || f.complaints.includes('cough')),
    },
    {
      winner: 'asthma',
      loser: 'bronchiolitis',
      condition: (f) => ctxAtopyPresent(f) && f.hpi.wheezePattern === 'recurrent',
    },
  ];

  for (const rule of rules) {
    if (rule.condition(form)) {
      const ws = scores.get(rule.winner);
      const ls = scores.get(rule.loser);
      if (ws !== undefined && ls !== undefined && ls > 0) {
        scores.set(rule.loser, ls * 0.15); // 85% suppression
        if (!suppressMap.has(rule.loser)) suppressMap.set(rule.loser, []);
        suppressMap.get(rule.loser)!.push(rule.winner);
      }
    }
  }
}

function ctxAtopyPresent(form: PatientForm): boolean {
  return !!(form.family.atopyFamily || form.family.asthmaFamily || form.pmh.asthmaDx);
}

// ── INVESTIGATION RESULTS FEEDBACK ─────────────────────────────────────────
function applyInvestigationResults(scores: Map<string, number>, results: InvestigationResult[], form: PatientForm): void {
  for (const inv of results) {
    const r = inv.result.toString().toLowerCase();

    if (inv.name.toLowerCase().includes('chest x-ray') || inv.name.toLowerCase().includes('cxr')) {
      if (r.includes('consolidation') || r.includes('infiltrate')) {
        boostDisease(scores, 'pneumonia', 1.8);
        boostDisease(scores, 'bronchiolitis', 1.2);
      }
      if (r.includes('hyperinflation')) {
        boostDisease(scores, 'asthma', 1.5);
        boostDisease(scores, 'bronchiolitis', 1.4);
      }
      if (r.includes('steeple sign'))     boostDisease(scores, 'croup', 2.0);
      if (r.includes('thumb sign'))       boostDisease(scores, 'epiglottitis', 2.5);
      if (r.includes('pleural effusion') || r.includes('meniscus')) {
        boostDisease(scores, 'pleural_effusion', 1.8);
        boostDisease(scores, 'empyema', 1.5);
      }
      if (r.includes('pneumothorax') || r.includes('air leak')) boostDisease(scores, 'pneumothorax', 3.0);
      if (r.includes('cavitation') || r.includes('hilar') || r.includes('adenopathy')) {
        boostDisease(scores, 'pulmonary_tuberculosis', 2.0);
      }
      if (r.includes('cardiomegaly')) {
        boostDisease(scores, 'chf', 1.8);
        boostDisease(scores, 'myocarditis', 1.5);
      }
      if (r.includes('bronchovascular') || r.includes('bat wing')) {
        boostDisease(scores, 'chf', 1.6);
      }
    }

    if (inv.name.toLowerCase().includes('genexpert') || inv.name.toLowerCase().includes('tb')) {
      if (r.includes('positive') || r.includes('detected')) {
        boostDisease(scores, 'pulmonary_tuberculosis', 5.0);
        suppressOthers(scores, 'pulmonary_tuberculosis', 0.5);
      }
    }

    if (inv.name.toLowerCase().includes('crp') && !isNaN(Number(r))) {
      const crpVal = Number(r);
      if (crpVal > 100) {
        boostDisease(scores, 'pneumonia', 1.4);
        boostDisease(scores, 'empyema', 1.6);
        boostDisease(scores, 'sepsis', 1.5);
      }
    }

    if (inv.name.toLowerCase().includes('blood culture') && r.includes('positive')) {
      boostDisease(scores, 'pneumonia', 1.5);
      boostDisease(scores, 'sepsis', 1.8);
    }

    if (inv.name.toLowerCase().includes('ada') && r.includes('high')) {
      boostDisease(scores, 'pulmonary_tuberculosis', 2.0);
    }

    if (inv.name.toLowerCase().includes('malaria') && r.includes('positive')) {
      boostDisease(scores, 'cerebral_malaria', 3.0);
      boostDisease(scores, 'severe_malaria', 2.5);
    }

    if (inv.name.toLowerCase().includes('cbc') && !isNaN(Number(r.split(' ').pop() || ''))) {
      // If WBC very high
      const parts = r.split(/[\s,]+/);
      for (const p of parts) {
        const wbc = parseFloat(p);
        if (!isNaN(wbc) && wbc > 15000) {
          boostDisease(scores, 'pneumonia', 1.3);
          boostDisease(scores, 'sepsis', 1.4);
          boostDisease(scores, 'empyema', 1.3);
        }
      }
    }
  }
}

function boostDisease(scores: Map<string, number>, id: string, factor: number): void {
  const cur = scores.get(id);
  if (cur !== undefined) scores.set(id, cur * factor);
}

function suppressOthers(scores: Map<string, number>, excludeId: string, factor: number): void {
  scores.forEach((score, id) => {
    if (id !== excludeId) scores.set(id, score * factor);
  });
}

// ── RISK LEVEL COMPUTATION ─────────────────────────────────────────────────
function computeRiskLevel(disease: DiseaseNode, form: PatientForm, evidence: Evidence): ConsultantDiagnosis['risk'] {
  const criticalFlags = [
    parseFloat(form.vitals.spo2) < 85,
    form.vitals.examConsciousLevel === 'unconscious',
    form.hpi.drooling && form.hpi.tripodPosition,
    form.vitals.examTrachealDeviation && form.vitals.examHyperResonance,
    form.ros.seizures && form.vitals.examNeckStiffness,
  ];
  if (criticalFlags.some(Boolean)) return 'critical';

  if (disease.mustNotMiss) return 'high';

  if (evidence.examHits.some(e => ['chest_indrawing', 'stridor', 'tachypnea', 'grunting', 'wheeze'].includes(e))) {
    return 'moderate';
  }

  return 'low';
}

// ── CONFIDENCE ─────────────────────────────────────────────────────────────
function computeConfidence(
  disease: DiseaseNode,
  evidence: Evidence,
  probability: number,
  suppressors?: string[],
): number {
  let baseConf = 0.5;
  const clueCount = (disease.diagnosticClues || []).length;
  if (clueCount > 0) {
    const matchedClues = disease.diagnosticClues!.filter(clue =>
      evidence.historyHits.some(h => clue.toLowerCase().includes(h)) ||
      evidence.examHits.some(e => clue.toLowerCase().includes(e))
    ).length;
    baseConf = clueCount > 0 ? matchedClues / clueCount : 0.5;
  }
  baseConf = 0.5 * baseConf + 0.5 * probability;
  if (suppressors && suppressors.length > 0) baseConf *= 0.7;
  return Math.min(1, Math.max(0, baseConf));
}

// ── EXPLANATION GENERATOR ──────────────────────────────────────────────────
function generateExplanation(
  disease: DiseaseNode,
  evidence: Evidence,
  prob: number,
  suppressors?: string[],
): string {
  const parts: string[] = [];
  const name = disease.name;

  if (prob > 0.85) {
    parts.push(`${name} is the leading diagnosis`);
  } else if (prob > 0.5) {
    parts.push(`${name} is the most likely diagnosis`);
  } else if (prob > 0.2) {
    parts.push(`${name} is a possible diagnosis`);
  } else {
    parts.push(`${name} is considered as a remote possibility`);
  }

  if (evidence.historyHits.length > 0) {
    parts.push(`given history of ${evidence.historyHits.map(h => h.replace(/_/g, ' ')).join(', ')}`);
  }
  if (evidence.examHits.length > 0) {
    parts.push(`with examination findings of ${evidence.examHits.map(e => e.replace(/_/g, ' ')).join(', ')}`);
  }
  if (evidence.riskBoosts.length > 0) {
    parts.push(`in the context of ${evidence.riskBoosts.join(', ')}`);
  }
  if (disease.mustNotMiss) {
    parts.push('(must not be missed — severity warrants exclusion)');
  }

  // Add differential reasoning note if suppressed
  if (suppressors && suppressors.length > 0) {
    parts.push(`however, the competing diagnosis of ${suppressors.join(', ')} reduces confidence in this differential`);
  }

  // Add safety note for critical diseases
  const sevAlert = CONSTELLATION_OVERRIDES.find(o => o.targetDisease === disease.id && o.safetyAlert);
  if (sevAlert) {
    parts.push(`⚠ ${sevAlert.safetyAlert}`);
  }

  return parts.join(' ');
}

// ── RELATION DETERMINATION ─────────────────────────────────────────────────
function determineRelation(id: string, primaryScores: Map<string, number>): ConsultantDiagnosis['relation'] {
  const topId = Array.from(primaryScores.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
  if (id === topId) return 'primary';

  const disease = ALL_DISEASES.find(d => d.id === id);
  if (!disease) return 'secondary';

  const hasComplicationParent = ALL_DISEASES.some(d =>
    d.complications?.some(c => c.diseaseId === id)
  );
  return hasComplicationParent ? 'complication' : 'secondary';
}

// ── MULTI-PASS INFERENCE ENGINE ────────────────────────────────────────────
export function runConsultantInference(
  form: PatientForm,
  investigationResults?: InvestigationResult[],
  previousRunProbs?: Map<string, number>,
): ConsultantDiagnosis[] {
  const ctx = extractContext(form);
  const activeTags = activateSyndromes(form);
  const ageMonths = ctx.ageMonths;

  // ─── 1. AGE FILTER ────────────────────────────────────────────────────
  const ageFiltered = ALL_DISEASES.filter(d => {
    const peak = d.agePeak || (d as any).agePeak_months;
    if (!peak || !Array.isArray(peak) || peak.length < 2) return true; // no age restriction
    const [min, max] = peak;
    const minAllowed = Math.round(min * 0.5);
    const maxAllowed = Math.round(max * 2);
    return ageMonths >= minAllowed && ageMonths <= maxAllowed;
  });

  // ─── 2. SYNDROME ACTIVATION FILTER + MUST NOT MISS ────────────────────
  let candidates = ageFiltered.filter(d =>
    (d.syndromeTags || []).some(tag => activeTags.has(tag)) || d.mustNotMiss
  );

  // Neonatal sepsis hard cutoff
  if (ageMonths >= 1) {
    candidates = candidates.filter(d => d.id !== 'neonatal_sepsis');
  }

  // ─── 3. INITIAL SCORING ──────────────────────────────────────────────
  const scores = new Map<string, number>();
  const subtypeResults = new Map<string, { subtypeId: string; score: number }[]>();

  for (const disease of candidates) {
    const H = computeHistoryScore(disease, form, ctx);
    const E = computeExamScore(disease, form, ctx);
    const riskBoost = applyRiskFactors(disease, ctx);
    const dynamicPrev = getDynamicPrevalence(disease, ctx);
    const base = (0.4 * H + 0.6 * E + riskBoost) * dynamicPrev;

    // Apply negative predictors
    let score = applyNegativePredictors(disease, form, ctx, base);

    // Apply mimic penalties
    score = applyMimicPenalties(disease, form, ctx, score);

    scores.set(disease.id, Math.max(score, 0));

    // Subtype scoring
    const subtypes = scoreSubtypes(disease, form, ctx);
    if (subtypes.length > 0) {
      subtypeResults.set(disease.id, subtypes);
    }
  }

  // ─── 4. TEMPORAL MULTIPLIER ──────────────────────────────────────────
  applyTemporalMultiplier(scores, form);

  // ─── 5. COMPETING SUPPRESSION ───────────────────────────────────────
  const suppressionMap = new Map<string, string[]>();
  applyCompetingSuppression(scores, form, suppressionMap);

  // ─── 6. PATHOGNOMONIC CONSTELLATION OVERRIDES ───────────────────────
  for (const override of CONSTELLATION_OVERRIDES) {
    if (override.check(form) && scores.has(override.targetDisease)) {
      scores.set(override.targetDisease, override.overrideScore);
    }
  }

  // ─── 7. SAFETY OVERRIDE ──────────────────────────────────────────────
  applySafetyOverride(scores, form, ctx);

  // ─── 8. BAYESIAN-LIKE ADJUSTMENT FROM PREVIOUS RUN ────────────────────
  if (previousRunProbs && previousRunProbs.size > 0) {
    scores.forEach((score, id) => {
      const prior = previousRunProbs.get(id) || 0;
      scores.set(id, score * 0.8 + prior * 0.2);
    });
  }

  // ─── 9. INVESTIGATION RESULTS ──────────────────────────────────────
  if (investigationResults && investigationResults.length > 0) {
    applyInvestigationResults(scores, investigationResults, form);
  }

  // ─── 10. NORMALISE TO PROBABILITIES ──────────────────────────────────
  const totalScore = Math.max(Array.from(scores.values()).reduce((a, b) => a + b, 0), 0.01);
  const probs = new Map<string, number>();
  scores.forEach((score, id) => probs.set(id, score / totalScore));

  // ─── 11. BUILD RESULT ─────────────────────────────────────────────────
  const result: ConsultantDiagnosis[] = [];
  const sorted = Array.from(probs.entries()).sort((a, b) => b[1] - a[1]);

  for (const [diseaseId, prob] of sorted) {
    const disease = ALL_DISEASES.find(d => d.id === diseaseId);
    if (!disease) continue;

    const evidence: Evidence = {
      historyHits: (disease.historyFeatures || [])
        .filter(f => isSymptomPresent(f.symptomId, form, ctx))
        .map(f => f.symptomId),
      examHits: (disease.examFeatures || [])
        .filter(f => isSignPresent(f.signId, form))
        .map(f => f.signId),
      riskBoosts: (disease.riskFactors || [])
        .filter(rf => {
          switch (rf.id) {
            case 'hiv':           return ctx.isHIVPositive;
            case 'malnutrition':  return ctx.isMalnourished;
            case 'atopy':         return ctx.hasAtopy;
            case 'family_asthma': return ctx.hasFamilyAsthma;
            case 'smoking':       return ctx.isSmokingExposure;
            case 'tb_contact':    return ctx.hasTbContact;
            default:              return false;
          }
        })
        .map(rf => rf.id),
    };

    const riskLevel = computeRiskLevel(disease, form, evidence);
    const confidence = computeConfidence(disease, evidence, prob, suppressionMap.get(diseaseId));

    // Add subtype info to explanation if available
    const subtypes = subtypeResults.get(diseaseId);
    let explanation = generateExplanation(disease, evidence, prob, suppressionMap.get(diseaseId));
    if (subtypes && subtypes.length > 0 && subtypes[0].score > 0) {
      const winningSub = disease.subtypes?.find(s => s.id === subtypes[0].subtypeId);
      if (winningSub) {
        explanation += ` | Subtype: ${winningSub.name}`;
      }
    }

    result.push({
      disease,
      diseaseId,
      diseaseName: disease.name,
      rawScore: scores.get(diseaseId) || 0,
      probability: prob,
      confidence,
      risk: riskLevel,
      evidence,
      explanation,
      suppressed: suppressionMap.has(diseaseId),
      suppressedBy: suppressionMap.get(diseaseId) || [],
      relation: determineRelation(diseaseId, scores),
      management: disease.managementProtocols || [],
      investigations: (Array.isArray(disease.investigations) ? disease.investigations : []) as Investigation[],
    });
  }

  return result;
}

// ── LAYERED CLINICAL REASONING ENGINE ────────────────────────────────────────
// Uses the 4-layer architecture: interpretation → syndromes → localization → script matching
function runLayeredInference(form: PatientForm): ConsultantDiagnosis[] {
  const ctx = extractContext(form);

  // Layer 1: Clinical Interpretation
  const interpretation = interpretForm(form);

  // Layer 2: Syndrome Identification
  const syndromes = identifySyndromes(interpretation, form);

  // Layer 3: Anatomical Localization
  const localization = localizeDisease(syndromes, interpretation, form);

  // Layer 4: Illness Script Matching
  const matches = matchIllnessScripts(form, interpretation, syndromes, localization);

  // ── Build result from script matches ─────────────────────────────────────
  const result: ConsultantDiagnosis[] = [];
  const scores = new Map<string, number>();

  for (const match of matches) {
    const disease = ALL_DISEASES.find(d => d.id === match.diseaseId);
    if (!disease) continue;

    const score = match.matchScore * 100;
    scores.set(match.diseaseId, score);

    const evidence: Evidence = {
      historyHits: (disease.historyFeatures || [])
        .filter(f => symptomMap[f.symptomId]?.(form, ctx))
        .map(f => f.symptomId),
      examHits: (disease.examFeatures || [])
        .filter(f => signMap[f.signId]?.(form))
        .map(f => f.signId),
      riskBoosts: (disease.riskFactors || [])
        .filter(rf => {
          switch (rf.id) {
            case 'hiv':           return ctx.isHIVPositive;
            case 'malnutrition':  return ctx.isMalnourished;
            case 'atopy':         return ctx.hasAtopy;
            case 'family_asthma': return ctx.hasFamilyAsthma;
            case 'smoking':       return ctx.isSmokingExposure;
            case 'tb_contact':    return ctx.hasTbContact;
            default:              return false;
          }
        })
        .map(rf => rf.id),
    };

    const riskLevel = computeRiskLevel(disease, form, evidence);
    const relation = determineRelation(match.diseaseId, scores);

    const explainParts: string[] = [];
    explainParts.push(`${match.diseaseName}: syndrome alignment ${(match.syndromeAlignment * 100).toFixed(0)}%, feature coverage ${(match.featureCoverage * 100).toFixed(0)}%`);
    if (localization.primary) explainParts.push(`Localization: ${localization.primary}`);
    if (syndromes.primarySyndrome) explainParts.push(`Primary syndrome: ${syndromes.primarySyndrome}`);
    if (match.contradictoryFeatures.length > 0) {
      explainParts.push(`Contradictions: ${match.contradictoryFeatures.join('; ')}`);
    }
    if (match.missingCriticalFeatures.length > 0) {
      explainParts.push(`Missing critical: ${match.missingCriticalFeatures.join(', ')}`);
    }

    result.push({
      disease,
      diseaseId: match.diseaseId,
      diseaseName: match.diseaseName,
      rawScore: score,
      probability: score / 100,
      confidence: match.confidence === 'high' ? 0.85 : match.confidence === 'moderate' ? 0.5 : 0.2,
      risk: riskLevel,
      evidence,
      explanation: explainParts.join('; '),
      suppressed: false,
      suppressedBy: [],
      relation,
      management: disease.managementProtocols || [],
      investigations: (Array.isArray(disease.investigations) ? disease.investigations : []) as Investigation[],
    });
  }

  return result;
}

// ── LEGACY WRAPPERS ─────────────────────────────────────────────────────────
export function runInference(form: PatientForm): ConsultantDiagnosis[] {
  if (form.complaints.length === 0) return [];
  return runLayeredInference(form);
}

/** @deprecated Use runInference instead. Kept for backward compat. */
export function computeScores(form: PatientForm): ConsultantDiagnosis[] {
  return runInference(form);
}
