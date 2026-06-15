export interface HistoryFeature {
  id: string;
  label: string;
  description?: string;
  type: 'boolean' | 'select' | 'multi_select' | 'number' | 'text';
  options?: string[];
  category: 'symptom_detail' | 'risk_factor' | 'exam_finding' | 'social' | 'occupation' | 'constitutional';
  diseaseWeights: Record<string, number>;
  condition?: string;
  negativePredictorFor?: { diseaseId: string; reduction: number }[];
  isRedFlag?: boolean;
  redFlagSeverity?: 'critical' | 'high' | 'moderate';
  redFlagMessage?: string;
}

const HISTORY_FEATURE_REGISTRY: Record<string, HistoryFeature> = {
  // ── COUGH FEATURES ──
  cough_productive: {
    id: 'cough_productive',
    label: 'Productive Cough',
    description: 'Cough producing sputum/phlegm',
    type: 'boolean',
    category: 'symptom_detail',
    diseaseWeights: { tb_pulm: 2, pneumonia_pulm: 4, asthma_pulm: -3, copd_pulm: 3, bronchiectasis: 4, lung_cancer: 1 },
  },
  sputum_blood: {
    id: 'sputum_blood',
    label: 'Hemoptysis (Blood in Sputum)',
    description: 'Coughing up blood or blood-stained sputum',
    type: 'boolean',
    category: 'symptom_detail',
    diseaseWeights: { tb_pulm: 5, pneumonia_pulm: 2, lung_cancer: 6, bronchiectasis: 4, pulmonary_embolism: 2 },
    isRedFlag: true,
    redFlagSeverity: 'high',
    redFlagMessage: 'Hemoptysis requires investigation — consider TB, lung cancer, bronchiectasis',
  },
  sputum_color_yellow: {
    id: 'sputum_color_yellow',
    label: 'Yellow/Yellowish Sputum',
    type: 'boolean',
    category: 'symptom_detail',
    diseaseWeights: { pneumonia_pulm: 3, bronchiectasis: 3, copd_pulm: 2 },
  },
  sputum_color_green: {
    id: 'sputum_color_green',
    label: 'Green Sputum',
    type: 'boolean',
    category: 'symptom_detail',
    diseaseWeights: { pneumonia_pulm: 3, bronchiectasis: 4, copd_pulm: 3 },
  },
  sputum_color_rusty: {
    id: 'sputum_color_rusty',
    label: 'Rusty-Coloured Sputum',
    type: 'boolean',
    category: 'symptom_detail',
    diseaseWeights: { pneumonia_pulm: 5, tb_pulm: 1 },
  },
  sputum_blood_stained: {
    id: 'sputum_blood_stained',
    label: 'Blood-Stained Sputum',
    type: 'boolean',
    category: 'symptom_detail',
    diseaseWeights: { tb_pulm: 5, lung_cancer: 5, bronchiectasis: 3 },
  },
  cough_duration_gt_2weeks: {
    id: 'cough_duration_gt_2weeks',
    label: 'Cough >2 Weeks Duration',
    type: 'boolean',
    category: 'symptom_detail',
    diseaseWeights: { tb_pulm: 6, asthma_pulm: 1, copd_pulm: 2, lung_cancer: 3, post_nasal_drip: 3 },
  },
  cough_duration_gt_8weeks: {
    id: 'cough_duration_gt_8weeks',
    label: 'Chronic Cough (>8 Weeks)',
    type: 'boolean',
    category: 'symptom_detail',
    diseaseWeights: { tb_pulm: 5, asthma_pulm: 2, copd_pulm: 2, gerd: 3, post_nasal_drip: 4, bronchiectasis: 3, lung_cancer: 2 },
  },
  night_cough: {
    id: 'night_cough',
    label: 'Nocturnal Cough / Worse at Night',
    type: 'boolean',
    category: 'symptom_detail',
    diseaseWeights: { asthma_pulm: 4, gerd: 3, heart_failure_card: 2, post_nasal_drip: 1 },
  },
  cough_wheeze: {
    id: 'cough_wheeze',
    label: 'Associated Wheezing',
    type: 'boolean',
    category: 'symptom_detail',
    diseaseWeights: { asthma_pulm: 6, copd_pulm: 4, bronchiectasis: 2, anaphylaxis: 2, foreign_body_aspiration: 3 },
  },
  cough_exercise_induced: {
    id: 'cough_exercise_induced',
    label: 'Exercise-Induced Cough',
    type: 'boolean',
    category: 'symptom_detail',
    diseaseWeights: { asthma_pulm: 5, copd_pulm: 1 },
  },
  cough_positional: {
    id: 'cough_positional',
    label: 'Cough Worse When Lying Down',
    type: 'boolean',
    category: 'symptom_detail',
    diseaseWeights: { gerd: 5, heart_failure_card: 3, post_nasal_drip: 2 },
  },

  // ── FEVER FEATURES ──
  rigors: {
    id: 'rigors',
    label: 'Rigors (Severe Shaking Chills)',
    type: 'boolean',
    category: 'symptom_detail',
    diseaseWeights: { malaria: 5, sepsis: 4, pneumonia_pulm: 3, uti: 3, infective_endocarditis: 2 },
    isRedFlag: true,
    redFlagSeverity: 'high',
    redFlagMessage: 'Rigors suggest significant systemic infection — consider malaria, sepsis, pneumonia',
  },
  fever_pattern_continuous: {
    id: 'fever_pattern_continuous',
    label: 'Continuous Fever',
    type: 'boolean',
    category: 'symptom_detail',
    diseaseWeights: { typhoid: 4, pneumonia_pulm: 2, uti: 2 },
  },
  fever_pattern_intermittent: {
    id: 'fever_pattern_intermittent',
    label: 'Intermittent Fever',
    type: 'boolean',
    category: 'symptom_detail',
    diseaseWeights: { malaria: 4, sepsis: 2, abscess: 2 },
  },
  fever_pattern_relapsing: {
    id: 'fever_pattern_relapsing',
    label: 'Relapsing Fever',
    type: 'boolean',
    category: 'symptom_detail',
    diseaseWeights: { malaria: 3, brucellosis: 4, typhoid: 1, lymphoma: 3 },
  },
  fever_night_sweats: {
    id: 'fever_night_sweats',
    label: 'Night Sweats',
    type: 'boolean',
    category: 'symptom_detail',
    diseaseWeights: { tb_pulm: 6, lymphoma: 4, hiv: 3, infective_endocarditis: 2, brucellosis: 3, malignancy: 2 },
    isRedFlag: true,
    redFlagSeverity: 'moderate',
    redFlagMessage: 'Night sweats — consider TB, lymphoma, HIV',
  },

  // ── CHEST PAIN FEATURES ──
  chest_pain_crushing: {
    id: 'chest_pain_crushing',
    label: 'Crushing / Squeezing Chest Pain',
    type: 'boolean',
    category: 'symptom_detail',
    diseaseWeights: { chest_pain: 6, anxiety_panic: 1, costochondritis: 1 },
    isRedFlag: true,
    redFlagSeverity: 'critical',
    redFlagMessage: 'Crushing chest pain — HIGH RISK ACS',
  },
  chest_pain_radiation_arm: {
    id: 'chest_pain_radiation_arm',
    label: 'Pain Radiating to Left Arm/Jaw',
    type: 'boolean',
    category: 'symptom_detail',
    diseaseWeights: { chest_pain: 6 },
    isRedFlag: true,
    redFlagSeverity: 'critical',
    redFlagMessage: 'Radiation of chest pain to arm/jaw — HIGH RISK ACS',
  },
  chest_pain_pleuritic: {
    id: 'chest_pain_pleuritic',
    label: 'Pleuritic Chest Pain (Sharp, Worse on Breathing)',
    type: 'boolean',
    category: 'symptom_detail',
    diseaseWeights: { pneumonia_pulm: 4, pulmonary_embolism: 4, pericarditis: 5, pleurisy: 4, pneumothorax: 3 },
  },
  chest_pain_positional: {
    id: 'chest_pain_positional',
    label: 'Positional Chest Pain (Better Leaning Forward)',
    type: 'boolean',
    category: 'symptom_detail',
    diseaseWeights: { pericarditis: 5 },
  },
  chest_pain_exertional: {
    id: 'chest_pain_exertional',
    label: 'Exertional Chest Pain',
    type: 'boolean',
    category: 'symptom_detail',
    diseaseWeights: { chest_pain: 5, aortic_stenosis: 2, hypertrophic_cardiomyopathy: 2 },
  },
  associated_sweating: {
    id: 'associated_sweating',
    label: 'Associated Sweating / Diaphoresis',
    type: 'boolean',
    category: 'symptom_detail',
    diseaseWeights: { chest_pain: 4, anxiety_panic: 3, hypoglycemia: 2, sepsis: 2 },
  },

  // ── DYSPNEA FEATURES ──
  orthopnea: {
    id: 'orthopnea',
    label: 'Orthopnea (Breathless When Lying Flat)',
    type: 'boolean',
    category: 'symptom_detail',
    diseaseWeights: { heart_failure_card: 6, copd_pulm: 2, asthma_pulm: 1 },
  },
  pnd: {
    id: 'pnd',
    label: 'Paroxysmal Nocturnal Dyspnea',
    type: 'boolean',
    category: 'symptom_detail',
    diseaseWeights: { heart_failure_card: 6 },
  },
  wheeze: {
    id: 'wheeze',
    label: 'Audible Wheeze',
    type: 'boolean',
    category: 'symptom_detail',
    diseaseWeights: { asthma_pulm: 6, copd_pulm: 4, anaphylaxis: 3, foreign_body_aspiration: 3, bronchiectasis: 2 },
  },
  stridor: {
    id: 'stridor',
    label: 'Stridor (High-Pitched Breathing Sound)',
    type: 'boolean',
    category: 'symptom_detail',
    diseaseWeights: { croup: 5, epiglottitis: 5, foreign_body_aspiration: 5, anaphylaxis: 3 },
    isRedFlag: true,
    redFlagSeverity: 'critical',
    redFlagMessage: 'Stridor indicates upper airway obstruction — emergency',
  },

  // ── CONSTITUTIONAL ──
  weight_loss_unintentional: {
    id: 'weight_loss_unintentional',
    label: 'Unintentional Weight Loss',
    type: 'boolean',
    category: 'constitutional',
    diseaseWeights: { tb_pulm: 6, malignancy: 5, hyperthyroidism: 3, diabetes_t1: 3, hiv: 4, depression: 2, ibd: 2 },
    isRedFlag: true,
    redFlagSeverity: 'moderate',
    redFlagMessage: 'Unintentional weight loss — consider TB, malignancy, HIV, hyperthyroidism',
  },
  night_sweats: {
    id: 'night_sweats',
    label: 'Night Sweats (Soaking)',
    type: 'boolean',
    category: 'constitutional',
    diseaseWeights: { tb_pulm: 6, lymphoma: 4, hiv: 3, infective_endocarditis: 2, brucellosis: 2, malignancy: 2 },
  },
  anorexia: {
    id: 'anorexia',
    label: 'Loss of Appetite',
    type: 'boolean',
    category: 'constitutional',
    diseaseWeights: { tb_pulm: 3, malignancy: 3, depression: 3, liver_disease: 2, ckd: 2, heart_failure_card: 1 },
  },
  fatigue_profound: {
    id: 'fatigue_profound',
    label: 'Profound/Unusual Fatigue',
    type: 'boolean',
    category: 'constitutional',
    diseaseWeights: { anemia: 4, depression: 3, hypothyroidism: 3, diabetes_t2: 2, ckd: 2, tb_pulm: 2, sle: 2, chronic_fatigue: 4 },
  },

  // ── TB-SPECIFIC ──
  tb_contact: {
    id: 'tb_contact',
    label: 'Known TB Contact',
    type: 'boolean',
    category: 'risk_factor',
    diseaseWeights: { tb_pulm: 7 },
    negativePredictorFor: [{ diseaseId: 'tb_pulm', reduction: 4 }],
  },
  previous_tb: {
    id: 'previous_tb',
    label: 'Previous TB Treatment',
    type: 'boolean',
    category: 'risk_factor',
    diseaseWeights: { tb_pulm: 3, bronchiectasis: 2 },
  },

  // ── HIV ──
  hiv_positive: {
    id: 'hiv_positive',
    label: 'Known HIV Positive',
    type: 'boolean',
    category: 'risk_factor',
    diseaseWeights: { tb_pulm: 4, pneumonia_pulm: 2, hiv: 5, meningitis: 2, malignancy: 1 },
  },

  // ── SMOKING ──
  smoking_current: {
    id: 'smoking_current',
    label: 'Current Smoker',
    type: 'boolean',
    category: 'risk_factor',
    diseaseWeights: { copd_pulm: 6, lung_cancer: 6, pneumonia_pulm: 2, chest_pain: 3, peptic_ulcer: 1 },
  },
  smoking_pack_years_gt_20: {
    id: 'smoking_pack_years_gt_20',
    label: 'Smoking History >20 Pack-Years',
    type: 'boolean',
    category: 'risk_factor',
    diseaseWeights: { lung_cancer: 7, copd_pulm: 5, chest_pain: 3 },
  },

  // ── ABDOMINAL ──
  abdominal_pain_rlq: {
    id: 'abdominal_pain_rlq',
    label: 'Pain Localized to Right Lower Quadrant',
    type: 'boolean',
    category: 'symptom_detail',
    diseaseWeights: { appendicitis: 6, ibd: 1, ectopic_pregnancy: 2, pid: 1 },
  },
  abdominal_pain_ruq: {
    id: 'abdominal_pain_ruq',
    label: 'Pain Localized to Right Upper Quadrant',
    type: 'boolean',
    category: 'symptom_detail',
    diseaseWeights: { cholecystitis: 6, peptic_ulcer: 2, hepatitis: 2, pancreatitis: 1 },
  },
  abdominal_pain_epigastric: {
    id: 'abdominal_pain_epigastric',
    label: 'Epigastric Pain',
    type: 'boolean',
    category: 'symptom_detail',
    diseaseWeights: { peptic_ulcer: 5, gerd: 4, pancreatitis: 3, gastritis: 4, cholecystitis: 1 },
  },
  peritonism: {
    id: 'peritonism',
    label: 'Peritoneal Signs (Guarding/Rigidity)',
    type: 'boolean',
    category: 'symptom_detail',
    diseaseWeights: { appendicitis: 5, cholecystitis: 3, bowel_obstruction: 3, pancreatitis: 3, typhoid: 3 },
    isRedFlag: true,
    redFlagSeverity: 'critical',
    redFlagMessage: 'Peritoneal signs — likely surgical abdomen, urgent assessment needed',
  },
  vomiting_blood: {
    id: 'vomiting_blood',
    label: 'Hematemesis (Vomiting Blood)',
    type: 'boolean',
    category: 'symptom_detail',
    diseaseWeights: { peptic_ulcer: 6, gerd: 1, esophageal_varices: 5, gastritis: 3, mallory_weiss: 3 },
    isRedFlag: true,
    redFlagSeverity: 'critical',
    redFlagMessage: 'Hematemesis — urgent upper GI source needed',
  },
  melena: {
    id: 'melena',
    label: 'Melena (Black Tarry Stools)',
    type: 'boolean',
    category: 'symptom_detail',
    diseaseWeights: { peptic_ulcer: 6, gastritis: 3, esophageal_varices: 3, malignancy: 1 },
    isRedFlag: true,
    redFlagSeverity: 'critical',
    redFlagMessage: 'Melena — upper GI bleeding source',
  },

  // ── HEADACHE ──
  headache_thunderclap: {
    id: 'headache_thunderclap',
    label: 'Thunderclap Headache (Sudden, Worst of Life)',
    type: 'boolean',
    category: 'symptom_detail',
    diseaseWeights: { subarachnoid_hemorrhage: 7, intracranial_hemorrhage: 5, meningitis: 2 },
    isRedFlag: true,
    redFlagSeverity: 'critical',
    redFlagMessage: 'Thunderclap headache — possible subarachnoid hemorrhage',
  },
  headache_neck_stiffness: {
    id: 'headache_neck_stiffness',
    label: 'Headache with Neck Stiffness',
    type: 'boolean',
    category: 'symptom_detail',
    diseaseWeights: { meningitis: 6, subarachnoid_hemorrhage: 3 },
    isRedFlag: true,
    redFlagSeverity: 'high',
    redFlagMessage: 'Headache + neck stiffness — possible meningitis',
  },
  headache_photophobia: {
    id: 'headache_photophobia',
    label: 'Photophobia (Sensitivity to Light)',
    type: 'boolean',
    category: 'symptom_detail',
    diseaseWeights: { meningitis: 4, migraine: 4, subarachnoid_hemorrhage: 2 },
  },

  // ── OCCUPATION EXPOSURES ──
  occupation_farmer: {
    id: 'occupation_farmer',
    label: 'Farmer',
    type: 'boolean',
    category: 'occupation',
    diseaseWeights: { brucellosis: 3, leptospirosis: 2, fungal_pneumonia: 2, tb_pulm: 1, heat_stroke: 1 },
  },
  occupation_miner: {
    id: 'occupation_miner',
    label: 'Miner',
    type: 'boolean',
    category: 'occupation',
    diseaseWeights: { tb_pulm: 4, silicosis: 5, copd_pulm: 3, lung_cancer: 2 },
  },
  occupation_healthcare: {
    id: 'occupation_healthcare',
    label: 'Healthcare Worker',
    type: 'boolean',
    category: 'occupation',
    diseaseWeights: { tb_pulm: 3, covid: 3, hepatitis_b: 2, hiv: 1 },
  },

  // ── FUNCTIONAL IMPACT ──
  unable_to_work: {
    id: 'unable_to_work',
    label: 'Unable to Work Due to Illness',
    type: 'boolean',
    category: 'social',
    diseaseWeights: {},
  },
  bedridden: {
    id: 'bedridden',
    label: 'Bedridden / Confined to Bed',
    type: 'boolean',
    category: 'social',
    diseaseWeights: {},
    isRedFlag: true,
    redFlagSeverity: 'high',
    redFlagMessage: 'Patient bedridden — indicates severe functional impairment',
  },
};

export function getFeature(id: string): HistoryFeature | undefined {
  return HISTORY_FEATURE_REGISTRY[id];
}

export function getFeaturesByCategory(category: string): HistoryFeature[] {
  return Object.values(HISTORY_FEATURE_REGISTRY).filter(f => f.category === category);
}

export function getRedFlags(): HistoryFeature[] {
  return Object.values(HISTORY_FEATURE_REGISTRY).filter(f => f.isRedFlag);
}

export function getFeaturesForDisease(diseaseId: string): { feature: HistoryFeature; weight: number }[] {
  const result: { feature: HistoryFeature; weight: number }[] = [];
  for (const f of Object.values(HISTORY_FEATURE_REGISTRY)) {
    const w = f.diseaseWeights[diseaseId];
    if (w) result.push({ feature: f, weight: w });
  }
  return result.sort((a, b) => b.weight - a.weight);
}

export default HISTORY_FEATURE_REGISTRY;
