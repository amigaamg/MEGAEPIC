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

const dka: DiseaseNode = {
  id: 'dka',
  name: 'Diabetic Ketoacidosis',
  icdCode: 'E10.1',
  system: 'medical',
  organSystem: 'metabolic',
  acuity: 'immediately_life_threatening',
  acuityTier: 1,

  epidemiology: {
    ageMin: 1, ageMax: 90, agePeak: [10, 40],
    sexRisk: { male: 1.0, female: 1.0 },
    backgroundPrevalence: 0.003,
    riskFactors: [
      { featureId: 'diabetes', label: 'Type 1 diabetes mellitus', LR_positive: 25.0, prevalenceInDisease: 0.95 },
    ],
  },

  pathophysiology: {
    mechanism: 'Absolute or relative insulin deficiency leads to unchecked lipolysis and ketogenesis, producing metabolic acidosis (ketonaemia, ketonuria). Hyperglycaemia causes osmotic diuresis (polyuria, polydipsia, dehydration). Abdominal pain occurs in ~50% of cases, likely from gastric distension, electrolyte disturbances, and peritoneal irritation from ketones. Kussmaul respirations represent compensatory respiratory alkalosis. Untreated, progresses to altered consciousness, shock, and death.',
    timelineStages: [
      { stageId: 1, label: 'Mild to moderate DKA', typicalHoursFromOnset: [0, 24],
        dominantSymptoms: [sym('polydipsia', 0.85, 0.75), sym('polyuria', 0.85, 0.75),
          sym('pain_onset', 0.6, 0.55), sym('nausea', 0.7, 0.5), sym('fatigue', 0.7, 0.5)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Vague ache or cramping', painLocationTypical: 'Diffuse — all over',
        painRadiationTypical: 'None' },
      { stageId: 2, label: 'Severe DKA', typicalHoursFromOnset: [24, 48],
        dominantSymptoms: [sym('vomiting', 0.65, 0.55), sym('dyspnea', 0.5, 0.9),
          sym('anorexia', 0.75, 0.5), sym('syncope', 0.3, 0.9)],
        examFindings: [], severityTrajectory: 'rapidly_worsening',
        painCharacterTypical: 'Persistent vague ache', painLocationTypical: 'Diffuse — all over',
        painRadiationTypical: 'None' },
    ],
    progressionRule: 'Untreated mild DKA progresses to severe DKA over 12–24h. Severe DKA can lead to cerebral oedema, shock, and death without prompt insulin and fluid therapy.',
  },

  features: {
    symptoms: [
      sym('pain_onset', 0.6, 0.55, { stageRelevance: [1] }),
      sym('pain_initial_location', 0.5, 0.55, { stageRelevance: [1] }),
      sym('pain_character', 0.5, 0.5, { stageRelevance: [1, 2] }),
      sym('nausea', 0.7, 0.5, { stageRelevance: [1] }),
      sym('vomiting', 0.65, 0.55, { stageRelevance: [1, 2] }),
      sym('anorexia', 0.75, 0.5, { stageRelevance: [1, 2] }),
      sym('polydipsia', 0.85, 0.75, { stageRelevance: [1, 2] }),
      sym('polyuria', 0.85, 0.75, { stageRelevance: [1, 2] }),
      sym('previous_similar_episodes', 0.5, 0.7, { stageRelevance: [1] }),
      sym('fatigue', 0.7, 0.5, { stageRelevance: [1, 2] }),
      sym('dyspnea', 0.5, 0.9, { stageRelevance: [2] }),
      sym('syncope', 0.3, 0.9, { stageRelevance: [2] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('polydipsia', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.05, label: 'No polydipsia — DKA very unlikely in a diabetic patient' }),
    ],
    supporting: [
      sym('pain_migration', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.5, label: 'No pain migration — not typical of acute surgical abdomen' }),
    ],
  },

  differential: {
    mimics: ['acute_pancreatitis', 'gastroenteritis', 'appendicitis', 'hypercalcaemia'],
    distinguishingFeatures: [
      { fromDiseaseId: 'acute_pancreatitis', featureIds: ['polydipsia', 'polyuria', 'diabetes', 'pain_radiation'] },
      { fromDiseaseId: 'appendicitis', featureIds: ['polydipsia', 'polyuria', 'pain_migration', 'pain_location_now'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Cerebral oedema', warningFeatures: ['syncope', 'dyspnea'],
      riskFactors: ['age<18', 'severe_acidosis'], timeWindowHours: [12, 48], severityTier: 'critical',
      description: 'Potentially fatal brain swelling during DKA treatment — most common in children.' },
    { name: 'Hypokalaemia', warningFeatures: ['fatigue', 'dyspnea'],
      riskFactors: ['insulin_therapy'], timeWindowHours: [4, 24], severityTier: 'severe',
      description: 'Life-threatening potassium shifts during insulin therapy requiring careful monitoring.' },
    { name: 'Shock', warningFeatures: ['syncope'],
      riskFactors: ['age>60', 'severe_dehydration'], timeWindowHours: [24, 48], severityTier: 'critical',
      description: 'Hypovolaemic shock from severe dehydration and acidosis.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['syncope', 'dyspnea'],
};

const porphyria: DiseaseNode = {
  id: 'porphyria',
  name: 'Acute Intermittent Porphyria',
  icdCode: 'E80.2',
  system: 'metabolic',
  organSystem: 'metabolic',
  acuity: 'urgent',
  acuityTier: 2,

  epidemiology: {
    ageMin: 15, ageMax: 60, agePeak: [20, 40],
    sexRisk: { male: 0.5, female: 1.5 },
    backgroundPrevalence: 0.0005,
    riskFactors: [
      { featureId: 'family_history_gi_cancer', label: 'Family history of porphyria', LR_positive: 10.0, prevalenceInDisease: 0.5 },
      { featureId: 'alcohol_use', label: 'Alcohol use (trigger)', LR_positive: 3.0, prevalenceInDisease: 0.4 },
      { featureId: 'smoking', label: 'Smoking (trigger)', LR_positive: 2.0, prevalenceInDisease: 0.3 },
    ],
  },

  pathophysiology: {
    mechanism: 'Autosomal dominant deficiency of porphobilinogen deaminase (PBGD) in haem biosynthesis leads to accumulation of porphobilinogen and delta-aminolevulinic acid. These neurotoxic precursors cause autonomic neuropathy (abdominal pain, tachycardia, hypertension, constipation) and central nervous system dysfunction (psychosis, seizures, peripheral neuropathy). Attacks are triggered by drugs, alcohol, fasting, hormones, and stress. Pain is severe and colicky, but the abdomen remains soft — a critical distinguishing feature from surgical emergencies.',
    timelineStages: [
      { stageId: 1, label: 'Acute attack (0–7 days)', typicalHoursFromOnset: [0, 168],
        dominantSymptoms: [sym('pain_onset', 0.8, 0.6), sym('pain_character', 0.85, 0.7),
          sym('pain_severity', 0.9, 0.5), sym('nausea', 0.7, 0.5), sym('constipation', 0.7, 0.75)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Severe colicky or cramping', painLocationTypical: 'Diffuse — all over',
        painRadiationTypical: 'None' },
      { stageId: 2, label: 'Recovery', typicalHoursFromOnset: [168, 336],
        dominantSymptoms: [sym('pain_severity', 0.3, 0.6), sym('fatigue', 0.7, 0.5)],
        examFindings: [], severityTrajectory: 'improving',
        painCharacterTypical: 'Gradually resolving', painLocationTypical: 'Diffuse',
        painRadiationTypical: 'None' },
    ],
    progressionRule: 'Acute attacks last 5–7 days. Resolution is gradual over days to weeks. Recurrence is common with triggers.',
  },

  features: {
    symptoms: [
      sym('pain_onset', 0.8, 0.6, { stageRelevance: [1] }),
      sym('pain_initial_location', 0.6, 0.5, { stageRelevance: [1] }),
      sym('pain_character', 0.85, 0.7, { stageRelevance: [1] }),
      sym('pain_severity', 0.9, 0.5, { stageRelevance: [1, 2] }),
      sym('nausea', 0.7, 0.5, { stageRelevance: [1] }),
      sym('vomiting', 0.6, 0.55, { stageRelevance: [1] }),
      sym('constipation', 0.7, 0.75, { stageRelevance: [1] }),
      sym('obstipation', 0.5, 0.85, { stageRelevance: [1] }),
      sym('syncope', 0.4, 0.85, { stageRelevance: [1] }),
      sym('previous_similar_episodes', 0.7, 0.7, { stageRelevance: [1] }),
      sym('joint_pain', 0.5, 0.7, { stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('peritonism', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.05, label: 'Soft, non-tender abdomen despite severe pain — porphyria hallmark' }),
    ],
    supporting: [
      sym('pain_migration', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.4, label: 'No migration pattern — not typical surgical abdomen' }),
    ],
  },

  differential: {
    mimics: ['acute_appendicitis', 'intestinal_obstruction', 'pancreatitis', 'perforated_peptic_ulcer', 'sickle_cell_crisis'],
    distinguishingFeatures: [
      { fromDiseaseId: 'acute_appendicitis', featureIds: ['peritonism', 'pain_migration', 'pain_location_now', 'constipation'] },
      { fromDiseaseId: 'intestinal_obstruction', featureIds: ['obstipation', 'abdominal_distension', 'peritonism'] },
      { fromDiseaseId: 'pancreatitis', featureIds: ['pain_radiation', 'pain_initial_location'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Respiratory paralysis', warningFeatures: ['dyspnea'],
      riskFactors: ['severe_neuropathy'], timeWindowHours: [72, 336], severityTier: 'critical',
      description: 'Ascending paralysis from severe neuropathy can lead to respiratory failure requiring ventilation.' },
    { name: 'Hypertensive crisis', warningFeatures: ['syncope'],
      riskFactors: ['renal_impairment'], timeWindowHours: [24, 168], severityTier: 'severe',
      description: 'Autonomic instability can cause dangerous hypertension.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['syncope'],
};

const sickleCellCrisis: DiseaseNode = {
  id: 'sickle_cell_crisis',
  name: 'Sickle Cell Crisis',
  icdCode: 'D57.0',
  system: 'haematological',
  organSystem: 'haematological',
  acuity: 'urgent',
  acuityTier: 2,

  epidemiology: {
    ageMin: 1, ageMax: 40, agePeak: [2, 25],
    sexRisk: { male: 1.0, female: 1.0 },
    backgroundPrevalence: 0.005,
    geographicFlags: ['endemic_malaria', 'tropical'],
    riskFactors: [
      { featureId: 'previous_similar_episodes', label: 'Known sickle cell disease with prior crises', LR_positive: 15.0, prevalenceInDisease: 0.9 },
    ],
  },

  pathophysiology: {
    mechanism: 'In sickle cell disease, haemoglobin S polymerises under hypoxic conditions, causing red blood cells to deform into sickle shapes. These rigid cells occlude small blood vessels, leading to ischaemia-reperfusion injury, infarction, and severe pain in bones, chest, and abdomen. Vaso-occlusion triggers a vicious cycle of inflammation, endothelial activation, and further sickling. Triggers include infection, dehydration, cold, and hypoxia. Acute chest syndrome is a life-threatening pulmonary complication.',
    timelineStages: [
      { stageId: 1, label: 'Acute crisis (0–7 days)', typicalHoursFromOnset: [0, 168],
        dominantSymptoms: [sym('pain_onset', 0.8, 0.55), sym('pain_severity', 0.9, 0.5),
          sym('pain_character', 0.85, 0.6), sym('fever', 0.5, 0.6), sym('fatigue', 0.7, 0.5)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Severe, constant, sharp', painLocationTypical: 'Variable — any location',
        painRadiationTypical: 'None' },
      { stageId: 2, label: 'Resolving', typicalHoursFromOnset: [168, 336],
        dominantSymptoms: [sym('pain_severity', 0.3, 0.6), sym('fatigue', 0.6, 0.5)],
        examFindings: [], severityTrajectory: 'improving',
        painCharacterTypical: 'Gradually improving', painLocationTypical: 'Variable',
        painRadiationTypical: 'None' },
    ],
    progressionRule: 'Crises typically last 5–7 days. Acute chest syndrome may develop within 24–72h of onset. Recurrence is common, with frequency varying widely between patients.',
  },

  features: {
    symptoms: [
      sym('pain_onset', 0.8, 0.55, { stageRelevance: [1] }),
      sym('pain_initial_location', 0.5, 0.5, { stageRelevance: [1] }),
      sym('pain_character', 0.85, 0.6, { stageRelevance: [1] }),
      sym('pain_severity', 0.9, 0.5, { stageRelevance: [1, 2] }),
      sym('previous_similar_episodes', 0.85, 0.75, { stageRelevance: [1] }),
      sym('fever', 0.5, 0.6, { stageRelevance: [1] }),
      sym('nausea', 0.5, 0.5, { stageRelevance: [1] }),
      sym('vomiting', 0.4, 0.55, { stageRelevance: [1] }),
      sym('abdominal_distension', 0.3, 0.7, { stageRelevance: [1] }),
      sym('joint_pain', 0.6, 0.7, { stageRelevance: [1] }),
      sym('fatigue', 0.7, 0.5, { stageRelevance: [1, 2] }),
      sym('chest_pain', 0.3, 0.85, { stageRelevance: [1] }),
      sym('dyspnea', 0.25, 0.85, { stageRelevance: [1] }),
      sym('skin_rash', 0.2, 0.85, { stageRelevance: [2] }),
      sym('htn_cad', 0.05, 0.65, { stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('previous_similar_episodes', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.05, label: 'No history of prior sickle cell crises — first presentation possible but rare' }),
    ],
    supporting: [
      sym('pain_migration', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.5, label: 'No pain migration — not typical of appendicitis' }),
    ],
  },

  differential: {
    mimics: ['acute_appendicitis', 'porphyria', 'pancreatitis', 'osteomyelitis', 'acute_chest_syndrome'],
    distinguishingFeatures: [
      { fromDiseaseId: 'acute_appendicitis', featureIds: ['previous_similar_episodes', 'pain_migration', 'joint_pain', 'skin_rash'] },
      { fromDiseaseId: 'porphyria', featureIds: ['joint_pain', 'chest_pain', 'dyspnea', 'skin_rash'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Acute chest syndrome', warningFeatures: ['chest_pain', 'dyspnea', 'fever'],
      riskFactors: ['infection', 'cold_exposure'], timeWindowHours: [24, 72], severityTier: 'critical',
      description: 'Pulmonary vaso-occlusion causing hypoxia, infiltrates on CXR, and respiratory failure — leading cause of death in SCD.' },
    { name: 'Splenic sequestration', warningFeatures: ['syncope', 'abdominal_distension'],
      riskFactors: ['age<5'], timeWindowHours: [24, 48], severityTier: 'critical',
      description: 'Sudden splenic enlargement trapping large blood volume — rapid fall in haemoglobin and shock.' },
    { name: 'Stroke', warningFeatures: ['syncope'],
      riskFactors: ['prior_stroke', 'abnormal_doppler'], timeWindowHours: [24, 168], severityTier: 'critical',
      description: 'Cerebral vaso-occlusion causing ischaemic stroke — more common in children with SCD.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['syncope', 'chest_pain', 'dyspnea'],
};

const addisonianCrisis: DiseaseNode = {
  id: 'addisonian_crisis',
  name: 'Addisonian Crisis',
  icdCode: 'E27.2',
  system: 'endocrine',
  organSystem: 'endocrine',
  acuity: 'immediately_life_threatening',
  acuityTier: 1,

  epidemiology: {
    ageMin: 1, ageMax: 90, agePeak: [20, 60],
    sexRisk: { male: 1.0, female: 1.0 },
    backgroundPrevalence: 0.0005,
    riskFactors: [
      { featureId: 'steroid_use', label: 'Chronic steroid use (suppression)', LR_positive: 8.0, prevalenceInDisease: 0.4 },
      { featureId: 'hiv_status', label: 'HIV / immunocompromised', LR_positive: 3.0, prevalenceInDisease: 0.15 },
    ],
  },

  pathophysiology: {
    mechanism: 'Acute adrenal insufficiency results from failure of the adrenal cortex to produce sufficient cortisol and aldosterone. This is most commonly due to sudden withdrawal of exogenous steroids in a patient with suppressed adrenal axis, or acute bilateral adrenal destruction (haemorrhage, infarction, infection). Cortisol deficiency leads to hypotension, hypoglycaemia, and impaired stress response. Aldosterone deficiency causes hyponatraemia, hyperkalaemia, and volume depletion. Abdominal pain is common and likely due to splanchnic hypoperfusion and electrolyte disturbances. Hyperpigmentation (if chronic) results from elevated ACTH.',
    timelineStages: [
      { stageId: 1, label: 'Incipient (0–24 hours)', typicalHoursFromOnset: [0, 24],
        dominantSymptoms: [sym('pain_onset', 0.5, 0.55), sym('fatigue', 0.85, 0.5),
          sym('nausea', 0.7, 0.5), sym('anorexia', 0.7, 0.5)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Dull cramping', painLocationTypical: 'Diffuse — all over',
        painRadiationTypical: 'None' },
      { stageId: 2, label: 'Crisis (24–48 hours)', typicalHoursFromOnset: [24, 48],
        dominantSymptoms: [sym('vomiting', 0.7, 0.55), sym('syncope', 0.7, 0.9),
          sym('weight_loss', 0.4, 0.85), sym('skin_rash', 0.5, 0.85)],
        examFindings: [], severityTrajectory: 'rapidly_worsening',
        painCharacterTypical: 'Severe cramping', painLocationTypical: 'Diffuse',
        painRadiationTypical: 'None' },
    ],
    progressionRule: 'Incipient stage may be subtle. Crisis develops over 24–48h, often precipitated by infection, surgery, or stress. Untreated, leads to refractory shock and death.',
  },

  features: {
    symptoms: [
      sym('pain_onset', 0.5, 0.55, { stageRelevance: [1] }),
      sym('pain_initial_location', 0.5, 0.5, { stageRelevance: [1] }),
      sym('pain_character', 0.5, 0.5, { stageRelevance: [1] }),
      sym('nausea', 0.7, 0.5, { stageRelevance: [1] }),
      sym('vomiting', 0.7, 0.55, { stageRelevance: [2] }),
      sym('anorexia', 0.7, 0.5, { stageRelevance: [1] }),
      sym('fatigue', 0.85, 0.5, { stageRelevance: [1, 2] }),
      sym('weight_loss', 0.4, 0.85, { stageRelevance: [2] }),
      sym('previous_similar_episodes', 0.4, 0.7, { stageRelevance: [1] }),
      sym('syncope', 0.7, 0.9, { stageRelevance: [2] }),
      sym('skin_rash', 0.5, 0.85, { stageRelevance: [2] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('syncope', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.1, label: 'No hypotension or syncope — addisonian crisis unlikely' }),
    ],
    supporting: [
      sym('fever', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.4, label: 'Absence of fever suggests non-infectious cause' }),
    ],
  },

  differential: {
    mimics: ['dka', 'septic_shock', 'gastroenteritis', 'hypercalcaemia'],
    distinguishingFeatures: [
      { fromDiseaseId: 'dka', featureIds: ['polydipsia', 'polyuria', 'diabetes', 'skin_rash'] },
      { fromDiseaseId: 'gastroenteritis', featureIds: ['syncope', 'weight_loss', 'skin_rash', 'diarrhea'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Refractory shock', warningFeatures: ['syncope'],
      riskFactors: ['delayed_treatment', 'sepsis'], timeWindowHours: [24, 48], severityTier: 'critical',
      description: 'Vascular collapse unresponsive to fluids and vasopressors without glucocorticoid replacement.' },
    { name: 'Hypoglycaemia', warningFeatures: ['syncope'],
      riskFactors: ['fasting', 'alcohol_use'], timeWindowHours: [12, 24], severityTier: 'severe',
      description: 'Cortisol deficiency impairs gluconeogenesis, leading to dangerous hypoglycaemia.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['syncope'],
};

const hypercalcaemia: DiseaseNode = {
  id: 'hypercalcaemia',
  name: 'Hypercalcaemia',
  icdCode: 'E83.5',
  system: 'metabolic',
  organSystem: 'metabolic',
  acuity: 'semi_urgent',
  acuityTier: 3,

  epidemiology: {
    ageMin: 20, ageMax: 90, agePeak: [50, 75],
    sexRisk: { male: 1.0, female: 1.2 },
    backgroundPrevalence: 0.002,
    riskFactors: [
      { featureId: 'known_cancer', label: 'Known malignancy', LR_positive: 8.0, prevalenceInDisease: 0.4 },
      { featureId: 'htn_cad', label: 'Hypertension (hyperparathyroidism association)', LR_positive: 2.0, prevalenceInDisease: 0.3 },
    ],
  },

  pathophysiology: {
    mechanism: 'Elevated serum calcium (>10.5 mg/dL) most commonly from hyperparathyroidism or malignancy (bone metastases, PTHrP secretion). Hypercalcaemia depresses neuromuscular excitability, causing fatigue, confusion, and constipation. It impairs renal concentrating ability (polyuria, polydipsia) and gastric motility (nausea, vomiting, anorexia). Abdominal pain is vague and non-specific. Severe hypercalcaemia (>14 mg/dL) can cause altered mental status, syncope, and cardiac arrhythmias.',
    timelineStages: [
      { stageId: 1, label: 'Moderate hypercalcaemia', typicalHoursFromOnset: [0, 168],
        dominantSymptoms: [sym('pain_onset', 0.4, 0.55), sym('constipation', 0.6, 0.75),
          sym('fatigue', 0.7, 0.5), sym('polydipsia', 0.6, 0.75)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Vague, non-specific ache', painLocationTypical: 'Diffuse',
        painRadiationTypical: 'None' },
      { stageId: 2, label: 'Severe hypercalcaemia (>14 mg/dL)', typicalHoursFromOnset: [168, 336],
        dominantSymptoms: [sym('vomiting', 0.5, 0.55), sym('syncope', 0.3, 0.9),
          sym('weight_loss', 0.4, 0.85), sym('polyuria', 0.7, 0.75)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Persistent vague ache', painLocationTypical: 'Diffuse',
        painRadiationTypical: 'None' },
    ],
    progressionRule: 'Hypercalcaemia develops gradually over weeks. Severe hypercalcaemia (>14 mg/dL) constitutes a medical emergency requiring aggressive IV fluids and calcitonin/bisphosphonates.',
  },

  features: {
    symptoms: [
      sym('pain_onset', 0.4, 0.55, { stageRelevance: [1] }),
      sym('pain_character', 0.4, 0.5, { stageRelevance: [1] }),
      sym('constipation', 0.6, 0.75, { stageRelevance: [1] }),
      sym('obstipation', 0.3, 0.85, { stageRelevance: [2] }),
      sym('nausea', 0.5, 0.5, { stageRelevance: [1] }),
      sym('vomiting', 0.5, 0.55, { stageRelevance: [1, 2] }),
      sym('anorexia', 0.6, 0.5, { stageRelevance: [1] }),
      sym('fatigue', 0.7, 0.5, { stageRelevance: [1, 2] }),
      sym('weight_loss', 0.4, 0.85, { stageRelevance: [2] }),
      sym('polydipsia', 0.6, 0.75, { stageRelevance: [1, 2] }),
      sym('polyuria', 0.7, 0.75, { stageRelevance: [1, 2] }),
      sym('known_cancer', 0.4, 0.85, { stageRelevance: [1] }),
      sym('previous_similar_episodes', 0.3, 0.7, { stageRelevance: [1] }),
      sym('syncope', 0.3, 0.9, { stageRelevance: [2] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('constipation', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.2, label: 'Normal bowel habits — hypercalcaemia less likely' }),
    ],
    supporting: [
      sym('pain_severity', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.4, label: 'Mild pain not typical of surgical causes' }),
    ],
  },

  differential: {
    mimics: ['dka', 'addisonian_crisis', 'porphyria', 'pancreatitis', 'constipation'],
    distinguishingFeatures: [
      { fromDiseaseId: 'dka', featureIds: ['diabetes', 'polydipsia', 'polyuria', 'known_cancer'] },
      { fromDiseaseId: 'addisonian_crisis', featureIds: ['syncope', 'skin_rash', 'weight_loss', 'steroid_use'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Cardiac arrhythmia', warningFeatures: ['syncope'],
      riskFactors: ['pre_existing_heart_disease', 'hypokalaemia'], timeWindowHours: [24, 72], severityTier: 'critical',
      description: 'Hypercalcaemia shortens QT interval and can precipitate ventricular arrhythmias.' },
    { name: 'Acute kidney injury', warningFeatures: ['polyuria', 'syncope'],
      riskFactors: ['dehydration', 'nsaid_use'], timeWindowHours: [48, 168], severityTier: 'severe',
      description: 'Calcium deposition in renal tubules and prerenal azotaemia from dehydration.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['syncope'],
};

const typhoid: DiseaseNode = {
  id: 'typhoid',
  name: 'Typhoid Ileitis',
  icdCode: 'A01.0',
  system: 'infectious',
  organSystem: 'infectious',
  acuity: 'urgent',
  acuityTier: 2,

  epidemiology: {
    ageMin: 1, ageMax: 40, agePeak: [5, 30],
    sexRisk: { male: 1.0, female: 1.0 },
    backgroundPrevalence: 0.002,
    geographicFlags: ['endemic_typhoid', 'tropical'],
    riskFactors: [
      { featureId: 'recent_travel', label: 'Travel to endemic area', LR_positive: 8.0, prevalenceInDisease: 0.7 },
      { featureId: 'hiv_status', label: 'Immunocompromised', LR_positive: 3.0, prevalenceInDisease: 0.1 },
    ],
  },

  pathophysiology: {
    mechanism: 'Salmonella typhi is ingested via contaminated food or water, invades the intestinal mucosa via Peyer\'s patches, and disseminates to the reticuloendothelial system. After an incubation period of 7–14 days, bacteraemia causes stepwise rising fever (daily step-ladder pattern), headache, and malaise. In the second week, inflammation and hyperplasia of Peyer\'s patches in the terminal ileum cause abdominal pain and either diarrhoea (pea-soup) or constipation. Untreated, the inflamed Peyer\'s patches can ulcerate and perforate, causing peritonitis.',
    timelineStages: [
      { stageId: 1, label: 'First week (fever rises)', typicalHoursFromOnset: [0, 168],
        dominantSymptoms: [sym('pain_onset', 0.5, 0.55), sym('fever', 0.9, 0.6),
          sym('fever_chills', 0.5, 0.85), sym('syncope', 0.3, 0.8)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Mild cramping', painLocationTypical: 'Diffuse, worse in RLQ',
        painRadiationTypical: 'None' },
      { stageId: 2, label: 'Second week (abdominal peak)', typicalHoursFromOnset: [168, 336],
        dominantSymptoms: [sym('pain_initial_location', 0.6, 0.5), sym('diarrhea', 0.6, 0.6),
          sym('constipation', 0.3, 0.7), sym('nausea', 0.6, 0.5), sym('vomiting', 0.4, 0.55)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Cramping, diffuse', painLocationTypical: 'Diffuse, worse in RLQ',
        painRadiationTypical: 'None' },
    ],
    progressionRule: 'First week: fever rises stepwise. Second week: abdominal symptoms peak, rose spots may appear on trunk. Intestinal perforation typically occurs in the third week if untreated.',
  },

  features: {
    symptoms: [
      sym('pain_onset', 0.5, 0.55, { stageRelevance: [1] }),
      sym('pain_initial_location', 0.6, 0.5, { stageRelevance: [2] }),
      sym('pain_character', 0.5, 0.5, { stageRelevance: [1, 2] }),
      sym('fever', 0.9, 0.6, { stageRelevance: [1, 2] }),
      sym('fever_chills', 0.5, 0.85, { stageRelevance: [2] }),
      sym('diarrhea', 0.6, 0.6, { stageRelevance: [2] }),
      sym('constipation', 0.3, 0.7, { stageRelevance: [1, 2] }),
      sym('nausea', 0.6, 0.5, { stageRelevance: [1, 2] }),
      sym('vomiting', 0.4, 0.55, { stageRelevance: [2] }),
      sym('anorexia', 0.7, 0.5, { stageRelevance: [1, 2] }),
      sym('syncope', 0.3, 0.8, { stageRelevance: [1] }),
      sym('recent_travel', 0.7, 0.8, { stageRelevance: [1] }),
      sym('hiv_status', 0.2, 0.85, { stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('fever', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.05, label: 'No fever — typhoid very unlikely' }),
    ],
    supporting: [
      sym('peritonism', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.3, label: 'No peritonism — perforation not yet occurred' }),
    ],
  },

  differential: {
    mimics: ['amoebic_colitis', 'gastroenteritis', 'appendicitis', 'malaria', 'dengue'],
    distinguishingFeatures: [
      { fromDiseaseId: 'amoebic_colitis', featureIds: ['hematochezia', 'tenesmus', 'mucus_stool', 'fever'] },
      { fromDiseaseId: 'gastroenteritis', featureIds: ['fever', 'fever_chills', 'recent_travel', 'constipation'] },
      { fromDiseaseId: 'appendicitis', featureIds: ['pain_migration', 'pain_location_now', 'peritonism', 'fever'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Intestinal perforation', warningFeatures: ['fever_chills', 'hematochezia', 'peritonism'],
      riskFactors: ['delayed_treatment', 'age<5'], timeWindowHours: [336, 504], severityTier: 'critical',
      description: 'Necrosis of Peyer\'s patches leads to ileal perforation and faecal peritonitis — surgical emergency.' },
    { name: 'Typhoid encephalopathy', warningFeatures: ['syncope'],
      riskFactors: ['severe_disease'], timeWindowHours: [168, 336], severityTier: 'critical',
      description: 'Toxaemia causing altered mental status, confusion, and coma.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['fever_chills', 'hematochezia'],
};

const amoebicColitis: DiseaseNode = {
  id: 'amoebic_colitis',
  name: 'Amoebic Colitis',
  icdCode: 'A06.0',
  system: 'infectious',
  organSystem: 'infectious',
  acuity: 'semi_urgent',
  acuityTier: 3,

  epidemiology: {
    ageMin: 15, ageMax: 60, agePeak: [20, 50],
    sexRisk: { male: 1.0, female: 1.0 },
    backgroundPrevalence: 0.001,
    geographicFlags: ['endemic_amoebic', 'tropical'],
    riskFactors: [
      { featureId: 'recent_travel', label: 'Travel to endemic area', LR_positive: 6.0, prevalenceInDisease: 0.6 },
      { featureId: 'hiv_status', label: 'HIV / immunocompromised', LR_positive: 4.0, prevalenceInDisease: 0.15 },
      { featureId: 'ivdu', label: 'IV drug use', LR_positive: 2.0, prevalenceInDisease: 0.1 },
    ],
  },

  pathophysiology: {
    mechanism: 'Entamoeba histolytica is transmitted via the faecal-oral route. Ingested cysts excyst in the small intestine, and trophozoites invade the colonic mucosa, causing flask-shaped ulcers. The caecum and ascending colon are most commonly affected, producing right lower quadrant pain and bloody diarrhoea (dysentery). Invasion may extend through the bowel wall, causing peritonitis, or spread haematogenously to the liver, producing amoebic liver abscess. Chronic infection leads to weight loss, intermittent diarrhoea, and colonic strictures.',
    timelineStages: [
      { stageId: 1, label: 'Acute dysentery (0–7 days)', typicalHoursFromOnset: [0, 168],
        dominantSymptoms: [sym('pain_onset', 0.5, 0.55), sym('diarrhea', 0.85, 0.6),
          sym('hematochezia', 0.7, 0.9), sym('mucus_stool', 0.6, 0.85), sym('tenesmus', 0.6, 0.8)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Cramping', painLocationTypical: 'RLQ or diffuse',
        painRadiationTypical: 'None' },
      { stageId: 2, label: 'Chronic', typicalHoursFromOnset: [168, 720],
        dominantSymptoms: [sym('pain_character', 0.4, 0.55), sym('weight_loss', 0.5, 0.85),
          sym('anorexia', 0.5, 0.5), sym('fatigue', 0.5, 0.5)],
        examFindings: [], severityTrajectory: 'stable',
        painCharacterTypical: 'Mild, intermittent cramping', painLocationTypical: 'RLQ or diffuse',
        painRadiationTypical: 'None' },
    ],
    progressionRule: 'Acute dysentery lasts 7–10 days. Untreated, may progress to chronic infection with weight loss and malnutrition. Amoebic liver abscess develops over weeks as a late complication.',
  },

  features: {
    symptoms: [
      sym('pain_onset', 0.5, 0.55, { stageRelevance: [1] }),
      sym('pain_initial_location', 0.5, 0.5, { stageRelevance: [1] }),
      sym('pain_character', 0.6, 0.5, { stageRelevance: [1, 2] }),
      sym('diarrhea', 0.85, 0.6, { stageRelevance: [1] }),
      sym('hematochezia', 0.7, 0.9, { stageRelevance: [1] }),
      sym('mucus_stool', 0.6, 0.85, { stageRelevance: [1] }),
      sym('tenesmus', 0.6, 0.8, { stageRelevance: [1] }),
      sym('fever', 0.5, 0.6, { stageRelevance: [1] }),
      sym('fever_chills', 0.3, 0.85, { stageRelevance: [2] }),
      sym('anorexia', 0.5, 0.5, { stageRelevance: [1, 2] }),
      sym('weight_loss', 0.5, 0.85, { stageRelevance: [2] }),
      sym('recent_travel', 0.6, 0.8, { stageRelevance: [1] }),
      sym('hiv_status', 0.3, 0.85, { stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('hematochezia', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.1, label: 'No blood in stool — amoebic colitis unlikely' }),
    ],
    supporting: [
      sym('vomiting', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.4, label: 'Absence of vomiting distinguishes from gastroenteritis' }),
    ],
  },

  differential: {
    mimics: ['typhoid', 'gastroenteritis', 'appendicitis', 'colorectal_cancer', 'ibd'],
    distinguishingFeatures: [
      { fromDiseaseId: 'typhoid', featureIds: ['fever', 'fever_chills', 'hematochezia', 'mucus_stool', 'tenesmus'] },
      { fromDiseaseId: 'gastroenteritis', featureIds: ['hematochezia', 'mucus_stool', 'tenesmus', 'fever'] },
      { fromDiseaseId: 'appendicitis', featureIds: ['pain_migration', 'diarrhea', 'hematochezia', 'peritonism'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Intestinal perforation', warningFeatures: ['hematochezia', 'peritonism'],
      riskFactors: ['delayed_treatment', 'steroid_use'], timeWindowHours: [168, 336], severityTier: 'critical',
      description: 'Full-thickness colonic necrosis leading to faecal peritonitis — surgical emergency.' },
    { name: 'Amoebic liver abscess', warningFeatures: ['fever', 'fever_chills'],
      riskFactors: ['alcohol_use', 'malnutrition'], timeWindowHours: [336, 2160], severityTier: 'severe',
      description: 'Haematogenous spread to liver — presents with right upper quadrant pain, fever, and weight loss.' },
    { name: 'Toxic megacolon', warningFeatures: ['abdominal_distension', 'peritonism', 'fever_chills'],
      riskFactors: ['steroid_use'], timeWindowHours: [72, 168], severityTier: 'critical',
      description: 'Severe colonic dilation with systemic toxicity — urgent surgical intervention.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['hematochezia', 'peritonism'],
};

export const METABOLIC_INFECTIOUS_NODES: DiseaseNode[] = [
  dka,
  porphyria,
  sickleCellCrisis,
  addisonianCrisis,
  hypercalcaemia,
  typhoid,
  amoebicColitis,
];
