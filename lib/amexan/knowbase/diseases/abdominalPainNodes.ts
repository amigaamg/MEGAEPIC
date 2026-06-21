// ═══════════════════════════════════════════════════════════════════════════════
// Abdominal Pain Disease Nodes — complete knowledge base
// Each node encodes pathophysiology, feature probabilities, and clinical reasoning.
// All LR values are based on published clinical evidence where available.
// ═══════════════════════════════════════════════════════════════════════════════

import type { DiseaseNode, FeatureRecord } from '../diseaseNode';
import { getFeature, getLrPlus, getLrMinus } from '../features/featureLibrary';

/** Helper: build a FeatureRecord with LR computed from sens/spec */
function feat(
  id: string,
  sens: number,
  spec: number,
  overrides?: Partial<FeatureRecord>
): FeatureRecord {
  const base = getFeature(id);
  return {
    ...base,
    sensitivity: sens,
    specificity: spec,
    LR_positive: getLrPlus({ ...base, sensitivity: sens, specificity: spec }),
    LR_negative: getLrMinus({ ...base, sensitivity: sens, specificity: spec }),
    ...overrides,
  };
}

/** Helper: shorthand for symptom feature */
function sym(id: string, sens: number, spec: number, overrides?: Partial<FeatureRecord>): FeatureRecord {
  return feat(id, sens, spec, { ...overrides, category: 'symptom' });
}

function rf(id: string, LRP: number, overrides?: Partial<FeatureRecord>): FeatureRecord {
  const base = getFeature(id);
  return { ...base, LR_positive: LRP, ...overrides, category: 'risk_factor' };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. ACUTE APPENDICITIS
// ═══════════════════════════════════════════════════════════════════════════════
export const acuteAppendicitis: DiseaseNode = {
  id: 'acute_appendicitis',
  name: 'Acute Appendicitis',
  icdCode: 'K35',
  system: 'surgical',
  organSystem: 'GI',
  acuity: 'urgent',
  acuityTier: 2,

  epidemiology: {
    ageMin: 1, ageMax: 90, agePeak: [10, 30],
    sexRisk: { male: 1.4, female: 1.0 },
    backgroundPrevalence: 0.07,
    riskFactors: [],
  },

  pathophysiology: {
    mechanism: 'Obstruction of the appendiceal lumen (faecolith, lymphoid hyperplasia, foreign body) leads to luminal distension, venous congestion, bacterial overgrowth, and progressive inflammation. As pressure rises, venous outflow is obstructed first, then arterial supply is compromised, leading to ischaemia, gangrene, and ultimately perforation if untreated. The visceral pain fibres (T10) initially refer pain to the periumbilical region; as inflammation reaches the serosa and parietal peritoneum, somatic pain localises to the right lower quadrant.',
    timelineStages: [
      { stageId: 1, label: 'Early inflammation (catarrhal)', typicalHoursFromOnset: [0, 12],
        dominantSymptoms: [sym('pain_onset', 0.85, 0.7), sym('pain_initial_location', 0.9, 0.65),
          sym('pain_character', 0.7, 0.6), sym('anorexia', 0.8, 0.5)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Vague dull ache or cramping', painLocationTypical: 'Periumbilical',
        painRadiationTypical: 'None' },
      { stageId: 2, label: 'Suppurative / phlegmonous', typicalHoursFromOnset: [12, 24],
        dominantSymptoms: [sym('pain_location_now', 0.85, 0.7), sym('pain_migration', 0.7, 0.85),
          sym('pain_worsening_factors', 0.6, 0.5), sym('nausea', 0.75, 0.5),
          sym('vomiting', 0.55, 0.6)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Sharp, constant, localised to RLQ', painLocationTypical: 'Right lower quadrant',
        painRadiationTypical: 'None' },
      { stageId: 3, label: 'Gangrenous', typicalHoursFromOnset: [24, 48],
        dominantSymptoms: [sym('fever', 0.8, 0.5), sym('peritonism', 0.8, 0.85),
          sym('guarding', 0.75, 0.8), sym('rebound_history', 0.65, 0.8), sym('vomiting_frequency', 0.5, 0.6)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Severe, constant, localised RLQ', painLocationTypical: 'Right lower quadrant',
        painRadiationTypical: 'May radiate to groin or hip' },
      { stageId: 4, label: 'Perforation', typicalHoursFromOnset: [48, 72],
        dominantSymptoms: [sym('rigidity', 0.6, 0.9), sym('peritonism', 0.9, 0.8),
          sym('fever_chills', 0.5, 0.85), sym('pain_location_now', 0.85, 0.6)],
        examFindings: [], severityTrajectory: 'rapidly_worsening',
        painCharacterTypical: 'Severe, diffuse, whole abdomen', painLocationTypical: 'Diffuse — whole abdomen',
        painRadiationTypical: 'None' },
    ],
    progressionRule: 'Untreated, advances from Stage 1→2 over 12h, 2→3 over 12–24h, 3→4 over 24h. May arrest at any stage. Perforation rate increases significantly after 48h.',
  },

  features: {
    symptoms: [
      sym('pain_initial_location', 0.85, 0.5, { stageRelevance: [1] }),
      sym('pain_migration', 0.7, 0.85, { stageRelevance: [1, 2] }),
      sym('pain_location_now', 0.9, 0.65, { stageRelevance: [2, 3] }),
      sym('pain_onset', 0.8, 0.5, { stageRelevance: [1] }),
      sym('pain_character', 0.7, 0.6, { stageRelevance: [1, 2] }),
      sym('pain_severity', 0.75, 0.4, { stageRelevance: [1, 2, 3] }),
      sym('pain_worsening_factors', 0.7, 0.5, { stageRelevance: [2, 3] }),
      sym('nausea', 0.75, 0.45, { stageRelevance: [1, 2] }),
      sym('vomiting', 0.55, 0.55, { stageRelevance: [2, 3] }),
      sym('vomiting_timing', 0.6, 0.65, { stageRelevance: [2] }),
      sym('anorexia', 0.8, 0.55, { stageRelevance: [1, 2] }),
      sym('fever', 0.7, 0.55, { stageRelevance: [2, 3] }),
      sym('bowel_habits', 0.4, 0.6, { stageRelevance: [2, 3] }),
      sym('peritonism', 0.8, 0.85, { stageRelevance: [3, 4] }),
      sym('rebound_history', 0.65, 0.8, { stageRelevance: [3, 4] }),
      sym('previous_similar_episodes', 0.15, 0.8, { stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('pain_location_now', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.05, label: 'No RLQ tenderness — appendicitis unlikely if truly absent' }),
      sym('anorexia', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.35 }),
    ],
    supporting: [
      sym('vaginal_discharge', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.5, label: 'Absence of vaginal discharge reduces PID likelihood' }),
      sym('vomiting_timing', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.5, label: 'Vomiting after pain onset supports appendicitis over gastroenteritis' }),
    ],
  },

  differential: {
    mimics: ['gastroenteritis', 'mesenteric_adenitis', 'ectopic_pregnancy', 'pid',
      'ovarian_torsion', 'ureteric_colic', 'meckel_diverticulitis', 'diverticulitis'],
    distinguishingFeatures: [
      { fromDiseaseId: 'gastroenteritis', featureIds: ['anorexia', 'vomiting_timing', 'pain_migration', 'fever'] },
      { fromDiseaseId: 'ectopic_pregnancy', featureIds: ['last_menstrual_period', 'vaginal_bleeding', 'syncope'] },
      { fromDiseaseId: 'pid', featureIds: ['vaginal_discharge', 'dyspareunia', 'fever_chills'] },
      { fromDiseaseId: 'ureteric_colic', featureIds: ['pain_character', 'hematuria', 'pain_radiation'] },
      { fromDiseaseId: 'ovarian_torsion', featureIds: ['pain_onset', 'nausea', 'previous_similar_episodes'] },
    ],
    neverCloseConditions: ['ectopic_pregnancy'],
  },

  complications: [
    { name: 'Perforation', warningFeatures: ['peritonism', 'rigidity', 'fever_chills', 'pain_location_now'],
      riskFactors: ['diabetes', 'steroid_use', 'age>60'], timeWindowHours: [48, 72], severityTier: 'critical',
      description: 'Untreated inflammation leads to full-thickness necrosis and perforation, causing generalized peritonitis, sepsis, and potentially death.' },
    { name: 'Appendiceal mass', warningFeatures: ['pain_location_now', 'fever'],
      riskFactors: ['delayed_presentation'], timeWindowHours: [72, 168], severityTier: 'moderate',
      description: 'Omentum and small bowel wall off the inflamed appendix, creating a palpable mass. Managed conservatively initially.' },
    { name: 'Appendiceal abscess', warningFeatures: ['fever_chills', 'peritonism'],
      riskFactors: ['delayed_presentation', 'diabetes'], timeWindowHours: [72, 120], severityTier: 'severe',
      description: 'Localised pus collection requiring drainage.' },
  ],

  clinicalScores: [{
    name: 'Alvarado (MANTRELS)',
    items: [
      { featureId: 'pain_migration', label: 'Migration of pain', pointsWhenPresent: 1 },
      { featureId: 'anorexia', label: 'Anorexia', pointsWhenPresent: 1 },
      { featureId: 'nausea', label: 'Nausea/vomiting', pointsWhenPresent: 1 },
      { featureId: 'pain_location_now', label: 'Tenderness in RLQ', pointsWhenPresent: 2 },
      { featureId: 'rebound_history', label: 'Rebound tenderness', pointsWhenPresent: 1 },
      { featureId: 'fever', label: 'Elevated temperature', pointsWhenPresent: 1 },
    ],
    interpretationThresholds: [
      { maxScore: 3, label: 'Low probability — observe, consider alternative' },
      { maxScore: 6, label: 'Moderate probability — watch or image' },
      { maxScore: 10, label: 'High probability — surgical consultation' },
    ],
    maxScore: 10,
  }],

  redFlagFeatureIds: ['peritonism', 'rigidity', 'fever_chills', 'syncope'],

  activationThreshold: {
    requiredPositiveFeatures: ['pain_initial_location'],
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 2. ACUTE CHOLECYSTITIS
// ═══════════════════════════════════════════════════════════════════════════════
export const acuteCholecystitis: DiseaseNode = {
  id: 'acute_cholecystitis',
  name: 'Acute Cholecystitis',
  icdCode: 'K81',
  system: 'surgical',
  organSystem: 'hepatobiliary',
  acuity: 'urgent',
  acuityTier: 2,

  epidemiology: {
    ageMin: 20, ageMax: 90, agePeak: [40, 70],
    sexRisk: { male: 0.5, female: 1.5 },
    backgroundPrevalence: 0.03,
    riskFactors: [
      { featureId: 'known_gallstones', label: 'Known gallstones', LR_positive: 8.0, prevalenceInDisease: 0.9 },
      { featureId: 'obesity', label: 'Obesity', LR_positive: 2.5, prevalenceInDisease: 0.5 },
      { featureId: 'female_40s', label: 'Female, age 40+', LR_positive: 2.0, prevalenceInDisease: 0.6 },
    ],
  },

  pathophysiology: {
    mechanism: 'Cystic duct obstruction by a gallstone leads to gallbladder distension, impaired venous and lymphatic drainage, mucosal ischaemia, and bacterial translocation. The gallbladder becomes inflamed, oedematous, and may become gangrenous or perforate if untreated. Pain is referred to the right upper quadrant and may radiate to the right shoulder (phrenic nerve — C3–5).',
    timelineStages: [
      { stageId: 1, label: 'Biliary colic', typicalHoursFromOnset: [0, 6],
        dominantSymptoms: [sym('pain_onset', 0.6, 0.5), sym('pain_initial_location', 0.85, 0.6),
          sym('pain_character', 0.6, 0.5), sym('pain_radiation', 0.55, 0.8)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Severe, constant, right upper quadrant', painLocationTypical: 'Right upper quadrant',
        painRadiationTypical: 'Right shoulder or interscapular' },
      { stageId: 2, label: 'Acute inflammation', typicalHoursFromOnset: [6, 48],
        dominantSymptoms: [sym('pain_location_now', 0.85, 0.65), sym('fever', 0.75, 0.5),
          sym('nausea', 0.7, 0.5), sym('vomiting', 0.5, 0.55), sym('anorexia', 0.7, 0.5)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Constant, severe, RUQ', painLocationTypical: 'Right upper quadrant',
        painRadiationTypical: 'Right shoulder' },
      { stageId: 3, label: 'Gangrene / empyema', typicalHoursFromOnset: [48, 96],
        dominantSymptoms: [sym('fever_chills', 0.6, 0.85), sym('peritonism', 0.7, 0.8),
          sym('jaundice', 0.3, 0.9)],
        examFindings: [], severityTrajectory: 'rapidly_worsening',
        painCharacterTypical: 'Severe, constant, RUQ ± diffuse', painLocationTypical: 'Right upper quadrant',
        painRadiationTypical: 'Right shoulder' },
    ],
    progressionRule: 'May present initially as biliary colic (resolves in hours). If obstruction persists, progresses to acute cholecystitis over 6–24h. Gangrene ± perforation after 48–96h of unrelieved obstruction.',
  },

  features: {
    symptoms: [
      sym('pain_initial_location', 0.85, 0.55, { stageRelevance: [1] }),
      sym('pain_location_now', 0.9, 0.65, { stageRelevance: [2, 3] }),
      sym('pain_onset', 0.6, 0.5, { stageRelevance: [1] }),
      sym('pain_character', 0.6, 0.5, { stageRelevance: [1, 2] }),
      sym('pain_radiation', 0.55, 0.85, { stageRelevance: [1, 2] }),
      sym('pain_worsening_factors', 0.6, 0.5, { stageRelevance: [2] }),
      sym('nausea', 0.7, 0.45, { stageRelevance: [1, 2] }),
      sym('vomiting', 0.5, 0.55, { stageRelevance: [2] }),
      sym('anorexia', 0.7, 0.5, { stageRelevance: [1, 2] }),
      sym('fever', 0.75, 0.5, { stageRelevance: [2, 3] }),
      sym('fever_chills', 0.6, 0.85, { stageRelevance: [3] }),
      sym('jaundice', 0.3, 0.9, { stageRelevance: [2, 3] }),
      sym('previous_similar_episodes', 0.5, 0.7, { stageRelevance: [1] }),
      sym('belching', 0.4, 0.55, { stageRelevance: [1] }),
      sym('heartburn', 0.3, 0.6, { stageRelevance: [1] }),
      sym('bowel_habits', 0.3, 0.6, { stageRelevance: [2] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('pain_radiation', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.2, label: 'No RUQ pain or radiation to right shoulder' }),
    ],
    supporting: [
      sym('pain_initial_location', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.3, label: 'Periumbilical onset supports appendicitis over cholecystitis' }),
    ],
  },

  differential: {
    mimics: ['pancreatitis', 'perforated_ulcer', 'hepatitis', 'cholangitis',
      'appendicitis', 'right_basal_pneumonia'],
    distinguishingFeatures: [
      { fromDiseaseId: 'pancreatitis', featureIds: ['pain_radiation', 'alcohol_use', 'pain_character'] },
      { fromDiseaseId: 'perforated_ulcer', featureIds: ['pain_onset', 'pain_migration', 'peritonism'] },
      { fromDiseaseId: 'appendicitis', featureIds: ['pain_initial_location', 'pain_migration', 'pain_location_now'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Gangrenous cholecystitis', warningFeatures: ['fever_chills', 'peritonism'],
      riskFactors: ['diabetes', 'age>60'], timeWindowHours: [48, 96], severityTier: 'critical',
      description: 'Full-thickness gallbladder necrosis requiring emergency cholecystectomy.' },
    { name: 'Gallbladder perforation', warningFeatures: ['peritonism', 'rigidity', 'syncope'],
      riskFactors: ['diabetes', 'steroid_use'], timeWindowHours: [72, 120], severityTier: 'critical',
      description: 'Free perforation leads to generalized biliary peritonitis — surgical emergency.' },
    { name: 'Ascending cholangitis', warningFeatures: ['jaundice', 'fever_chills'],
      riskFactors: ['known_gallstones'], timeWindowHours: [24, 72], severityTier: 'critical',
      description: 'Common bile duct obstruction leads to biliary sepsis — Charcot\'s triad (pain, fever, jaundice).' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['peritonism', 'rigidity', 'fever_chills', 'jaundice', 'syncope'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 3. ACUTE PANCREATITIS
// ═══════════════════════════════════════════════════════════════════════════════
export const acutePancreatitis: DiseaseNode = {
  id: 'acute_pancreatitis',
  name: 'Acute Pancreatitis',
  icdCode: 'K85',
  system: 'medical',
  organSystem: 'pancreatic',
  acuity: 'urgent',
  acuityTier: 2,

  epidemiology: {
    ageMin: 15, ageMax: 90, agePeak: [40, 70],
    sexRisk: { male: 1.2, female: 1.0 },
    backgroundPrevalence: 0.02,
    riskFactors: [
      { featureId: 'known_gallstones', label: 'Gallstones', LR_positive: 4.0, prevalenceInDisease: 0.4 },
      { featureId: 'alcohol_use', label: 'Heavy alcohol use', LR_positive: 3.5, prevalenceInDisease: 0.35 },
      { featureId: 'smoking', label: 'Smoking', LR_positive: 1.5, prevalenceInDisease: 0.3 },
    ],
  },

  pathophysiology: {
    mechanism: 'Premature activation of trypsinogen to trypsin within pancreatic acinar cells triggers autodigestion of the pancreas. This releases inflammatory mediators that cause local inflammation, fat necrosis, and — in severe cases — systemic inflammatory response syndrome (SIRS), multi-organ failure, and pancreatic necrosis. The retroperitoneal location of the pancreas explains the characteristic epigastric pain radiating to the back.',
    timelineStages: [
      { stageId: 1, label: 'Early inflammation', typicalHoursFromOnset: [0, 12],
        dominantSymptoms: [sym('pain_onset', 0.8, 0.5), sym('pain_initial_location', 0.85, 0.5),
          sym('pain_character', 0.7, 0.55), sym('pain_radiation', 0.7, 0.85)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Severe, boring, epigastric', painLocationTypical: 'Epigastrium',
        painRadiationTypical: 'Straight through to the back' },
      { stageId: 2, label: 'Established pancreatitis', typicalHoursFromOnset: [12, 48],
        dominantSymptoms: [sym('pain_location_now', 0.85, 0.6), sym('nausea', 0.85, 0.45),
          sym('vomiting', 0.8, 0.5), sym('anorexia', 0.8, 0.5), sym('fever', 0.6, 0.5)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Severe, constant, epigastric', painLocationTypical: 'Epigastrium ± diffuse',
        painRadiationTypical: 'To back' },
      { stageId: 3, label: 'Severe / necrotising', typicalHoursFromOnset: [48, 120],
        dominantSymptoms: [sym('fever_chills', 0.5, 0.85), sym('peritonism', 0.5, 0.8),
          sym('abdominal_distension', 0.6, 0.65), sym('dyspnea', 0.4, 0.7)],
        examFindings: [], severityTrajectory: 'rapidly_worsening',
        painCharacterTypical: 'Excruciating, diffuse', painLocationTypical: 'Generalised',
        painRadiationTypical: 'To back' },
    ],
    progressionRule: 'Mild (oedematous) pancreatitis resolves spontaneously. Severe (necrotising) progresses over 48–72h with SIRS, organ failure, and pancreatic necrosis.',
  },

  features: {
    symptoms: [
      sym('pain_initial_location', 0.85, 0.55, { stageRelevance: [1] }),
      sym('pain_location_now', 0.85, 0.6, { stageRelevance: [2, 3] }),
      sym('pain_onset', 0.8, 0.5, { stageRelevance: [1] }),
      sym('pain_character', 0.7, 0.55, { stageRelevance: [1, 2] }),
      sym('pain_radiation', 0.7, 0.85, { stageRelevance: [1, 2] }),
      sym('pain_severity', 0.85, 0.5, { stageRelevance: [1, 2, 3] }),
      sym('pain_worsening_factors', 0.6, 0.5, { stageRelevance: [2] }),
      sym('nausea', 0.85, 0.4, { stageRelevance: [1, 2] }),
      sym('vomiting', 0.8, 0.5, { stageRelevance: [1, 2] }),
      sym('vomiting_timing', 0.6, 0.6, { stageRelevance: [2] }),
      sym('anorexia', 0.8, 0.5, { stageRelevance: [1, 2] }),
      sym('fever', 0.6, 0.5, { stageRelevance: [2, 3] }),
      sym('abdominal_distension', 0.6, 0.65, { stageRelevance: [2, 3] }),
      sym('previous_similar_episodes', 0.3, 0.7, { stageRelevance: [1] }),
      sym('jaundice', 0.2, 0.9, { stageRelevance: [2] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('pain_radiation', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.15, label: 'No radiation to back — pancreatitis less likely' }),
    ],
    supporting: [
      sym('pain_character', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.4, label: 'Colicky pain suggests obstruction, not pancreatitis' }),
    ],
  },

  differential: {
    mimics: ['cholecystitis', 'perforated_ulcer', 'mi', 'pancreatic_cancer',
      'gastritis', 'biliary_colic'],
    distinguishingFeatures: [
      { fromDiseaseId: 'cholecystitis', featureIds: ['pain_radiation', 'pain_location_now'] },
      { fromDiseaseId: 'perforated_ulcer', featureIds: ['pain_onset', 'peritonism', 'pain_migration'] },
      { fromDiseaseId: 'mi', featureIds: ['chest_pain', 'dyspnea', 'htn_cad'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Pancreatic necrosis', warningFeatures: ['fever_chills', 'dyspnea', 'peritonism'],
      riskFactors: ['alcohol_use', 'age>60', 'obesity'], timeWindowHours: [48, 120], severityTier: 'critical',
      description: 'Non-viable pancreatic tissue requiring debridement — high mortality.' },
    { name: 'Pseudocyst', warningFeatures: ['abdominal_distension', 'pain_location_now'],
      riskFactors: [], timeWindowHours: [168, 1008], severityTier: 'moderate',
      description: 'Fluid collection with fibrous wall — may resolve or require drainage.' },
    { name: 'Multi-organ failure', warningFeatures: ['dyspnea', 'syncope'],
      riskFactors: ['age>60', 'obesity', 'comorbidities'], timeWindowHours: [24, 72], severityTier: 'critical',
      description: 'SIRS-driven organ failure — ICU-level care required.' },
  ],

  clinicalScores: [{
    name: 'PANC-3 (Pancreatitis Severity)',
    items: [
      { featureId: 'age', label: 'Age >55 years', pointsWhenPresent: 1 },
      { featureId: 'obesity', label: 'BMI >30 (obesity)', pointsWhenPresent: 1 },
      { featureId: 'previous_similar_episodes', label: 'Previous pancreatitis', pointsWhenPresent: 1 },
    ],
    interpretationThresholds: [
      { maxScore: 1, label: 'Low risk of severe pancreatitis' },
      { maxScore: 2, label: 'Moderate risk — monitor closely' },
      { maxScore: 3, label: 'High risk of severe pancreatitis — ICU' },
    ],
    maxScore: 3,
  }],
  redFlagFeatureIds: ['peritonism', 'syncope', 'dyspnea', 'fever_chills'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 4. ECTOPIC PREGNANCY
// ═══════════════════════════════════════════════════════════════════════════════
export const ectopicPregnancy: DiseaseNode = {
  id: 'ectopic_pregnancy',
  name: 'Ectopic Pregnancy',
  icdCode: 'O00',
  system: 'obstetric',
  organSystem: 'reproductive_female',
  acuity: 'immediately_life_threatening',
  acuityTier: 1,

  epidemiology: {
    ageMin: 15, ageMax: 45, agePeak: [25, 35],
    sexRisk: { male: 0, female: 1.0 },
    backgroundPrevalence: 0.02,
    riskFactors: [
      { featureId: 'pid_history', label: 'Previous PID', LR_positive: 3.0, prevalenceInDisease: 0.3 },
      { featureId: 'prior_ectopic', label: 'Prior ectopic pregnancy', LR_positive: 8.0, prevalenceInDisease: 0.15 },
      { featureId: 'tubal_surgery', label: 'Tubal surgery', LR_positive: 4.0, prevalenceInDisease: 0.1 },
      { featureId: 'smoking', label: 'Smoking', LR_positive: 2.0, prevalenceInDisease: 0.4 },
    ],
  },

  pathophysiology: {
    mechanism: 'A fertilised ovum implants outside the uterine cavity, most commonly in the fallopian tube (>95%). The trophoblast invades the tubal wall, causing progressive distension. Eventually the tube cannot accommodate the growing pregnancy, leading to tubal abortion, rupture, or haemorrhage. Rupture causes massive intra-abdominal bleeding and is a life-threatening emergency. Pain is typically suprapubic or in one iliac fossa.',
    timelineStages: [
      { stageId: 1, label: 'Unruptured', typicalHoursFromOnset: [0, 168],
        dominantSymptoms: [sym('pain_initial_location', 0.7, 0.5), sym('pain_character', 0.5, 0.5),
          sym('last_menstrual_period', 0.85, 0.8), sym('vaginal_bleeding', 0.6, 0.85)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Mild, dull, unilateral', painLocationTypical: 'Lower abdomen (unilateral)',
        painRadiationTypical: 'None' },
      { stageId: 2, label: 'Rupture / haemorrhage', typicalHoursFromOnset: [48, 168],
        dominantSymptoms: [sym('pain_onset', 0.8, 0.6), sym('pain_location_now', 0.7, 0.55),
          sym('syncope', 0.6, 0.9), sym('peritonism', 0.6, 0.8)],
        examFindings: [], severityTrajectory: 'rapidly_worsening',
        painCharacterTypical: 'Sudden, severe, tearing', painLocationTypical: 'Lower abdomen, may be diffuse',
        painRadiationTypical: 'May radiate to shoulder (diaphragmatic irritation)' },
    ],
    progressionRule: 'Unruptured ectopic may be asymptomatic for weeks. Rupture typically occurs at 6–8 weeks gestation. Once ruptured, haemorrhage is rapid and life-threatening.',
  },

  features: {
    symptoms: [
      sym('pain_initial_location', 0.7, 0.5, { stageRelevance: [1] }),
      sym('pain_location_now', 0.7, 0.55, { stageRelevance: [2] }),
      sym('pain_onset', 0.8, 0.6, { stageRelevance: [2] }),
      sym('pain_character', 0.5, 0.5, { stageRelevance: [1, 2] }),
      sym('last_menstrual_period', 0.85, 0.8, { stageRelevance: [1] }),
      sym('vaginal_bleeding', 0.6, 0.85, { stageRelevance: [1, 2] }),
      sym('syncope', 0.6, 0.9, { stageRelevance: [2] }),
      sym('nausea', 0.4, 0.5, { stageRelevance: [1] }),
      sym('peritonism', 0.6, 0.8, { stageRelevance: [2] }),
      sym('pain_radiation', 0.3, 0.85, { stageRelevance: [2] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('last_menstrual_period', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.05, label: 'Normal LMP and no missed period — ectopic very unlikely' }),
    ],
    supporting: [
      sym('vaginal_discharge', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.5, label: 'Absence of discharge makes PID less likely' }),
    ],
  },

  differential: {
    mimics: ['appendicitis', 'ovarian_torsion', 'pid', 'ovarian_cyst_rupture', 'miscarriage'],
    distinguishingFeatures: [
      { fromDiseaseId: 'appendicitis', featureIds: ['last_menstrual_period', 'vaginal_bleeding', 'syncope', 'pain_location_now'] },
      { fromDiseaseId: 'pid', featureIds: ['last_menstrual_period', 'vaginal_discharge', 'fever'] },
      { fromDiseaseId: 'ovarian_torsion', featureIds: ['pain_onset', 'nausea', 'previous_similar_episodes'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Tubal rupture', warningFeatures: ['syncope', 'peritonism', 'pain_onset'],
      riskFactors: [], timeWindowHours: [48, 168], severityTier: 'critical',
      description: 'Rupture causes massive haemoperitoneum — immediate surgical intervention required.' },
    { name: 'Haemorrhagic shock', warningFeatures: ['syncope', 'dyspnea'],
      riskFactors: ['anticoagulant_use'], timeWindowHours: [0, 24], severityTier: 'critical',
      description: 'Life-threatening blood loss requiring fluid resuscitation and emergency surgery.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['syncope', 'peritonism', 'vaginal_bleeding'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 5. INTESTINAL OBSTRUCTION
// ═══════════════════════════════════════════════════════════════════════════════
export const intestinalObstruction: DiseaseNode = {
  id: 'intestinal_obstruction',
  name: 'Intestinal Obstruction',
  icdCode: 'K56',
  system: 'surgical',
  organSystem: 'GI',
  acuity: 'urgent',
  acuityTier: 2,

  epidemiology: {
    ageMin: 1, ageMax: 90, agePeak: [50, 80],
    sexRisk: { male: 1.0, female: 1.0 },
    backgroundPrevalence: 0.02,
    riskFactors: [
      { featureId: 'prior_abdominal_surgery', label: 'Prior abdominal surgery', LR_positive: 5.0, prevalenceInDisease: 0.6 },
      { featureId: 'known_hernia', label: 'Known hernia', LR_positive: 4.0, prevalenceInDisease: 0.2 },
    ],
  },

  pathophysiology: {
    mechanism: 'Mechanical blockage of the intestinal lumen (adhesions, hernia, tumour, volvulus) prevents passage of gas and stool. Proximal bowel distends with gas and fluid. If unrelieved, intramural pressure exceeds venous pressure, causing congestion, ischaemia, and ultimately perforation. Pain is colicky (wavelike) due to hyperperistalsis proximal to the obstruction.',
    timelineStages: [
      { stageId: 1, label: 'Early obstruction', typicalHoursFromOnset: [0, 12],
        dominantSymptoms: [sym('pain_onset', 0.6, 0.5), sym('pain_character', 0.8, 0.6),
          sym('pain_initial_location', 0.6, 0.5), sym('bowel_habits', 0.7, 0.65)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Colicky — comes in waves', painLocationTypical: 'Periumbilical or diffuse',
        painRadiationTypical: 'None' },
      { stageId: 2, label: 'Established obstruction', typicalHoursFromOnset: [12, 48],
        dominantSymptoms: [sym('pain_location_now', 0.7, 0.5), sym('obstipation', 0.85, 0.85),
          sym('abdominal_distension', 0.75, 0.7), sym('vomiting', 0.8, 0.5),
          sym('vomiting_description', 0.5, 0.85)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Colicky, becoming constant as ischaemia develops',
        painLocationTypical: 'Diffuse — whole abdomen', painRadiationTypical: 'None' },
      { stageId: 3, label: 'Closed-loop / strangulation', typicalHoursFromOnset: [48, 72],
        dominantSymptoms: [sym('peritonism', 0.8, 0.85), sym('fever_chills', 0.5, 0.85),
          sym('vomiting_description', 0.6, 0.85)],
        examFindings: [], severityTrajectory: 'rapidly_worsening',
        painCharacterTypical: 'Severe, constant, diffuse', painLocationTypical: 'Diffuse',
        painRadiationTypical: 'None' },
    ],
    progressionRule: 'Simple obstruction may resolve with NG decompression. Closed-loop or strangulated obstruction rapidly (6–12h) progresses to ischaemia, perforation, and peritonitis.',
  },

  features: {
    symptoms: [
      sym('pain_onset', 0.6, 0.5, { stageRelevance: [1] }),
      sym('pain_character', 0.8, 0.6, { stageRelevance: [1, 2] }),
      sym('pain_initial_location', 0.6, 0.5, { stageRelevance: [1] }),
      sym('pain_location_now', 0.7, 0.5, { stageRelevance: [2, 3] }),
      sym('pain_severity', 0.7, 0.4, { stageRelevance: [1, 2, 3] }),
      sym('bowel_habits', 0.7, 0.65, { stageRelevance: [1, 2] }),
      sym('obstipation', 0.85, 0.85, { stageRelevance: [2, 3] }),
      sym('abdominal_distension', 0.75, 0.7, { stageRelevance: [2, 3] }),
      sym('vomiting', 0.8, 0.5, { stageRelevance: [2, 3] }),
      sym('vomiting_timing', 0.6, 0.6, { stageRelevance: [2] }),
      sym('vomiting_description', 0.5, 0.85, { stageRelevance: [2, 3] }),
      sym('vomiting_frequency', 0.5, 0.6, { stageRelevance: [2, 3] }),
      sym('previous_similar_episodes', 0.3, 0.7, { stageRelevance: [1] }),
      sym('peritonism', 0.8, 0.85, { stageRelevance: [3] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('obstipation', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.05, label: 'Passing gas and stool — complete obstruction unlikely' }),
      sym('bowel_habits', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.2, label: 'Normal bowel movements — obstruction unlikely' }),
    ],
    supporting: [
      sym('diarrhea', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.3, label: 'No diarrhoea — obstruction more likely than gastroenteritis' }),
    ],
  },

  differential: {
    mimics: ['gastroenteritis', 'constipation', 'pancreatitis', 'cholecystitis', 'perforated_ulcer'],
    distinguishingFeatures: [
      { fromDiseaseId: 'gastroenteritis', featureIds: ['obstipation', 'vomiting_timing', 'abdominal_distension'] },
      { fromDiseaseId: 'constipation', featureIds: ['obstipation', 'vomiting', 'pain_character'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Strangulation', warningFeatures: ['peritonism', 'fever_chills', 'pain_character'],
      riskFactors: ['age>60'], timeWindowHours: [24, 48], severityTier: 'critical',
      description: 'Bowel wall ischaemia from closed-loop obstruction — emergency surgery required.' },
    { name: 'Perforation', warningFeatures: ['peritonism', 'rigidity'],
      riskFactors: [], timeWindowHours: [48, 72], severityTier: 'critical',
      description: 'Full-thickness bowel necrosis leading to faecal peritonitis.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['peritonism', 'rigidity', 'fever_chills', 'syncope'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 6. PERFORATED PEPTIC ULCER
// ═══════════════════════════════════════════════════════════════════════════════
export const perforatedPepticUlcer: DiseaseNode = {
  id: 'perforated_peptic_ulcer',
  name: 'Perforated Peptic Ulcer',
  icdCode: 'K25.1',
  system: 'surgical',
  organSystem: 'GI',
  acuity: 'immediately_life_threatening',
  acuityTier: 1,

  epidemiology: {
    ageMin: 20, ageMax: 90, agePeak: [40, 70],
    sexRisk: { male: 1.5, female: 1.0 },
    backgroundPrevalence: 0.01,
    riskFactors: [
      { featureId: 'nsaid_use', label: 'NSAID use', LR_positive: 5.0, prevalenceInDisease: 0.5 },
      { featureId: 'smoking', label: 'Smoking', LR_positive: 2.0, prevalenceInDisease: 0.4 },
      { featureId: 'alcohol_use', label: 'Alcohol', LR_positive: 1.5, prevalenceInDisease: 0.3 },
    ],
  },

  pathophysiology: {
    mechanism: 'A full-thickness ulcer (gastric or duodenal) erodes through the bowel wall, releasing air, gastric contents, and bacteria into the peritoneal cavity. This causes sudden severe epigastric pain, generalised peritonitis, and — if untreated — septic shock. The hallmark is board-like rigidity from abdominal muscle spasm.',
    timelineStages: [
      { stageId: 1, label: 'Immediate perforation', typicalHoursFromOnset: [0, 2],
        dominantSymptoms: [sym('pain_onset', 0.9, 0.65), sym('pain_initial_location', 0.85, 0.5),
          sym('pain_character', 0.7, 0.6), sym('pain_migration', 0.7, 0.8)],
        examFindings: [], severityTrajectory: 'rapidly_worsening',
        painCharacterTypical: 'Excruciating, tearing', painLocationTypical: 'Epigastrium initially',
        painRadiationTypical: 'May radiate to shoulders' },
      { stageId: 2, label: 'Generalised peritonitis', typicalHoursFromOnset: [2, 12],
        dominantSymptoms: [sym('pain_location_now', 0.9, 0.6), sym('peritonism', 0.95, 0.85),
          sym('rigidity', 0.85, 0.9), sym('nausea', 0.7, 0.5), sym('vomiting', 0.5, 0.55)],
        examFindings: [], severityTrajectory: 'rapidly_worsening',
        painCharacterTypical: 'Severe, diffuse', painLocationTypical: 'Generalised — whole abdomen',
        painRadiationTypical: 'Shoulders (diaphragmatic irritation)' },
    ],
    progressionRule: 'Catastrophic onset. Peritonitis develops within hours. Mortality increases sharply after 12h.',
  },

  features: {
    symptoms: [
      sym('pain_onset', 0.9, 0.65, { stageRelevance: [1] }),
      sym('pain_initial_location', 0.85, 0.5, { stageRelevance: [1] }),
      sym('pain_location_now', 0.9, 0.6, { stageRelevance: [2] }),
      sym('pain_migration', 0.7, 0.8, { stageRelevance: [1, 2] }),
      sym('pain_character', 0.7, 0.6, { stageRelevance: [1] }),
      sym('pain_severity', 0.9, 0.4, { stageRelevance: [1, 2] }),
      sym('pain_radiation', 0.4, 0.85, { stageRelevance: [1, 2] }),
      sym('peritonism', 0.95, 0.85, { stageRelevance: [2] }),
      sym('rigidity', 0.85, 0.9, { stageRelevance: [2] }),
      sym('nausea', 0.7, 0.5, { stageRelevance: [1, 2] }),
      sym('vomiting', 0.5, 0.55, { stageRelevance: [2] }),
      sym('bowel_habits', 0.3, 0.6, { stageRelevance: [2] }),
      sym('syncope', 0.4, 0.9, { stageRelevance: [2] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('pain_onset', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.05, label: 'Gradual onset makes perforated ulcer very unlikely' }),
      sym('peritonism', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.02 }),
    ],
    supporting: [
      sym('pain_migration', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.3, label: 'No migration pattern — alternative diagnosis more likely' }),
    ],
  },

  differential: {
    mimics: ['acute_pancreatitis', 'mi', 'aaa_rupture', 'mesenteric_ischaemia', 'perforated_diverticulitis'],
    distinguishingFeatures: [
      { fromDiseaseId: 'acute_pancreatitis', featureIds: ['pain_onset', 'pain_radiation', 'pain_migration'] },
      { fromDiseaseId: 'aaa_rupture', featureIds: ['syncope', 'htn_cad', 'pain_location_now'] },
      { fromDiseaseId: 'mi', featureIds: ['chest_pain', 'dyspnea', 'htn_cad'] },
    ],
    neverCloseConditions: ['aaa_rupture'],
  },

  complications: [
    { name: 'Septic shock', warningFeatures: ['syncope', 'fever_chills', 'peritonism'],
      riskFactors: ['age>60', 'diabetes', 'steroid_use'], timeWindowHours: [6, 24], severityTier: 'critical',
      description: 'Systemic infection from peritoneal contamination — ICU-level care.' },
    { name: 'Subphrenic abscess', warningFeatures: ['fever', 'pain_radiation'],
      riskFactors: ['delayed_treatment'], timeWindowHours: [72, 336], severityTier: 'severe',
      description: 'Localised collection beneath diaphragm requiring drainage.' },
  ],

  clinicalScores: [{
    name: 'Glasgow-Blatchford Score',
    items: [
      { featureId: 'syncope', label: 'Syncope / altered mentation', pointsWhenPresent: 2 },
      { featureId: 'melena', label: 'Melena', pointsWhenPresent: 1 },
      { featureId: 'htn_cad', label: 'Cardiac failure', pointsWhenPresent: 2 },
      { featureId: 'jaundice', label: 'Hepatic disease', pointsWhenPresent: 2 },
    ],
    interpretationThresholds: [
      { maxScore: 1, label: 'Low risk — consider discharge' },
      { maxScore: 3, label: 'Moderate risk — endoscopy within 24h' },
      { maxScore: 6, label: 'High risk — urgent endoscopy' },
    ],
    maxScore: 6,
  }],
  redFlagFeatureIds: ['peritonism', 'rigidity', 'syncope', 'pain_onset'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 7. URETERIC COLIC / NEPHROLITHIASIS
// ═══════════════════════════════════════════════════════════════════════════════
export const uretericColic: DiseaseNode = {
  id: 'ureteric_colic',
  name: 'Ureteric Colic / Nephrolithiasis',
  icdCode: 'N20',
  system: 'urological',
  organSystem: 'renal',
  acuity: 'semi_urgent',
  acuityTier: 3,

  epidemiology: {
    ageMin: 15, ageMax: 80, agePeak: [30, 60],
    sexRisk: { male: 1.5, female: 1.0 },
    backgroundPrevalence: 0.03,
    riskFactors: [
      { featureId: 'previous_kidney_stones', label: 'Previous kidney stones', LR_positive: 6.0, prevalenceInDisease: 0.5 },
    ],
  },

  pathophysiology: {
    mechanism: 'A stone obstructing the ureter causes acute dilation of the renal pelvis and ureter, stimulating stretch receptors and producing intense, colicky pain. The pain follows the course of the ureter from the costovertebral angle (flank) around to the groin/genitalia. Associated nausea and vomiting are common due to the vagal response.',
    timelineStages: [
      { stageId: 1, label: 'Acute colic', typicalHoursFromOnset: [0, 6],
        dominantSymptoms: [sym('pain_onset', 0.7, 0.55), sym('pain_character', 0.85, 0.7),
          sym('pain_initial_location', 0.85, 0.55), sym('pain_radiation', 0.75, 0.85)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Colicky — waves of excruciating pain', painLocationTypical: 'Flank or back',
        painRadiationTypical: 'Flank → groin/genitalia' },
      { stageId: 2, label: 'Persistent obstruction', typicalHoursFromOnset: [6, 48],
        dominantSymptoms: [sym('pain_location_now', 0.7, 0.55), sym('nausea', 0.7, 0.5),
          sym('vomiting', 0.5, 0.55), sym('hematuria', 0.5, 0.9), sym('dysuria', 0.3, 0.75)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Colicky ± constant', painLocationTypical: 'Flank → groin',
        painRadiationTypical: 'To groin/testis/labia' },
    ],
    progressionRule: 'Pain waves last 20–60 minutes. Spontaneous passage may occur at any time. Complete obstruction >24h risks renal damage.',
  },

  features: {
    symptoms: [
      sym('pain_onset', 0.7, 0.55, { stageRelevance: [1] }),
      sym('pain_character', 0.85, 0.7, { stageRelevance: [1, 2] }),
      sym('pain_initial_location', 0.85, 0.55, { stageRelevance: [1] }),
      sym('pain_location_now', 0.7, 0.55, { stageRelevance: [2] }),
      sym('pain_radiation', 0.75, 0.85, { stageRelevance: [1, 2] }),
      sym('pain_severity', 0.9, 0.5, { stageRelevance: [1, 2] }),
      sym('pain_worsening_factors', 0.3, 0.6, { stageRelevance: [2] }),
      sym('flank_pain', 0.85, 0.8, { stageRelevance: [1, 2] }),
      sym('hematuria', 0.5, 0.9, { stageRelevance: [2] }),
      sym('dysuria', 0.3, 0.75, { stageRelevance: [2] }),
      sym('urinary_frequency', 0.4, 0.7, { stageRelevance: [2] }),
      sym('nausea', 0.7, 0.5, { stageRelevance: [1, 2] }),
      sym('vomiting', 0.5, 0.55, { stageRelevance: [2] }),
      sym('previous_similar_episodes', 0.5, 0.75, { stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('pain_character', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.1, label: 'Non-colicky, constant pain makes ureteric colic unlikely' }),
      sym('hematuria', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.15, label: 'No haematuria — stone less likely but not excluded' }),
    ],
    supporting: [
      sym('pain_migration', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.5, label: 'No migration pattern — not appendicitis' }),
    ],
  },

  differential: {
    mimics: ['appendicitis', 'pid', 'ectopic_pregnancy', 'pancreatitis', 'pyelonephritis', 'diverticulitis'],
    distinguishingFeatures: [
      { fromDiseaseId: 'appendicitis', featureIds: ['pain_character', 'pain_radiation', 'hematuria', 'pain_migration'] },
      { fromDiseaseId: 'pyelonephritis', featureIds: ['fever_chills', 'dysuria', 'urinary_frequency'] },
      { fromDiseaseId: 'diverticulitis', featureIds: ['bowel_habits', 'pain_location_now', 'fever'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Obstructive uropathy', warningFeatures: ['urinary_retention', 'anuria'],
      riskFactors: ['solitary_kidney'], timeWindowHours: [24, 72], severityTier: 'severe',
      description: 'Complete ureteric obstruction causing hydronephrosis and renal impairment.' },
    { name: 'Infected hydronephrosis', warningFeatures: ['fever_chills', 'flank_pain'],
      riskFactors: ['diabetes'], timeWindowHours: [24, 72], severityTier: 'critical',
      description: 'Obstruction with superimposed infection — urosepsis risk.' },
  ],

  clinicalScores: [{
    name: 'STONE Score',
    items: [
      { featureId: 'sex', label: 'Male sex', pointsWhenPresent: 2 },
      { featureId: 'pain_character', label: 'Colicky pain', pointsWhenPresent: 2 },
      { featureId: 'pain_radiation', label: 'Radiation to groin', pointsWhenPresent: 2 },
      { featureId: 'nausea', label: 'Nausea/vomiting', pointsWhenPresent: 1 },
      { featureId: 'hematuria', label: 'Haematuria', pointsWhenPresent: 3 },
    ],
    interpretationThresholds: [
      { maxScore: 5, label: 'Low probability of stone' },
      { maxScore: 9, label: 'Moderate probability' },
      { maxScore: 13, label: 'High probability of stone' },
    ],
    maxScore: 13,
  }],

  redFlagFeatureIds: ['fever_chills', 'urinary_retention'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 8. PELVIC INFLAMMATORY DISEASE
// ═══════════════════════════════════════════════════════════════════════════════
export const pelvicInflammatoryDisease: DiseaseNode = {
  id: 'pid',
  name: 'Pelvic Inflammatory Disease',
  icdCode: 'N70',
  system: 'gynaecological',
  organSystem: 'reproductive_female',
  acuity: 'semi_urgent',
  acuityTier: 3,

  epidemiology: {
    ageMin: 15, ageMax: 50, agePeak: [20, 35],
    sexRisk: { male: 0, female: 1.0 },
    backgroundPrevalence: 0.02,
    riskFactors: [
      { featureId: 'multiple_partners', label: 'Multiple sexual partners', LR_positive: 3.0, prevalenceInDisease: 0.5 },
      { featureId: 'young_age', label: 'Age <25', LR_positive: 2.0, prevalenceInDisease: 0.6 },
      { featureId: 'iud_use', label: 'IUD use', LR_positive: 2.5, prevalenceInDisease: 0.15 },
    ],
  },

  pathophysiology: {
    mechanism: 'Ascending infection from the lower genital tract (cervix) to the upper genital tract (endometrium, fallopian tubes, ovaries). The most common organisms are Chlamydia trachomatis and Neisseria gonorrhoeae. Infection causes tubal inflammation, which can lead to scarring, hydrosalpinx, tubo-ovarian abscess, and infertility. Pain is typically bilateral lower abdominal and associated with vaginal discharge.',
    timelineStages: [
      { stageId: 1, label: 'Cervicitis / early PID', typicalHoursFromOnset: [0, 72],
        dominantSymptoms: [sym('pain_initial_location', 0.6, 0.5), sym('vaginal_discharge', 0.7, 0.85),
          sym('dysuria', 0.3, 0.7), sym('dyspareunia', 0.4, 0.8)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Dull ache, bilateral lower abdomen', painLocationTypical: 'Suprapubic / bilateral lower',
        painRadiationTypical: 'None' },
      { stageId: 2, label: 'Salpingitis / established PID', typicalHoursFromOnset: [72, 168],
        dominantSymptoms: [sym('pain_location_now', 0.7, 0.5), sym('fever', 0.6, 0.55),
          sym('fever_chills', 0.4, 0.85), sym('nausea', 0.4, 0.5)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Constant, bilateral lower abdomen', painLocationTypical: 'Bilateral lower quadrants',
        painRadiationTypical: 'May radiate to thighs' },
    ],
    progressionRule: 'May be indolent and chronic. Acute exacerbations occur. Untreated, leads to tubal scarring, ectopic risk, infertility.',
  },

  features: {
    symptoms: [
      sym('pain_initial_location', 0.6, 0.5, { stageRelevance: [1] }),
      sym('pain_location_now', 0.7, 0.5, { stageRelevance: [2] }),
      sym('pain_character', 0.4, 0.55, { stageRelevance: [1, 2] }),
      sym('pain_severity', 0.5, 0.4, { stageRelevance: [1, 2] }),
      sym('vaginal_discharge', 0.7, 0.85, { stageRelevance: [1, 2] }),
      sym('dyspareunia', 0.4, 0.8, { stageRelevance: [1, 2] }),
      sym('dysuria', 0.3, 0.75, { stageRelevance: [1] }),
      sym('fever', 0.6, 0.55, { stageRelevance: [2] }),
      sym('fever_chills', 0.4, 0.85, { stageRelevance: [2] }),
      sym('nausea', 0.4, 0.5, { stageRelevance: [2] }),
      sym('last_menstrual_period', 0.3, 0.6, { stageRelevance: [1] }),
      sym('previous_similar_episodes', 0.4, 0.7, { stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('vaginal_discharge', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.15, label: 'No vaginal discharge — PID unlikely but not excluded' }),
    ],
    supporting: [
      sym('last_menstrual_period', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.5, label: 'Normal LMP makes ectopic less likely' }),
    ],
  },

  differential: {
    mimics: ['appendicitis', 'ectopic_pregnancy', 'ovarian_torsion', 'cystitis', 'endometriosis'],
    distinguishingFeatures: [
      { fromDiseaseId: 'appendicitis', featureIds: ['pain_migration', 'vaginal_discharge', 'pain_location_now'] },
      { fromDiseaseId: 'ectopic_pregnancy', featureIds: ['last_menstrual_period', 'vaginal_bleeding', 'syncope'] },
      { fromDiseaseId: 'ovarian_torsion', featureIds: ['pain_onset', 'nausea', 'pain_character'] },
    ],
    neverCloseConditions: ['ectopic_pregnancy'],
  },

  complications: [
    { name: 'Tubo-ovarian abscess', warningFeatures: ['fever_chills', 'peritonism'],
      riskFactors: ['iud_use'], timeWindowHours: [168, 720], severityTier: 'severe',
      description: 'Collection of pus in tube and ovary requiring drainage.' },
    { name: 'Infertility', warningFeatures: [],
      riskFactors: ['delayed_treatment', 'recurrent_pid'], timeWindowHours: [720, 43200], severityTier: 'moderate',
      description: 'Tubal scarring increases risk of ectopic pregnancy and infertility.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['peritonism', 'fever_chills'],
  activationThreshold: { requiredPositiveFeatures: ['vaginal_discharge'], requiredAbsentFeatures: [] },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 9. GASTROENTERITIS
// ═══════════════════════════════════════════════════════════════════════════════
export const gastroenteritis: DiseaseNode = {
  id: 'gastroenteritis',
  name: 'Gastroenteritis',
  icdCode: 'A09',
  system: 'medical',
  organSystem: 'GI',
  acuity: 'routine',
  acuityTier: 4,

  epidemiology: {
    ageMin: 0, ageMax: 90, agePeak: [1, 10],
    sexRisk: { male: 1.0, female: 1.0 },
    backgroundPrevalence: 0.1,
    riskFactors: [
      { featureId: 'recent_travel', label: 'Recent travel', LR_positive: 2.5, prevalenceInDisease: 0.2 },
      { featureId: 'sick_contacts', label: 'Sick contacts', LR_positive: 3.0, prevalenceInDisease: 0.3 },
    ],
  },

  pathophysiology: {
    mechanism: 'Infection of the gastrointestinal mucosa by viruses (rotavirus, norovirus), bacteria (Salmonella, Campylobacter, Shigella), or parasites. The infection causes increased intestinal secretion, decreased absorption, and inflammation. Symptoms are predominantly watery diarrhoea, vomiting, and cramping abdominal pain that does NOT localise (in contrast to surgical causes).',
    timelineStages: [
      { stageId: 1, label: 'Acute infection', typicalHoursFromOnset: [0, 24],
        dominantSymptoms: [sym('pain_onset', 0.5, 0.5), sym('pain_character', 0.5, 0.5),
          sym('diarrhea', 0.9, 0.7), sym('vomiting', 0.7, 0.5), sym('nausea', 0.8, 0.5)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Cramping, diffuse', painLocationTypical: 'Periumbilical / diffuse',
        painRadiationTypical: 'None' },
      { stageId: 2, label: 'Peak symptoms', typicalHoursFromOnset: [24, 72],
        dominantSymptoms: [sym('diarrhea', 0.9, 0.7), sym('vomiting_frequency', 0.5, 0.6),
          sym('fever', 0.5, 0.55), sym('pain_location_now', 0.4, 0.5)],
        examFindings: [], severityTrajectory: 'stable',
        painCharacterTypical: 'Cramping', painLocationTypical: 'Diffuse',
        painRadiationTypical: 'None' },
    ],
    progressionRule: 'Self-limiting over 2–7 days. Persistent diarrhoea >7 days suggests parasitic or non-infectious cause.',
  },

  features: {
    symptoms: [
      sym('pain_onset', 0.5, 0.5, { stageRelevance: [1] }),
      sym('pain_character', 0.5, 0.5, { stageRelevance: [1, 2] }),
      sym('pain_initial_location', 0.3, 0.5, { stageRelevance: [1] }),
      sym('pain_location_now', 0.4, 0.5, { stageRelevance: [2] }),
      sym('diarrhea', 0.9, 0.7, { stageRelevance: [1, 2] }),
      sym('nausea', 0.8, 0.45, { stageRelevance: [1, 2] }),
      sym('vomiting', 0.7, 0.5, { stageRelevance: [1, 2] }),
      sym('vomiting_timing', 0.5, 0.55, { stageRelevance: [1] }),
      sym('vomiting_frequency', 0.5, 0.6, { stageRelevance: [2] }),
      sym('fever', 0.5, 0.55, { stageRelevance: [2] }),
      sym('bowel_habits', 0.7, 0.6, { stageRelevance: [1, 2] }),
      sym('previous_similar_episodes', 0.2, 0.7, { stageRelevance: [1] }),
      sym('recent_travel', 0.3, 0.8, { stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('diarrhea', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.05, label: 'No diarrhoea — gastroenteritis very unlikely' }),
    ],
    supporting: [
      sym('obstipation', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.2, label: 'No obstipation — supports gastroenteritis over obstruction' }),
      sym('pain_migration', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.3, label: 'No migration pattern — against appendicitis' }),
    ],
  },

  differential: {
    mimics: ['appendicitis', 'intestinal_obstruction', 'diverticulitis', 'food_poisoning'],
    distinguishingFeatures: [
      { fromDiseaseId: 'appendicitis', featureIds: ['pain_migration', 'anorexia', 'vomiting_timing', 'diarrhea'] },
      { fromDiseaseId: 'intestinal_obstruction', featureIds: ['obstipation', 'bowel_habits', 'pain_character'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Dehydration', warningFeatures: ['syncope', 'vomiting_frequency'],
      riskFactors: ['age<5', 'age>65'], timeWindowHours: [24, 72], severityTier: 'moderate',
      description: 'Fluid loss from vomiting and diarrhoea requiring IV rehydration.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: [],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 10. DIVERTICULITIS
// ═══════════════════════════════════════════════════════════════════════════════
export const diverticulitis: DiseaseNode = {
  id: 'diverticulitis',
  name: 'Diverticulitis',
  icdCode: 'K57',
  system: 'surgical',
  organSystem: 'GI',
  acuity: 'urgent',
  acuityTier: 2,

  epidemiology: {
    ageMin: 30, ageMax: 90, agePeak: [50, 80],
    sexRisk: { male: 0.8, female: 1.2 },
    backgroundPrevalence: 0.02,
    riskFactors: [
      { featureId: 'constipation', label: 'Chronic constipation', LR_positive: 2.0, prevalenceInDisease: 0.4 },
      { featureId: 'low_fibre_diet', label: 'Low-fibre diet', LR_positive: 2.5, prevalenceInDisease: 0.5 },
      { featureId: 'smoking', label: 'Smoking', LR_positive: 1.5, prevalenceInDisease: 0.3 },
    ],
  },

  pathophysiology: {
    mechanism: 'Inflammation and infection of diverticula — acquired outpouchings of the colonic mucosa through the muscularis. Faeces lodge in the diverticulum, causing infection, inflammation, and potentially perforation. The most common site is the sigmoid colon, hence the classic left lower quadrant pain. In Asian populations, right-sided diverticulitis is more common and can mimic appendicitis.',
    timelineStages: [
      { stageId: 1, label: 'Simple diverticulitis', typicalHoursFromOnset: [0, 48],
        dominantSymptoms: [sym('pain_onset', 0.5, 0.5), sym('pain_initial_location', 0.7, 0.55),
          sym('pain_character', 0.5, 0.5), sym('bowel_habits', 0.5, 0.6)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Constant, dull ache', painLocationTypical: 'Left lower quadrant (LLQ)',
        painRadiationTypical: 'May radiate to suprapubic region' },
      { stageId: 2, label: 'Complicated (abscess / perforation)', typicalHoursFromOnset: [48, 120],
        dominantSymptoms: [sym('pain_location_now', 0.75, 0.5), sym('fever', 0.8, 0.5),
          sym('fever_chills', 0.5, 0.85), sym('peritonism', 0.6, 0.8)],
        examFindings: [], severityTrajectory: 'rapidly_worsening',
        painCharacterTypical: 'Severe, constant, localised', painLocationTypical: 'Left lower quadrant',
        painRadiationTypical: 'None' },
    ],
    progressionRule: 'Simple diverticulitis resolves with antibiotics. Perforation or abscess formation requires drainage or surgery.',
  },

  features: {
    symptoms: [
      sym('pain_onset', 0.5, 0.5, { stageRelevance: [1] }),
      sym('pain_initial_location', 0.7, 0.55, { stageRelevance: [1] }),
      sym('pain_location_now', 0.75, 0.5, { stageRelevance: [2] }),
      sym('pain_character', 0.5, 0.5, { stageRelevance: [1, 2] }),
      sym('pain_severity', 0.6, 0.4, { stageRelevance: [1, 2] }),
      sym('fever', 0.8, 0.5, { stageRelevance: [2] }),
      sym('fever_chills', 0.5, 0.85, { stageRelevance: [2] }),
      sym('bowel_habits', 0.5, 0.6, { stageRelevance: [1, 2] }),
      sym('constipation', 0.4, 0.7, { stageRelevance: [1] }),
      sym('nausea', 0.4, 0.5, { stageRelevance: [1, 2] }),
      sym('peritonism', 0.6, 0.8, { stageRelevance: [2] }),
      sym('previous_similar_episodes', 0.3, 0.7, { stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('pain_location_now', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.1, label: 'No LLQ tenderness — sigmoid diverticulitis unlikely' }),
    ],
    supporting: [
      sym('diarrhea', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.2, label: 'No diarrhoea — supports diverticulitis over gastroenteritis' }),
    ],
  },

  differential: {
    mimics: ['appendicitis', 'intestinal_obstruction', 'ovarian_torsion', 'ureteric_colic', 'ibd_flare'],
    distinguishingFeatures: [
      { fromDiseaseId: 'appendicitis', featureIds: ['pain_location_now', 'pain_migration', 'bowel_habits'] },
      { fromDiseaseId: 'ureteric_colic', featureIds: ['pain_character', 'pain_radiation', 'hematuria'] },
      { fromDiseaseId: 'ovarian_torsion', featureIds: ['pain_onset', 'nausea', 'fever'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Diverticular abscess', warningFeatures: ['fever_chills', 'peritonism'],
      riskFactors: ['steroid_use', 'nsaid_use'], timeWindowHours: [72, 168], severityTier: 'severe',
      description: 'Localised pus collection requiring percutaneous or surgical drainage.' },
    { name: 'Perforation', warningFeatures: ['peritonism', 'rigidity'],
      riskFactors: ['steroid_use'], timeWindowHours: [96, 168], severityTier: 'critical',
      description: 'Faecal peritonitis — emergency laparotomy required.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['peritonism', 'rigidity', 'fever_chills'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 11. OVARIAN TORSION
// ═══════════════════════════════════════════════════════════════════════════════
export const ovarianTorsion: DiseaseNode = {
  id: 'ovarian_torsion',
  name: 'Ovarian Torsion',
  icdCode: 'N83.5',
  system: 'gynaecological',
  organSystem: 'reproductive_female',
  acuity: 'immediately_life_threatening',
  acuityTier: 1,

  epidemiology: {
    ageMin: 10, ageMax: 50, agePeak: [20, 35],
    sexRisk: { male: 0, female: 1.0 },
    backgroundPrevalence: 0.003,
    riskFactors: [
      { featureId: 'ovarian_cyst', label: 'Known ovarian cyst', LR_positive: 4.0, prevalenceInDisease: 0.5 },
      { featureId: 'ovarian_mass', label: 'Ovarian mass >5cm', LR_positive: 5.0, prevalenceInDisease: 0.6 },
    ],
  },

  pathophysiology: {
    mechanism: 'The ovary twists on its vascular pedicle, initially compromising venous outflow (causing congestion and enlargement) and subsequently arterial inflow (causing ischaemia and infarction). Pain is sudden, severe, and lateralised to the affected side. Nausea and vomiting occur due to the peritoneal irritation and vagal response. Time to ovarian salvage is measured in hours.',
    timelineStages: [
      { stageId: 1, label: 'Acute torsion', typicalHoursFromOnset: [0, 6],
        dominantSymptoms: [sym('pain_onset', 0.8, 0.6), sym('pain_initial_location', 0.7, 0.5),
          sym('pain_character', 0.6, 0.55), sym('nausea', 0.8, 0.5)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Sudden, severe, sharp', painLocationTypical: 'Lower abdomen (unilateral)',
        painRadiationTypical: 'May radiate to thigh or flank' },
      { stageId: 2, label: 'Ischaemia / infarction', typicalHoursFromOnset: [6, 24],
        dominantSymptoms: [sym('pain_location_now', 0.7, 0.5), sym('pain_severity', 0.85, 0.5),
          sym('peritonism', 0.4, 0.8), sym('vomiting', 0.7, 0.5)],
        examFindings: [], severityTrajectory: 'rapidly_worsening',
        painCharacterTypical: 'Excruciating, constant', painLocationTypical: 'Unilateral lower abdomen',
        painRadiationTypical: 'Thigh or flank' },
    ],
    progressionRule: 'Ovarian salvage rate drops significantly after 6–8 hours. Irreversible infarction by 24–48h.',
  },

  features: {
    symptoms: [
      sym('pain_onset', 0.8, 0.6, { stageRelevance: [1] }),
      sym('pain_initial_location', 0.7, 0.5, { stageRelevance: [1] }),
      sym('pain_location_now', 0.7, 0.5, { stageRelevance: [2] }),
      sym('pain_character', 0.6, 0.55, { stageRelevance: [1, 2] }),
      sym('pain_severity', 0.85, 0.5, { stageRelevance: [1, 2] }),
      sym('nausea', 0.8, 0.45, { stageRelevance: [1, 2] }),
      sym('vomiting', 0.7, 0.5, { stageRelevance: [2] }),
      sym('peritonism', 0.4, 0.8, { stageRelevance: [2] }),
      sym('previous_similar_episodes', 0.2, 0.75, { stageRelevance: [1] }),
      sym('last_menstrual_period', 0.3, 0.6, { stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('pain_onset', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.1, label: 'Gradual onset makes torsion very unlikely' }),
    ],
    supporting: [
      sym('last_menstrual_period', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.4, label: 'Normal LMP makes ectopic less likely' }),
    ],
  },

  differential: {
    mimics: ['appendicitis', 'ectopic_pregnancy', 'ovarian_cyst_rupture', 'pid'],
    distinguishingFeatures: [
      { fromDiseaseId: 'appendicitis', featureIds: ['pain_onset', 'pain_migration', 'pain_location_now', 'nausea'] },
      { fromDiseaseId: 'ectopic_pregnancy', featureIds: ['last_menstrual_period', 'vaginal_bleeding', 'syncope'] },
      { fromDiseaseId: 'pid', featureIds: ['vaginal_discharge', 'fever', 'pain_onset'] },
    ],
    neverCloseConditions: ['ectopic_pregnancy'],
  },

  complications: [
    { name: 'Ovarian infarction', warningFeatures: ['peritonism', 'pain_severity'],
      riskFactors: ['delayed_presentation'], timeWindowHours: [6, 48], severityTier: 'moderate',
      description: 'Irreversible ischaemic damage requiring oophorectomy.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['peritonism', 'syncope'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 12. RUPTURED AAA
// ═══════════════════════════════════════════════════════════════════════════════
export const rupturedAaa: DiseaseNode = {
  id: 'aaa_rupture',
  name: 'Ruptured Abdominal Aortic Aneurysm',
  icdCode: 'I71.3',
  system: 'vascular',
  organSystem: 'cardiovascular',
  acuity: 'immediately_life_threatening',
  acuityTier: 1,

  epidemiology: {
    ageMin: 50, ageMax: 90, agePeak: [65, 85],
    sexRisk: { male: 4.0, female: 1.0 },
    backgroundPrevalence: 0.005,
    riskFactors: [
      { featureId: 'smoking', label: 'Smoking', LR_positive: 4.0, prevalenceInDisease: 0.7 },
      { featureId: 'htn_cad', label: 'Hypertension', LR_positive: 2.5, prevalenceInDisease: 0.6 },
      { featureId: 'family_history_aaa', label: 'Family history of AAA', LR_positive: 3.0, prevalenceInDisease: 0.15 },
    ],
  },

  pathophysiology: {
    mechanism: 'Atherosclerotic weakening of the abdominal aortic wall leads to progressive dilation. When wall stress exceeds tensile strength, the aneurysm ruptures, causing massive retroperitoneal or intraperitoneal haemorrhage. Pain is severe, sudden, and typically felt in the abdomen, back, or flank. Syncope or haemodynamic collapse is common. The classic triad is hypotension, pulsatile abdominal mass, and back pain.',
    timelineStages: [
      { stageId: 1, label: 'Impending rupture / acute expansion', typicalHoursFromOnset: [0, 2],
        dominantSymptoms: [sym('pain_onset', 0.85, 0.65), sym('pain_initial_location', 0.7, 0.5),
          sym('pain_character', 0.7, 0.6), sym('syncope', 0.6, 0.9)],
        examFindings: [], severityTrajectory: 'rapidly_worsening',
        painCharacterTypical: 'Tearing or ripping', painLocationTypical: 'Mid-abdomen, back, or flank',
        painRadiationTypical: 'To back or groin' },
      { stageId: 2, label: 'Haemorrhagic shock', typicalHoursFromOnset: [0, 2],
        dominantSymptoms: [sym('syncope', 0.85, 0.9), sym('pain_severity', 0.9, 0.5),
          sym('dyspnea', 0.5, 0.75)],
        examFindings: [], severityTrajectory: 'rapidly_worsening',
        painCharacterTypical: 'Excruciating', painLocationTypical: 'Abdomen ± back',
        painRadiationTypical: 'To back' },
    ],
    progressionRule: 'Mortality increases by ~1% per minute when ruptured. Immediate surgical intervention is mandatory.',
  },

  features: {
    symptoms: [
      sym('pain_onset', 0.85, 0.65, { stageRelevance: [1] }),
      sym('pain_initial_location', 0.7, 0.5, { stageRelevance: [1] }),
      sym('pain_character', 0.7, 0.6, { stageRelevance: [1] }),
      sym('pain_severity', 0.9, 0.5, { stageRelevance: [1, 2] }),
      sym('syncope', 0.85, 0.9, { stageRelevance: [1, 2] }),
      sym('flank_pain', 0.5, 0.7, { stageRelevance: [1] }),
      sym('dyspnea', 0.5, 0.75, { stageRelevance: [2] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('pain_onset', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.05, label: 'Gradual onset — ruptured AAA very unlikely' }),
    ],
    supporting: [],
  },

  differential: {
    mimics: ['perforated_ulcer', 'pancreatitis', 'ureteric_colic', 'mesenteric_ischaemia'],
    distinguishingFeatures: [
      { fromDiseaseId: 'perforated_ulcer', featureIds: ['syncope', 'htn_cad', 'pain_character', 'pain_location_now'] },
      { fromDiseaseId: 'ureteric_colic', featureIds: ['pain_character', 'syncope', 'age'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Exsanguination', warningFeatures: ['syncope', 'pain_severity'],
      riskFactors: ['anticoagulant_use'], timeWindowHours: [0, 1], severityTier: 'critical',
      description: 'Rapid blood loss leading to cardiac arrest — immediate surgical repair required.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['syncope', 'pain_onset', 'pain_character'],
  activationThreshold: { requiredPositiveFeatures: [], requiredAbsentFeatures: [] },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 13. ACUTE MESENTERIC ISCHAEMIA
// ═══════════════════════════════════════════════════════════════════════════════
export const mesentericIschaemia: DiseaseNode = {
  id: 'mesenteric_ischaemia',
  name: 'Acute Mesenteric Ischaemia',
  icdCode: 'K55.0',
  system: 'vascular',
  organSystem: 'cardiovascular',
  acuity: 'immediately_life_threatening',
  acuityTier: 1,

  epidemiology: {
    ageMin: 50, ageMax: 90, agePeak: [65, 85],
    sexRisk: { male: 1.2, female: 1.0 },
    backgroundPrevalence: 0.002,
    riskFactors: [
      { featureId: 'htn_cad', label: 'Atrial fibrillation / vascular disease', LR_positive: 5.0, prevalenceInDisease: 0.5 },
      { featureId: 'prior_thromboembolism', label: 'Prior thromboembolism', LR_positive: 3.0, prevalenceInDisease: 0.2 },
      { featureId: 'age>70', label: 'Age >70', LR_positive: 2.0, prevalenceInDisease: 0.7 },
    ],
  },

  pathophysiology: {
    mechanism: 'Acute interruption of mesenteric blood flow, most commonly by SMA embolus (atrial fibrillation), SMA thrombosis (atherosclerosis), or mesenteric venous thrombosis (hypercoagulable state). The hallmark is pain out of proportion to examination — the patient is in agony while the abdomen remains soft. Bowel becomes ischaemic, then necrotic, then perforated.',
    timelineStages: [
      { stageId: 1, label: 'Ischaemia (pain without signs)', typicalHoursFromOnset: [0, 6],
        dominantSymptoms: [sym('pain_onset', 0.85, 0.6), sym('pain_character', 0.7, 0.6),
          sym('pain_severity', 0.9, 0.5), sym('nausea', 0.4, 0.5)],
        examFindings: [], severityTrajectory: 'rapidly_worsening',
        painCharacterTypical: 'Excruciating, out of proportion', painLocationTypical: 'Periumbilical / diffuse',
        painRadiationTypical: 'None' },
      { stageId: 2, label: 'Bowel necrosis / perforation', typicalHoursFromOnset: [6, 24],
        dominantSymptoms: [sym('peritonism', 0.7, 0.8), sym('hematochezia', 0.5, 0.95),
          sym('fever_chills', 0.5, 0.85), sym('syncope', 0.4, 0.9)],
        examFindings: [], severityTrajectory: 'rapidly_worsening',
        painCharacterTypical: 'Excruciating, diffuse', painLocationTypical: 'Generalised',
        painRadiationTypical: 'None' },
    ],
    progressionRule: 'From ischaemia to irreversible bowel necrosis in 6–12 hours. Mortality >50% even with treatment.',
  },

  features: {
    symptoms: [
      sym('pain_onset', 0.85, 0.6, { stageRelevance: [1] }),
      sym('pain_character', 0.7, 0.6, { stageRelevance: [1] }),
      sym('pain_severity', 0.9, 0.5, { stageRelevance: [1, 2] }),
      sym('pain_initial_location', 0.6, 0.5, { stageRelevance: [1] }),
      sym('pain_location_now', 0.7, 0.5, { stageRelevance: [2] }),
      sym('nausea', 0.4, 0.5, { stageRelevance: [1, 2] }),
      sym('vomiting', 0.5, 0.55, { stageRelevance: [2] }),
      sym('hematochezia', 0.5, 0.95, { stageRelevance: [2] }),
      sym('peritonism', 0.7, 0.8, { stageRelevance: [2] }),
      sym('syncope', 0.4, 0.9, { stageRelevance: [2] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('htn_cad', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.15, label: 'No vascular risk factors — mesenteric ischaemia less likely but not excluded' }),
    ],
    supporting: [],
  },

  differential: {
    mimics: ['perforated_ulcer', 'pancreatitis', 'intestinal_obstruction', 'aaa_rupture'],
    distinguishingFeatures: [
      { fromDiseaseId: 'perforated_ulcer', featureIds: ['pain_severity', 'peritonism_timing', 'htn_cad'] },
      { fromDiseaseId: 'pancreatitis', featureIds: ['pain_radiation', 'alcohol_use', 'htn_cad'] },
    ],
    neverCloseConditions: ['aaa_rupture'],
  },

  complications: [
    { name: 'Bowel infarction', warningFeatures: ['peritonism', 'hematochezia'],
      riskFactors: ['age>70', 'htn_cad'], timeWindowHours: [6, 24], severityTier: 'critical',
      description: 'Full-thickness bowel necrosis requiring resection — high mortality.' },
    { name: 'Sepsis / multi-organ failure', warningFeatures: ['fever_chills', 'syncope'],
      riskFactors: [], timeWindowHours: [12, 48], severityTier: 'critical',
      description: 'Systemic inflammatory response to necrotic bowel.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['syncope', 'peritonism', 'hematochezia'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 14. PEPTIC ULCER DISEASE (unperforated)
// ═══════════════════════════════════════════════════════════════════════════════
export const pepticUlcerDisease: DiseaseNode = {
  id: 'peptic_ulcer_disease',
  name: 'Peptic Ulcer Disease',
  icdCode: 'K27',
  system: 'medical',
  organSystem: 'GI',
  acuity: 'semi_urgent',
  acuityTier: 3,

  epidemiology: {
    ageMin: 20, ageMax: 80, agePeak: [30, 60],
    sexRisk: { male: 1.3, female: 1.0 },
    backgroundPrevalence: 0.04,
    riskFactors: [
      { featureId: 'nsaid_use', label: 'NSAID use', LR_positive: 4.0, prevalenceInDisease: 0.4 },
      { featureId: 'smoking', label: 'Smoking', LR_positive: 2.0, prevalenceInDisease: 0.4 },
      { featureId: 'alcohol_use', label: 'Alcohol', LR_positive: 1.5, prevalenceInDisease: 0.3 },
    ],
  },

  pathophysiology: {
    mechanism: 'Mucosal erosion in the stomach or duodenum caused by H. pylori infection, NSAID use, or other mucosal insults. Pain is epigastric, gnawing or burning, and related to meals. Uncomplicated PUD does not cause peritonism or haemodynamic instability — these features indicate perforation.',
    timelineStages: [
      { stageId: 1, label: 'Active ulcer', typicalHoursFromOnset: [0, 168],
        dominantSymptoms: [sym('pain_character', 0.7, 0.6), sym('pain_initial_location', 0.8, 0.5),
          sym('heartburn', 0.5, 0.7), sym('belching', 0.3, 0.6)],
        examFindings: [], severityTrajectory: 'stable',
        painCharacterTypical: 'Gnawing or burning', painLocationTypical: 'Epigastrium',
        painRadiationTypical: 'May radiate to back' },
    ],
    progressionRule: 'Chronic relapsing course. May perforate or bleed acutely. Long-term risk of gastric cancer.',
  },

  features: {
    symptoms: [
      sym('pain_initial_location', 0.8, 0.5, { stageRelevance: [1] }),
      sym('pain_character', 0.7, 0.6, { stageRelevance: [1] }),
      sym('pain_severity', 0.5, 0.4, { stageRelevance: [1] }),
      sym('pain_relieving_factors', 0.5, 0.5, { stageRelevance: [1] }),
      sym('heartburn', 0.5, 0.7, { stageRelevance: [1] }),
      sym('belching', 0.3, 0.6, { stageRelevance: [1] }),
      sym('melena', 0.3, 0.9, { stageRelevance: [1] }),
      sym('nausea', 0.4, 0.5, { stageRelevance: [1] }),
      sym('previous_similar_episodes', 0.7, 0.75, { stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('pain_initial_location', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.15, label: 'No epigastric pain — PUD unlikely' }),
    ],
    supporting: [
      sym('pain_migration', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.5, label: 'No migration — against appendicitis' }),
    ],
  },

  differential: {
    mimics: ['gastritis', 'pancreatitis', 'cholecystitis', 'mi', 'functional_dyspepsia'],
    distinguishingFeatures: [
      { fromDiseaseId: 'pancreatitis', featureIds: ['pain_radiation', 'pain_severity', 'alcohol_use'] },
      { fromDiseaseId: 'cholecystitis', featureIds: ['pain_location_now', 'pain_radiation', 'fever'] },
      { fromDiseaseId: 'mi', featureIds: ['chest_pain', 'dyspnea', 'htn_cad'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Haemorrhage', warningFeatures: ['melena', 'hematemesis', 'syncope'],
      riskFactors: ['nsaid_use', 'anticoagulant_use'], timeWindowHours: [0, 168], severityTier: 'critical',
      description: 'Ulcer erodes into a vessel causing upper GI bleed.' },
    { name: 'Perforation', warningFeatures: ['pain_onset', 'peritonism', 'rigidity'],
      riskFactors: ['nsaid_use', 'steroid_use'], timeWindowHours: [0, 168], severityTier: 'critical',
      description: 'Full-thickness ulcer erosion causing peritonitis.' },
    { name: 'Gastric outlet obstruction', warningFeatures: ['vomiting', 'abdominal_distension'],
      riskFactors: ['chronic_pud'], timeWindowHours: [720, 43200], severityTier: 'moderate',
      description: 'Oedema or scarring causing narrowing of the pylorus.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['melena', 'hematemesis', 'peritonism'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 15. MECKEL'S DIVERTICULITIS (important in paediatrics)
// ═══════════════════════════════════════════════════════════════════════════════
export const meckelDiverticulitis: DiseaseNode = {
  id: 'meckel_diverticulitis',
  name: 'Meckel\'s Diverticulitis',
  icdCode: 'Q43.0',
  system: 'surgical',
  organSystem: 'GI',
  acuity: 'urgent',
  acuityTier: 2,

  epidemiology: {
    ageMin: 0, ageMax: 30, agePeak: [2, 10],
    sexRisk: { male: 2.0, female: 1.0 },
    backgroundPrevalence: 0.002,
    riskFactors: [],
  },

  pathophysiology: {
    mechanism: 'A Meckel\'s diverticulum (remnant of the vitelline duct) becomes inflamed, mimicking appendicitis. Pain is typically in the right lower quadrant or periumbilical. It may contain ectopic gastric mucosa, which can cause bleeding. The classic presentation is painless rectal bleeding in a child, but when inflamed it mimics appendicitis.',
    timelineStages: [
      { stageId: 1, label: 'Inflammation', typicalHoursFromOnset: [0, 24],
        dominantSymptoms: [sym('pain_initial_location', 0.6, 0.5), sym('pain_location_now', 0.6, 0.5),
          sym('pain_character', 0.5, 0.5), sym('nausea', 0.5, 0.5)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Cramping, then constant', painLocationTypical: 'Periumbilical → RLQ',
        painRadiationTypical: 'None' },
    ],
    progressionRule: 'Similar to appendicitis but often presents in younger children.',
  },

  features: {
    symptoms: [
      sym('pain_initial_location', 0.6, 0.5, { stageRelevance: [1] }),
      sym('pain_location_now', 0.6, 0.5, { stageRelevance: [1] }),
      sym('pain_character', 0.5, 0.5, { stageRelevance: [1] }),
      sym('nausea', 0.5, 0.5, { stageRelevance: [1] }),
      sym('vomiting', 0.4, 0.55, { stageRelevance: [1] }),
      sym('fever', 0.4, 0.55, { stageRelevance: [1] }),
      sym('hematochezia', 0.3, 0.9, { stageRelevance: [1] }),
      sym('pain_severity', 0.5, 0.4, { stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [],
    supporting: [],
  },

  differential: {
    mimics: ['appendicitis', 'intussusception', 'gastroenteritis'],
    distinguishingFeatures: [
      { fromDiseaseId: 'appendicitis', featureIds: ['hematochezia'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Perforation', warningFeatures: ['peritonism'],
      riskFactors: [], timeWindowHours: [24, 48], severityTier: 'critical',
      description: 'Perforation with peritonitis — surgical emergency.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['peritonism', 'hematochezia'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// Disease index — all abdominal pain disease nodes
// ═══════════════════════════════════════════════════════════════════════════════
export const ABDOMINAL_PAIN_DISEASES: DiseaseNode[] = [
  acuteAppendicitis,
  acuteCholecystitis,
  acutePancreatitis,
  ectopicPregnancy,
  intestinalObstruction,
  perforatedPepticUlcer,
  uretericColic,
  pelvicInflammatoryDisease,
  gastroenteritis,
  diverticulitis,
  ovarianTorsion,
  rupturedAaa,
  mesentericIschaemia,
  pepticUlcerDisease,
  meckelDiverticulitis,
];

// Merge extended disease nodes from category files
import { EXTENDED_DISEASE_NODES } from './nodes/index';
ABDOMINAL_PAIN_DISEASES.push(...EXTENDED_DISEASE_NODES);

export const ABDOMINAL_PAIN_DISEASE_MAP = new Map(ABDOMINAL_PAIN_DISEASES.map(d => [d.id, d]));
