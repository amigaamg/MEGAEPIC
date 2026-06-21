import type { DiseaseNode, FeatureRecord } from '../../diseaseNode';
import { getFeature, getLrPlus, getLrMinus } from '../../features/featureLibrary';

function feat(id: string, sens: number, spec: number, overrides?: Partial<FeatureRecord>): FeatureRecord {
  const base = getFeature(id);
  return { ...base, sensitivity: sens, specificity: spec, LR_positive: getLrPlus({ ...base, sensitivity: sens, specificity: spec }), LR_negative: getLrMinus({ ...base, sensitivity: sens, specificity: spec }), ...overrides };
}
function sym(id: string, sens: number, spec: number, overrides?: Partial<FeatureRecord>): FeatureRecord {
  return feat(id, sens, spec, { ...overrides, category: 'symptom' });
}
function rf(id: string, LRP: number, overrides?: Partial<FeatureRecord>): FeatureRecord {
  const base = getFeature(id);
  return { ...base, LR_positive: LRP, ...overrides, category: 'risk_factor' };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. CHOLANGITIS
// ═══════════════════════════════════════════════════════════════════════════════
export const cholangitis: DiseaseNode = {
  id: 'cholangitis',
  name: 'Cholangitis',
  icdCode: 'K83.0',
  system: 'surgical',
  organSystem: 'hepatobiliary',
  acuity: 'immediately_life_threatening',
  acuityTier: 1,

  epidemiology: {
    ageMin: 20, ageMax: 90, agePeak: [50, 80],
    sexRisk: { male: 0.7, female: 1.0 },
    backgroundPrevalence: 0.003,
    riskFactors: [
      { featureId: 'known_gallstones', label: 'Known gallstones', LR_positive: 8.0, prevalenceInDisease: 0.7 },
      { featureId: 'known_cancer', label: 'Biliary tract malignancy', LR_positive: 4.0, prevalenceInDisease: 0.1 },
      { featureId: 'diabetes', label: 'Diabetes', LR_positive: 2.0, prevalenceInDisease: 0.2 },
    ],
  },

  pathophysiology: {
    mechanism: 'Bacterial infection of the biliary tree, usually from common bile duct obstruction (gallstone, stricture, or tumour). Obstruction leads to stasis and bacterial overgrowth in bile, causing inflammation and sepsis. Charcot\'s triad: RUQ pain, fever/rigors, jaundice. Reynolds\' pentad adds hypotension and confusion. Life-threatening sepsis can develop rapidly.',
    timelineStages: [
      { stageId: 1, label: 'Developing', typicalHoursFromOnset: [0, 24],
        dominantSymptoms: [sym('pain_initial_location', 0.8, 0.5), sym('fever', 0.85, 0.5),
          sym('fever_chills', 0.7, 0.85), sym('nausea', 0.6, 0.45)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Dull ache or colicky RUQ pain', painLocationTypical: 'Right upper quadrant',
        painRadiationTypical: 'May radiate to right shoulder or back' },
      { stageId: 2, label: 'Sepsis', typicalHoursFromOnset: [24, 72],
        dominantSymptoms: [sym('fever_chills', 0.9, 0.85), sym('jaundice', 0.85, 0.85),
          sym('pain_location_now', 0.8, 0.5), sym('vomiting', 0.6, 0.55), sym('pain_severity', 0.7, 0.4)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Constant, severe RUQ pain', painLocationTypical: 'Right upper quadrant',
        painRadiationTypical: 'Right shoulder or interscapular' },
      { stageId: 3, label: 'Shock', typicalHoursFromOnset: [72, 168],
        dominantSymptoms: [sym('syncope', 0.5, 0.9), sym('fever_chills', 0.95, 0.8),
          sym('peritonism', 0.4, 0.85), sym('jaundice', 0.9, 0.8)],
        examFindings: [], severityTrajectory: 'rapidly_worsening',
        painCharacterTypical: 'Severe, diffuse abdominal pain', painLocationTypical: 'Diffuse — whole abdomen',
        painRadiationTypical: 'None' },
    ],
    progressionRule: 'Untreated, progresses from developing cholangitis to sepsis within 24h, then to septic shock. Mortality exceeds 50% once shock develops. Emergency biliary drainage is required.',
  },

  features: {
    symptoms: [
      sym('pain_onset', 0.6, 0.5, { stageRelevance: [1] }),
      sym('pain_initial_location', 0.85, 0.5, { stageRelevance: [1] }),
      sym('pain_location_now', 0.8, 0.5, { stageRelevance: [2, 3] }),
      sym('pain_character', 0.5, 0.5, { stageRelevance: [1, 2] }),
      sym('pain_severity', 0.7, 0.4, { stageRelevance: [1, 2, 3] }),
      sym('pain_radiation', 0.5, 0.8, { stageRelevance: [1, 2] }),
      sym('pain_worsening_factors', 0.4, 0.5, { stageRelevance: [1] }),
      sym('nausea', 0.7, 0.45, { stageRelevance: [1, 2] }),
      sym('vomiting', 0.6, 0.55, { stageRelevance: [2] }),
      sym('anorexia', 0.5, 0.55, { stageRelevance: [1, 2] }),
      sym('fever', 0.9, 0.5, { stageRelevance: [1, 2] }),
      sym('fever_chills', 0.9, 0.85, { stageRelevance: [1, 2, 3] }),
      sym('jaundice', 0.8, 0.85, { stageRelevance: [2, 3] }),
      sym('peritonism', 0.4, 0.85, { stageRelevance: [3] }),
      sym('syncope', 0.5, 0.9, { stageRelevance: [3] }),
      sym('previous_similar_episodes', 0.4, 0.7, { stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('fever_chills', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.05, label: 'No fever or rigors — cholangitis very unlikely' }),
      sym('jaundice', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.1, label: 'No jaundice — biliary sepsis unlikely' }),
    ],
    supporting: [
      sym('pain_initial_location', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.3, label: 'Pain not in RUQ — consider other causes of fever and jaundice' }),
    ],
  },

  differential: {
    mimics: ['acute_cholecystitis', 'hepatitis', 'pancreatitis', 'sepsis_other_source', 'hepatic_abscess'],
    distinguishingFeatures: [
      { fromDiseaseId: 'acute_cholecystitis', featureIds: ['fever_chills', 'jaundice', 'syncope'] },
      { fromDiseaseId: 'hepatitis', featureIds: ['fever_chills', 'pain_character', 'pain_location_now'] },
      { fromDiseaseId: 'pancreatitis', featureIds: ['jaundice', 'fever_chills', 'pain_radiation'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Septic shock', warningFeatures: ['syncope', 'fever_chills', 'peritonism'],
      riskFactors: ['age>70', 'diabetes'], timeWindowHours: [24, 72], severityTier: 'critical',
      description: 'Life-threatening hypotension and multi-organ failure from biliary sepsis — ICU care and emergency biliary drainage required.' },
    { name: 'Hepatic abscess', warningFeatures: ['fever_chills', 'pain_location_now'],
      riskFactors: ['delayed_treatment', 'diabetes'], timeWindowHours: [72, 336], severityTier: 'severe',
      description: 'Pus collection in liver parenchyma requiring percutaneous or surgical drainage.' },
    { name: 'Portal vein thrombosis', warningFeatures: ['abdominal_distension', 'hematemesis'],
      riskFactors: ['cirrhosis'], timeWindowHours: [72, 336], severityTier: 'severe',
      description: 'Extension of infection into portal venous system causing pyaemic portal vein thrombosis.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['fever_chills', 'syncope', 'jaundice'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 2. HEPATITIS
// ═══════════════════════════════════════════════════════════════════════════════
export const hepatitis: DiseaseNode = {
  id: 'hepatitis',
  name: 'Hepatitis',
  icdCode: 'K75.9',
  system: 'medical',
  organSystem: 'hepatobiliary',
  acuity: 'semi_urgent',
  acuityTier: 3,

  epidemiology: {
    ageMin: 1, ageMax: 80, agePeak: [20, 50],
    sexRisk: { male: 1.0, female: 1.0 },
    backgroundPrevalence: 0.01,
    riskFactors: [
      { featureId: 'ivdu', label: 'IV drug use', LR_positive: 5.0, prevalenceInDisease: 0.2 },
      { featureId: 'recent_travel', label: 'Recent travel to endemic area', LR_positive: 3.0, prevalenceInDisease: 0.3 },
      { featureId: 'alcohol_use', label: 'Heavy alcohol use', LR_positive: 3.0, prevalenceInDisease: 0.3 },
      { featureId: 'smoking', label: 'Smoking', LR_positive: 1.2, prevalenceInDisease: 0.3 },
    ],
  },

  pathophysiology: {
    mechanism: 'Liver inflammation from viral (HAV, HBV, HCV, HEV), alcoholic, drug-induced, or autoimmune causes. Hepatocellular injury leads to release of liver enzymes, impaired bilirubin metabolism (jaundice), and systemic symptoms. Viral hepatitis typically has a prodromal phase with flu-like symptoms followed by an icteric phase.',
    timelineStages: [
      { stageId: 1, label: 'Prodrome', typicalHoursFromOnset: [0, 168],
        dominantSymptoms: [sym('fever', 0.6, 0.5), sym('fatigue', 0.8, 0.5),
          sym('nausea', 0.7, 0.45), sym('anorexia', 0.7, 0.5), sym('pain_initial_location', 0.6, 0.5)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Dull ache in RUQ', painLocationTypical: 'Right upper quadrant',
        painRadiationTypical: 'None' },
      { stageId: 2, label: 'Icteric', typicalHoursFromOnset: [168, 672],
        dominantSymptoms: [sym('jaundice', 0.85, 0.85), sym('pain_location_now', 0.6, 0.5),
          sym('fatigue', 0.9, 0.5), sym('nausea', 0.6, 0.45), sym('vomiting', 0.4, 0.55)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Dull RUQ ache', painLocationTypical: 'Right upper quadrant',
        painRadiationTypical: 'None' },
    ],
    progressionRule: 'Prodrome lasts 3–7 days, followed by icteric phase lasting 1–4 weeks. Most cases resolve spontaneously. Fulminant hepatic failure is rare but life-threatening.',
  },

  features: {
    symptoms: [
      sym('pain_onset', 0.4, 0.5, { stageRelevance: [1] }),
      sym('pain_initial_location', 0.7, 0.5, { stageRelevance: [1] }),
      sym('pain_location_now', 0.6, 0.5, { stageRelevance: [2] }),
      sym('pain_character', 0.5, 0.5, { stageRelevance: [1, 2] }),
      sym('pain_severity', 0.4, 0.4, { stageRelevance: [1, 2] }),
      sym('jaundice', 0.85, 0.85, { stageRelevance: [2] }),
      sym('nausea', 0.7, 0.45, { stageRelevance: [1, 2] }),
      sym('vomiting', 0.5, 0.55, { stageRelevance: [2] }),
      sym('anorexia', 0.7, 0.5, { stageRelevance: [1, 2] }),
      sym('fever', 0.6, 0.5, { stageRelevance: [1] }),
      sym('fatigue', 0.85, 0.5, { stageRelevance: [1, 2] }),
      sym('abdominal_distension', 0.2, 0.7, { stageRelevance: [2] }),
      sym('weight_loss', 0.3, 0.8, { stageRelevance: [2] }),
      sym('previous_similar_episodes', 0.3, 0.7, { stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('jaundice', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.15, label: 'No jaundice — hepatitis less likely but not excluded in prodrome' }),
      sym('fatigue', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.2, label: 'No fatigue — hepatitis unlikely' }),
    ],
    supporting: [
      sym('fever_chills', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.4, label: 'No rigors — supports hepatitis over cholangitis' }),
    ],
  },

  differential: {
    mimics: ['cholangitis', 'acute_cholecystitis', 'pancreatitis', 'alcoholic_hepatitis', 'drug_induced_liver_injury'],
    distinguishingFeatures: [
      { fromDiseaseId: 'cholangitis', featureIds: ['fever_chills', 'pain_initial_location', 'pain_severity'] },
      { fromDiseaseId: 'acute_cholecystitis', featureIds: ['fever_chills', 'pain_character', 'pain_radiation'] },
      { fromDiseaseId: 'alcoholic_hepatitis', featureIds: ['alcohol_use', 'abdominal_distension'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Fulminant hepatic failure', warningFeatures: ['jaundice', 'syncope', 'abdominal_distension'],
      riskFactors: ['hepatitis_b', 'superinfection'], timeWindowHours: [168, 672], severityTier: 'critical',
      description: 'Rapidly progressive liver failure with encephalopathy, coagulopathy, and high mortality — transplant evaluation required.' },
    { name: 'Chronic hepatitis / cirrhosis', warningFeatures: ['fatigue', 'weight_loss', 'abdominal_distension'],
      riskFactors: ['hepatitis_b', 'hepatitis_c'], timeWindowHours: [4320, 86400], severityTier: 'moderate',
      description: 'Persistent inflammation leading to liver fibrosis, cirrhosis, and hepatocellular carcinoma risk.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['jaundice'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 3. PANCREATIC CANCER
// ═══════════════════════════════════════════════════════════════════════════════
export const pancreaticCancer: DiseaseNode = {
  id: 'pancreatic_cancer',
  name: 'Pancreatic Cancer',
  icdCode: 'C25.9',
  system: 'medical',
  organSystem: 'pancreatic',
  acuity: 'routine',
  acuityTier: 4,

  epidemiology: {
    ageMin: 40, ageMax: 95, agePeak: [60, 80],
    sexRisk: { male: 1.3, female: 1.0 },
    backgroundPrevalence: 0.005,
    riskFactors: [
      { featureId: 'smoking', label: 'Smoking', LR_positive: 2.5, prevalenceInDisease: 0.3 },
      { featureId: 'diabetes', label: 'New-onset diabetes', LR_positive: 2.0, prevalenceInDisease: 0.4 },
      { featureId: 'family_history_gi_cancer', label: 'Family history of pancreatic cancer', LR_positive: 3.0, prevalenceInDisease: 0.1 },
      { featureId: 'known_cancer', label: 'Personal cancer history', LR_positive: 2.0, prevalenceInDisease: 0.1 },
    ],
  },

  pathophysiology: {
    mechanism: 'Pancreatic adenocarcinoma arising from exocrine pancreatic ducts. Presents insidiously with epigastric pain radiating to back, weight loss, jaundice (if head of pancreas obstructs CBD), and new-onset diabetes. Most cases are advanced at diagnosis due to lack of early symptoms. Pain is dull, boring, and aggravated by eating.',
    timelineStages: [
      { stageId: 1, label: 'Early', typicalHoursFromOnset: [0, 720],
        dominantSymptoms: [sym('pain_initial_location', 0.7, 0.5), sym('pain_character', 0.6, 0.55),
          sym('pain_radiation', 0.5, 0.8), sym('weight_loss', 0.5, 0.85), sym('anorexia', 0.6, 0.5)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Dull, boring epigastric pain', painLocationTypical: 'Epigastrium',
        painRadiationTypical: 'Straight through to the back' },
      { stageId: 2, label: 'Advanced', typicalHoursFromOnset: [720, 4320],
        dominantSymptoms: [sym('pain_location_now', 0.8, 0.5), sym('weight_loss', 0.85, 0.85),
          sym('jaundice', 0.6, 0.85), sym('fatigue', 0.8, 0.5), sym('bowel_habits', 0.4, 0.6)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Constant, severe, boring', painLocationTypical: 'Epigastrium, may become generalised',
        painRadiationTypical: 'To back' },
    ],
    progressionRule: 'Insidious onset over weeks to months. Most patients present with advanced (unresectable) disease. Median survival is 6–12 months for advanced disease.',
  },

  features: {
    symptoms: [
      sym('pain_onset', 0.3, 0.5, { stageRelevance: [1] }),
      sym('pain_initial_location', 0.8, 0.5, { stageRelevance: [1] }),
      sym('pain_location_now', 0.8, 0.5, { stageRelevance: [2] }),
      sym('pain_character', 0.65, 0.55, { stageRelevance: [1, 2] }),
      sym('pain_severity', 0.6, 0.4, { stageRelevance: [1, 2] }),
      sym('pain_radiation', 0.6, 0.8, { stageRelevance: [1, 2] }),
      sym('pain_worsening_factors', 0.6, 0.5, { stageRelevance: [1, 2] }),
      sym('weight_loss', 0.85, 0.85, { stageRelevance: [1, 2] }),
      sym('jaundice', 0.6, 0.85, { stageRelevance: [2] }),
      sym('anorexia', 0.7, 0.5, { stageRelevance: [1, 2] }),
      sym('fatigue', 0.7, 0.5, { stageRelevance: [1, 2] }),
      sym('nausea', 0.5, 0.45, { stageRelevance: [1, 2] }),
      sym('vomiting', 0.4, 0.55, { stageRelevance: [2] }),
      sym('abdominal_distension', 0.3, 0.7, { stageRelevance: [2] }),
      sym('bowel_habits', 0.4, 0.6, { stageRelevance: [2] }),
      sym('constipation', 0.3, 0.7, { stageRelevance: [2] }),
      sym('previous_similar_episodes', 0.1, 0.75, { stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('weight_loss', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.15, label: 'No weight loss — pancreatic cancer unlikely' }),
    ],
    supporting: [
      sym('fever_chills', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.3, label: 'No fever — infection less likely than malignancy' }),
    ],
  },

  differential: {
    mimics: ['acute_pancreatitis', 'chronic_pancreatitis', 'cholecystitis', 'gastric_outlet_obstruction', 'hepatitis'],
    distinguishingFeatures: [
      { fromDiseaseId: 'acute_pancreatitis', featureIds: ['pain_onset', 'weight_loss', 'jaundice', 'fever'] },
      { fromDiseaseId: 'cholecystitis', featureIds: ['weight_loss', 'pain_character', 'pain_worsening_factors'] },
      { fromDiseaseId: 'gastric_outlet_obstruction', featureIds: ['pain_radiation', 'jaundice', 'weight_loss'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Biliary obstruction', warningFeatures: ['jaundice'],
      riskFactors: ['head_of_pancreas_tumour'], timeWindowHours: [720, 4320], severityTier: 'severe',
      description: 'Obstruction of common bile duct by tumour causing obstructive jaundice — stent or bypass required.' },
    { name: 'Duodenal obstruction', warningFeatures: ['vomiting', 'weight_loss'],
      riskFactors: ['advanced_tumour'], timeWindowHours: [2160, 8640], severityTier: 'severe',
      description: 'Tumour invasion of duodenum causing gastric outlet obstruction.' },
    { name: 'Venous thrombosis', warningFeatures: ['abdominal_distension', 'pain_location_now'],
      riskFactors: ['advanced_disease'], timeWindowHours: [1440, 8640], severityTier: 'severe',
      description: 'Pancreatic cancer is prothrombotic — splenic/portal vein thrombosis may occur.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['weight_loss', 'jaundice'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 4. SPLENIC INFARCT
// ═══════════════════════════════════════════════════════════════════════════════
export const splenicInfarct: DiseaseNode = {
  id: 'splenic_infarct',
  name: 'Splenic Infarct',
  icdCode: 'D73.5',
  system: 'medical',
  organSystem: 'splenic',
  acuity: 'urgent',
  acuityTier: 2,

  epidemiology: {
    ageMin: 20, ageMax: 85, agePeak: [40, 70],
    sexRisk: { male: 1.0, female: 1.0 },
    backgroundPrevalence: 0.001,
    riskFactors: [
      { featureId: 'htn_cad', label: 'Atrial fibrillation / embolic source', LR_positive: 4.0, prevalenceInDisease: 0.5 },
      { featureId: 'diabetes', label: 'Diabetes', LR_positive: 1.5, prevalenceInDisease: 0.2 },
      { featureId: 'smoking', label: 'Smoking', LR_positive: 1.5, prevalenceInDisease: 0.3 },
    ],
  },

  pathophysiology: {
    mechanism: 'Ischaemic necrosis of splenic parenchyma from arterial occlusion — embolus (endocarditis, atrial fibrillation), thrombosis (sickle cell disease, hypercoagulable state), or vasculitis. Presents with sudden severe LUQ pain that may radiate to the left shoulder (referred phrenic nerve irritation).',
    timelineStages: [
      { stageId: 1, label: 'Acute', typicalHoursFromOnset: [0, 6],
        dominantSymptoms: [sym('pain_onset', 0.85, 0.55), sym('pain_initial_location', 0.85, 0.5),
          sym('pain_character', 0.7, 0.6), sym('pain_radiation', 0.7, 0.8)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Sharp, severe LUQ pain', painLocationTypical: 'Left upper quadrant',
        painRadiationTypical: 'To left shoulder' },
      { stageId: 2, label: 'Organised', typicalHoursFromOnset: [6, 72],
        dominantSymptoms: [sym('pain_location_now', 0.7, 0.5), sym('fever', 0.5, 0.5),
          sym('nausea', 0.5, 0.45), sym('vomiting', 0.3, 0.55)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Persistent dull ache in LUQ', painLocationTypical: 'Left upper quadrant',
        painRadiationTypical: 'Left shoulder' },
    ],
    progressionRule: 'Pain peaks within hours and gradually subsides over days. Infarcted tissue may form a pseudocyst or abscess. Complications are rare but include splenic rupture and secondary infection.',
  },

  features: {
    symptoms: [
      sym('pain_onset', 0.85, 0.55, { stageRelevance: [1] }),
      sym('pain_initial_location', 0.85, 0.5, { stageRelevance: [1] }),
      sym('pain_location_now', 0.7, 0.5, { stageRelevance: [2] }),
      sym('pain_character', 0.7, 0.6, { stageRelevance: [1, 2] }),
      sym('pain_severity', 0.75, 0.4, { stageRelevance: [1, 2] }),
      sym('pain_radiation', 0.7, 0.8, { stageRelevance: [1, 2] }),
      sym('pain_worsening_factors', 0.3, 0.5, { stageRelevance: [1] }),
      sym('nausea', 0.5, 0.45, { stageRelevance: [2] }),
      sym('vomiting', 0.3, 0.55, { stageRelevance: [2] }),
      sym('fever', 0.5, 0.5, { stageRelevance: [2] }),
      sym('syncope', 0.2, 0.9, { stageRelevance: [2] }),
      sym('previous_similar_episodes', 0.2, 0.7, { stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('pain_radiation', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.15, label: 'No left shoulder radiation — splenic infarct less likely' }),
      sym('pain_onset', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.1, label: 'Gradual onset — splenic infarct unlikely' }),
    ],
    supporting: [
      sym('pain_initial_location', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.2, label: 'Pain not in LUQ — splenic pathology unlikely' }),
    ],
  },

  differential: {
    mimics: ['splenic_rupture', 'pancreatitis', 'mi', 'pulmonary_embolism', 'pleurisy'],
    distinguishingFeatures: [
      { fromDiseaseId: 'splenic_rupture', featureIds: ['syncope', 'pain_severity', 'peritonism', 'pain_onset'] },
      { fromDiseaseId: 'pancreatitis', featureIds: ['pain_initial_location', 'pain_radiation', 'alcohol_use'] },
      { fromDiseaseId: 'mi', featureIds: ['chest_pain', 'dyspnea', 'htn_cad'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Splenic abscess', warningFeatures: ['fever_chills', 'pain_location_now'],
      riskFactors: ['diabetes', 'immunocompromised'], timeWindowHours: [72, 336], severityTier: 'severe',
      description: 'Infected infarct cavity requiring drainage or splenectomy.' },
    { name: 'Delayed splenic rupture', warningFeatures: ['syncope', 'peritonism'],
      riskFactors: ['anticoagulant_use'], timeWindowHours: [72, 336], severityTier: 'critical',
      description: 'Necrotic tissue gives way causing intra-abdominal bleeding — surgical emergency.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['syncope'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 5. SPLENIC RUPTURE
// ═══════════════════════════════════════════════════════════════════════════════
export const splenicRupture: DiseaseNode = {
  id: 'splenic_rupture',
  name: 'Splenic Rupture',
  icdCode: 'S36.03',
  system: 'surgical',
  organSystem: 'splenic',
  acuity: 'immediately_life_threatening',
  acuityTier: 1,

  epidemiology: {
    ageMin: 1, ageMax: 85, agePeak: [20, 40],
    sexRisk: { male: 2.0, female: 1.0 },
    backgroundPrevalence: 0.001,
    riskFactors: [
      { featureId: 'anticoagulant_use', label: 'Anticoagulant use', LR_positive: 4.0, prevalenceInDisease: 0.1 },
      { featureId: 'htn_cad', label: 'Vascular risk factors', LR_positive: 1.5, prevalenceInDisease: 0.2 },
    ],
  },

  pathophysiology: {
    mechanism: 'Traumatic rupture of the spleen (blunt abdominal trauma, RTA, fall) causing intra-abdominal haemorrhage. The spleen is the most commonly injured organ in blunt abdominal trauma. Pain is in the LUQ with referred pain to the left shoulder (Kehr\'s sign — diaphragmatic irritation). Haemodynamic instability and hypovolaemic shock develop rapidly with significant blood loss.',
    timelineStages: [
      { stageId: 1, label: 'Acute rupture', typicalHoursFromOnset: [0, 2],
        dominantSymptoms: [sym('pain_onset', 0.9, 0.6), sym('pain_initial_location', 0.85, 0.5),
          sym('pain_radiation', 0.6, 0.8), sym('pain_severity', 0.9, 0.5), sym('syncope', 0.6, 0.9)],
        examFindings: [], severityTrajectory: 'rapidly_worsening',
        painCharacterTypical: 'Sudden, severe LUQ pain', painLocationTypical: 'Left upper quadrant',
        painRadiationTypical: 'Left shoulder (Kehr\'s sign)' },
      { stageId: 2, label: 'Haemorrhagic shock', typicalHoursFromOnset: [0, 2],
        dominantSymptoms: [sym('syncope', 0.85, 0.9), sym('peritonism', 0.7, 0.8),
          sym('pain_location_now', 0.7, 0.55), sym('nausea', 0.6, 0.45)],
        examFindings: [], severityTrajectory: 'rapidly_worsening',
        painCharacterTypical: 'Severe, diffuse abdominal pain', painLocationTypical: 'Left upper quadrant → diffuse',
        painRadiationTypical: 'Left shoulder' },
    ],
    progressionRule: 'Haemorrhage is rapid — hypovolaemic shock develops within minutes to hours. Mortality increases sharply without emergency splenectomy or embolisation.',
  },

  features: {
    symptoms: [
      sym('pain_onset', 0.9, 0.6, { stageRelevance: [1] }),
      sym('pain_initial_location', 0.85, 0.5, { stageRelevance: [1] }),
      sym('pain_location_now', 0.7, 0.55, { stageRelevance: [2] }),
      sym('pain_character', 0.5, 0.55, { stageRelevance: [1, 2] }),
      sym('pain_severity', 0.9, 0.5, { stageRelevance: [1, 2] }),
      sym('pain_radiation', 0.6, 0.8, { stageRelevance: [1, 2] }),
      sym('syncope', 0.85, 0.9, { stageRelevance: [1, 2] }),
      sym('peritonism', 0.7, 0.8, { stageRelevance: [2] }),
      sym('nausea', 0.6, 0.45, { stageRelevance: [1, 2] }),
      sym('vomiting', 0.4, 0.55, { stageRelevance: [2] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('pain_onset', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.05, label: 'Gradual onset — splenic rupture extremely unlikely' }),
      sym('syncope', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.1, label: 'No syncope or lightheadedness — significant haemorrhage unlikely' }),
    ],
    supporting: [
      sym('pain_initial_location', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.15, label: 'Pain not in LUQ — splenic injury unlikely' }),
    ],
  },

  differential: {
    mimics: ['splenic_infarct', 'pancreatitis', 'perforated_ulcer', 'aaa_rupture', 'ruptured_ectopic'],
    distinguishingFeatures: [
      { fromDiseaseId: 'splenic_infarct', featureIds: ['pain_onset', 'syncope', 'peritonism', 'pain_severity'] },
      { fromDiseaseId: 'pancreatitis', featureIds: ['pain_radiation', 'pain_initial_location', 'fever'] },
      { fromDiseaseId: 'perforated_ulcer', featureIds: ['pain_initial_location', 'pain_migration', 'peritonism'] },
    ],
    neverCloseConditions: ['aaa_rupture'],
  },

  complications: [
    { name: 'Haemorrhagic shock', warningFeatures: ['syncope', 'peritonism'],
      riskFactors: ['anticoagulant_use', 'delayed_treatment'], timeWindowHours: [0, 2], severityTier: 'critical',
      description: 'Life-threatening blood loss causing hypovolaemic shock — immediate fluid resuscitation and emergency splenectomy required.' },
    { name: 'Delayed rupture of subcapsular haematoma', warningFeatures: ['syncope', 'pain_onset'],
      riskFactors: ['conservative_management'], timeWindowHours: [24, 168], severityTier: 'critical',
      description: 'A contained splenic haematoma ruptures days later causing delayed haemorrhage.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['syncope', 'peritonism'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 6. ALCOHOLIC HEPATITIS
// ═══════════════════════════════════════════════════════════════════════════════
export const alcoholicHepatitis: DiseaseNode = {
  id: 'alcoholic_hepatitis',
  name: 'Alcoholic Hepatitis',
  icdCode: 'K70.1',
  system: 'medical',
  organSystem: 'hepatobiliary',
  acuity: 'semi_urgent',
  acuityTier: 3,

  epidemiology: {
    ageMin: 25, ageMax: 80, agePeak: [40, 60],
    sexRisk: { male: 1.5, female: 1.0 },
    backgroundPrevalence: 0.008,
    riskFactors: [
      { featureId: 'alcohol_use', label: 'Heavy alcohol use', LR_positive: 10.0, prevalenceInDisease: 0.95 },
      { featureId: 'smoking', label: 'Smoking', LR_positive: 2.0, prevalenceInDisease: 0.5 },
      { featureId: 'diabetes', label: 'Diabetes', LR_positive: 1.5, prevalenceInDisease: 0.2 },
    ],
  },

  pathophysiology: {
    mechanism: 'Acute liver inflammation in patients with heavy alcohol use. Ethanol metabolism generates toxic acetaldehyde and reactive oxygen species, triggering hepatocyte injury, steatosis, and inflammation. Presents with RUQ pain, jaundice, fever, and signs of hepatic decompensation (ascites, coagulopathy). Severe cases can progress to acute-on-chronic liver failure with high mortality.',
    timelineStages: [
      { stageId: 1, label: 'Acute', typicalHoursFromOnset: [0, 168],
        dominantSymptoms: [sym('pain_initial_location', 0.7, 0.5), sym('jaundice', 0.7, 0.85),
          sym('fever', 0.6, 0.5), sym('nausea', 0.6, 0.45), sym('anorexia', 0.7, 0.5), sym('fatigue', 0.8, 0.5)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Dull RUQ ache', painLocationTypical: 'Right upper quadrant',
        painRadiationTypical: 'None' },
      { stageId: 2, label: 'Decompensated', typicalHoursFromOnset: [168, 672],
        dominantSymptoms: [sym('abdominal_distension', 0.7, 0.7), sym('weight_loss', 0.6, 0.8),
          sym('jaundice', 0.9, 0.85), sym('fatigue', 0.9, 0.5), sym('syncope', 0.3, 0.9)],
        examFindings: [], severityTrajectory: 'rapidly_worsening',
        painCharacterTypical: 'Persistent dull RUQ ache', painLocationTypical: 'Right upper quadrant ± diffuse distension',
        painRadiationTypical: 'None' },
    ],
    progressionRule: 'Acute alcoholic hepatitis develops over days to weeks after a period of heavy drinking. Decompensation with ascites, jaundice, and coagulopathy indicates severe disease (Maddrey DF >32) requiring steroid therapy.',
  },

  features: {
    symptoms: [
      sym('pain_onset', 0.4, 0.5, { stageRelevance: [1] }),
      sym('pain_initial_location', 0.7, 0.5, { stageRelevance: [1] }),
      sym('pain_location_now', 0.6, 0.5, { stageRelevance: [2] }),
      sym('pain_character', 0.4, 0.5, { stageRelevance: [1, 2] }),
      sym('pain_severity', 0.4, 0.4, { stageRelevance: [1, 2] }),
      sym('jaundice', 0.85, 0.85, { stageRelevance: [1, 2] }),
      sym('fever', 0.6, 0.5, { stageRelevance: [1] }),
      sym('nausea', 0.6, 0.45, { stageRelevance: [1, 2] }),
      sym('vomiting', 0.4, 0.55, { stageRelevance: [2] }),
      sym('anorexia', 0.7, 0.5, { stageRelevance: [1, 2] }),
      sym('fatigue', 0.85, 0.5, { stageRelevance: [1, 2] }),
      sym('abdominal_distension', 0.7, 0.7, { stageRelevance: [2] }),
      sym('weight_loss', 0.6, 0.8, { stageRelevance: [2] }),
      sym('syncope', 0.3, 0.9, { stageRelevance: [2] }),
      sym('previous_similar_episodes', 0.5, 0.7, { stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('jaundice', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.1, label: 'No jaundice — alcoholic hepatitis unlikely' }),
      sym('alcohol_use', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.05, label: 'No heavy alcohol use — alcoholic hepatitis extremely unlikely' }),
    ],
    supporting: [
      sym('fever_chills', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.4, label: 'No rigors — supports alcoholic hepatitis over cholangitis' }),
    ],
  },

  differential: {
    mimics: ['hepatitis', 'cholangitis', 'acute_cholecystitis', 'pancreatitis', 'drug_induced_liver_injury'],
    distinguishingFeatures: [
      { fromDiseaseId: 'hepatitis', featureIds: ['alcohol_use', 'abdominal_distension', 'pain_severity'] },
      { fromDiseaseId: 'cholangitis', featureIds: ['fever_chills', 'pain_severity', 'alcohol_use'] },
      { fromDiseaseId: 'acute_cholecystitis', featureIds: ['alcohol_use', 'fever_chills', 'jaundice'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Acute-on-chronic liver failure', warningFeatures: ['jaundice', 'syncope', 'abdominal_distension'],
      riskFactors: ['ongoing_alcohol_use', 'infection'], timeWindowHours: [168, 672], severityTier: 'critical',
      description: 'Rapid decompensation with jaundice, ascites, coagulopathy, and encephalopathy — high mortality without liver transplant.' },
    { name: 'Hepatorenal syndrome', warningFeatures: ['oliguria', 'abdominal_distension'],
      riskFactors: ['cirrhosis'], timeWindowHours: [336, 1440], severityTier: 'critical',
      description: 'Functional renal failure in severe liver disease requiring vasoconstrictor therapy and liver transplant evaluation.' },
    { name: 'Ascites / spontaneous bacterial peritonitis', warningFeatures: ['abdominal_distension', 'fever', 'peritonism'],
      riskFactors: ['cirrhosis'], timeWindowHours: [336, 4320], severityTier: 'severe',
      description: 'Fluid accumulation in peritoneal cavity with risk of bacterial superinfection.' },
  ],

  clinicalScores: [{
    name: 'Maddrey Discriminant Function',
    items: [
      { featureId: 'jaundice', label: 'Bilirubin elevation', pointsWhenPresent: 1 },
      { featureId: 'abdominal_distension', label: 'Ascites', pointsWhenPresent: 1 },
      { featureId: 'syncope', label: 'Encephalopathy', pointsWhenPresent: 2 },
    ],
    interpretationThresholds: [
      { maxScore: 1, label: 'Mild disease — supportive care' },
      { maxScore: 3, label: 'Moderate disease — consider steroids' },
      { maxScore: 5, label: 'Severe disease (DF >32) — steroids strongly indicated' },
    ],
    maxScore: 5,
  }],

  redFlagFeatureIds: ['jaundice', 'syncope'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// Hepatobiliary disease index
// ═══════════════════════════════════════════════════════════════════════════════
export const HEPATOBILIARY_NODES: DiseaseNode[] = [
  cholangitis,
  hepatitis,
  pancreaticCancer,
  splenicInfarct,
  splenicRupture,
  alcoholicHepatitis,
];
