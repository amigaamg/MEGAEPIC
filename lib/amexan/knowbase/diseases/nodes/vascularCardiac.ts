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

const aorticDissection: DiseaseNode = {
  id: 'aortic_dissection',
  name: 'Aortic Dissection',
  icdCode: 'I71.0',
  system: 'vascular',
  organSystem: 'cardiovascular',
  acuity: 'immediately_life_threatening',
  acuityTier: 1,

  epidemiology: {
    ageMin: 30, ageMax: 90, agePeak: [50, 70],
    sexRisk: { male: 2, female: 1 },
    backgroundPrevalence: 0.001,
    riskFactors: [
      { featureId: 'htn_cad', label: 'Severe hypertension', LR_positive: 5.0, prevalenceInDisease: 0.8 },
      { featureId: 'smoking', label: 'Smoking', LR_positive: 2.0, prevalenceInDisease: 0.4 },
      { featureId: 'diabetes', label: 'Diabetes', LR_positive: 1.5, prevalenceInDisease: 0.2 },
    ],
  },

  pathophysiology: {
    mechanism: 'A tear in the aortic intima allows blood to enter the media, creating a false lumen that propagates along the aortic wall. This can cause malperfusion of branch vessels (coronary, carotid, renal, mesenteric, spinal), aortic regurgitation, tamponade, or rupture. The classic presentation is sudden severe tearing chest or back pain that migrates as the dissection propagates.',
    timelineStages: [
      { stageId: 1, label: 'Acute dissection (0–6h)', typicalHoursFromOnset: [0, 6],
        dominantSymptoms: [sym('pain_onset', 0.9, 0.6), sym('pain_character', 0.85, 0.7),
          sym('pain_initial_location', 0.7, 0.5), sym('pain_severity', 0.9, 0.5)],
        examFindings: [], severityTrajectory: 'rapidly_worsening',
        painCharacterTypical: 'Tearing or ripping — sudden, excruciating', painLocationTypical: 'Chest, abdomen, or back — depends on site of intimal tear',
        painRadiationTypical: 'To back — pain migrates as dissection propagates' },
      { stageId: 2, label: 'Malperfusion / rupture (6–24h)', typicalHoursFromOnset: [6, 24],
        dominantSymptoms: [sym('pain_location_now', 0.8, 0.5), sym('pain_migration', 0.6, 0.85),
          sym('syncope', 0.4, 0.9), sym('dyspnea', 0.5, 0.7)],
        examFindings: [], severityTrajectory: 'rapidly_worsening',
        painCharacterTypical: 'Constant tearing pain, may change location', painLocationTypical: 'Migrating — follows dissection path',
        painRadiationTypical: 'To back, neck, or abdomen' },
    ],
    progressionRule: 'Mortality increases by 1–2% per hour in the first 48h without surgical or endovascular repair. Malperfusion syndromes and rupture are the primary threats.',
  },

  features: {
    symptoms: [
      sym('pain_onset', 0.9, 0.6, { stageRelevance: [1] }),
      sym('pain_character', 0.85, 0.7, { stageRelevance: [1, 2] }),
      sym('pain_initial_location', 0.7, 0.5, { stageRelevance: [1] }),
      sym('pain_location_now', 0.8, 0.5, { stageRelevance: [2] }),
      sym('pain_migration', 0.6, 0.85, { stageRelevance: [2] }),
      sym('pain_radiation', 0.6, 0.8, { stageRelevance: [1, 2] }),
      sym('pain_severity', 0.9, 0.5, { stageRelevance: [1, 2] }),
      sym('syncope', 0.4, 0.9, { stageRelevance: [2] }),
      sym('dyspnea', 0.5, 0.7, { stageRelevance: [2] }),
      sym('htn_cad', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0, category: 'risk_factor', LR_positive: 5.0, label: 'Severe hypertension (SBP >180 or DBP >110)', shortLabel: 'Severe hypertension', stageRelevance: [1] }),
      sym('smoking', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0, category: 'risk_factor', LR_positive: 2.0, label: 'Smoking', shortLabel: 'Smoking', stageRelevance: [1] }),
      sym('diabetes', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0, category: 'risk_factor', LR_positive: 1.5, label: 'Diabetes', shortLabel: 'Diabetes', stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('pain_onset', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.05, label: 'Gradual onset — aortic dissection very unlikely' }),
      sym('pain_character', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.1, label: 'Non-tearing, non-ripping pain makes dissection unlikely' }),
    ],
    supporting: [
      sym('pain_migration', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.2, label: 'No migration of pain — dissection less likely' }),
    ],
  },

  differential: {
    mimics: ['mi', 'perforated_ulcer', 'pancreatitis', 'pulmonary_embolism', 'boerhaave', 'mesenteric_ischaemia'],
    distinguishingFeatures: [
      { fromDiseaseId: 'mi', featureIds: ['pain_character', 'pain_radiation', 'pain_migration'] },
      { fromDiseaseId: 'perforated_ulcer', featureIds: ['pain_character', 'peritonism', 'htn_cad'] },
      { fromDiseaseId: 'pancreatitis', featureIds: ['pain_character', 'pain_radiation', 'pain_migration'] },
    ],
    neverCloseConditions: ['mi', 'pulmonary_embolism'],
  },

  complications: [
    { name: 'Aortic rupture', warningFeatures: ['syncope', 'pain_severity'],
      riskFactors: ['htn_cad'], timeWindowHours: [0, 24], severityTier: 'critical',
      description: 'Complete aortic wall rupture leads to rapid exsanguination — immediate surgical repair required.' },
    { name: 'Malperfusion syndrome', warningFeatures: ['pain_migration', 'syncope'],
      riskFactors: [], timeWindowHours: [0, 12], severityTier: 'critical',
      description: 'Branch vessel occlusion causing stroke, MI, mesenteric ischaemia, or limb ischaemia.' },
    { name: 'Cardiac tamponade', warningFeatures: ['syncope', 'dyspnea'],
      riskFactors: ['type_a_dissection'], timeWindowHours: [0, 6], severityTier: 'critical',
      description: 'Haemorrhage into the pericardial sac causing obstructive shock — pericardial drainage required.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['syncope', 'pain_onset', 'pain_character'],
};

const ischaemicColitis: DiseaseNode = {
  id: 'ischaemic_colitis',
  name: 'Ischaemic Colitis',
  icdCode: 'K55.0',
  system: 'vascular',
  organSystem: 'GI',
  acuity: 'urgent',
  acuityTier: 2,

  epidemiology: {
    ageMin: 50, ageMax: 90, agePeak: [65, 85],
    sexRisk: { male: 1.0, female: 1.0 },
    backgroundPrevalence: 0.002,
    riskFactors: [
      { featureId: 'htn_cad', label: 'Cardiovascular disease', LR_positive: 3.0, prevalenceInDisease: 0.5 },
      { featureId: 'anticoagulant_use', label: 'Anticoagulant use', LR_positive: 2.5, prevalenceInDisease: 0.3 },
      { featureId: 'prior_abdominal_surgery', label: 'Recent abdominal surgery', LR_positive: 2.0, prevalenceInDisease: 0.2 },
    ],
  },

  pathophysiology: {
    mechanism: 'Reduced blood flow to the colonic mucosa causes ischaemia, most commonly in the left colon at the splenic flexure (watershed area). The mucosa is most vulnerable; superficial ischaemia may be reversible, but transmural ischaemia progresses to infarction and perforation. Patients present with sudden cramping left-sided pain, urgency, and bloody diarrhoea.',
    timelineStages: [
      { stageId: 1, label: 'Ischaemic (0–6h — reversible)', typicalHoursFromOnset: [0, 6],
        dominantSymptoms: [sym('pain_onset', 0.7, 0.5), sym('pain_initial_location', 0.7, 0.5),
          sym('pain_character', 0.6, 0.55), sym('hematochezia', 0.8, 0.95)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Sudden cramping, left-sided', painLocationTypical: 'Left lower quadrant',
        painRadiationTypical: 'None' },
      { stageId: 2, label: 'Transmural (>6h — infarction/perforation)', typicalHoursFromOnset: [6, 48],
        dominantSymptoms: [sym('pain_location_now', 0.8, 0.5), sym('abdominal_distension', 0.6, 0.7),
          sym('peritonism', 0.5, 0.85), sym('syncope', 0.3, 0.9)],
        examFindings: [], severityTrajectory: 'rapidly_worsening',
        painCharacterTypical: 'Constant, severe, diffuse', painLocationTypical: 'Left lower quadrant → diffuse',
        painRadiationTypical: 'None' },
    ],
    progressionRule: 'Superficial ischaemia may resolve over days. Transmural infarction develops >6h with peritonitis and perforation requiring surgical resection.',
  },

  features: {
    symptoms: [
      sym('pain_onset', 0.7, 0.5, { stageRelevance: [1] }),
      sym('pain_initial_location', 0.7, 0.5, { stageRelevance: [1] }),
      sym('pain_location_now', 0.8, 0.5, { stageRelevance: [2] }),
      sym('pain_character', 0.6, 0.55, { stageRelevance: [1, 2] }),
      sym('pain_severity', 0.6, 0.4, { stageRelevance: [1, 2] }),
      sym('hematochezia', 0.8, 0.95, { stageRelevance: [1, 2] }),
      sym('diarrhea', 0.6, 0.7, { stageRelevance: [1] }),
      sym('bowel_habits', 0.5, 0.6, { stageRelevance: [1] }),
      sym('abdominal_distension', 0.6, 0.7, { stageRelevance: [2] }),
      sym('nausea', 0.4, 0.5, { stageRelevance: [1, 2] }),
      sym('vomiting', 0.3, 0.55, { stageRelevance: [2] }),
      sym('fever', 0.4, 0.55, { stageRelevance: [2] }),
      sym('peritonism', 0.5, 0.85, { stageRelevance: [2] }),
      sym('syncope', 0.3, 0.9, { stageRelevance: [2] }),
      sym('htn_cad', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0, category: 'risk_factor', LR_positive: 3.0, label: 'Cardiovascular disease', shortLabel: 'Cardiovascular disease', stageRelevance: [1] }),
      sym('anticoagulant_use', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0, category: 'risk_factor', LR_positive: 2.5, label: 'Anticoagulant use', shortLabel: 'Anticoagulant use', stageRelevance: [1] }),
      sym('prior_abdominal_surgery', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0, category: 'risk_factor', LR_positive: 2.0, label: 'Recent abdominal surgery', shortLabel: 'Recent abdominal surgery', stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('hematochezia', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.1, label: 'No bloody diarrhoea — ischaemic colitis unlikely' }),
    ],
    supporting: [
      sym('pain_initial_location', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.3, label: 'RLQ pain — consider appendicitis or other diagnosis' }),
    ],
  },

  differential: {
    mimics: ['diverticulitis', 'ibd_flare', 'infectious_colitis', 'colonic_cancer', 'volvulus'],
    distinguishingFeatures: [
      { fromDiseaseId: 'diverticulitis', featureIds: ['hematochezia', 'pain_onset', 'fever'] },
      { fromDiseaseId: 'infectious_colitis', featureIds: ['hematochezia', 'fever', 'fever_chills'] },
      { fromDiseaseId: 'volvulus', featureIds: ['hematochezia', 'abdominal_distension', 'obstipation'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Colonic infarction / perforation', warningFeatures: ['peritonism', 'abdominal_distension', 'syncope'],
      riskFactors: ['age>70', 'htn_cad'], timeWindowHours: [6, 48], severityTier: 'critical',
      description: 'Transmural ischaemia leads to necrosis and perforation — emergency colectomy required.' },
    { name: 'Sepsis', warningFeatures: ['fever_chills', 'syncope'],
      riskFactors: ['diabetes', 'immunocompromised'], timeWindowHours: [12, 72], severityTier: 'critical',
      description: 'Bacterial translocation from ischaemic bowel leading to systemic infection.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['hematochezia', 'peritonism', 'syncope'],
};

const dvtPe: DiseaseNode = {
  id: 'dvt_pe',
  name: 'DVT / Pulmonary Embolism',
  icdCode: 'I26',
  system: 'vascular',
  organSystem: 'cardiovascular',
  acuity: 'immediately_life_threatening',
  acuityTier: 1,

  epidemiology: {
    ageMin: 20, ageMax: 90, agePeak: [50, 80],
    sexRisk: { male: 1.0, female: 1.0 },
    backgroundPrevalence: 0.002,
    riskFactors: [
      { featureId: 'anticoagulant_use', label: 'Recent surgery / immobility', LR_positive: 5.0, prevalenceInDisease: 0.4 },
      { featureId: 'known_cancer', label: 'Known cancer', LR_positive: 4.0, prevalenceInDisease: 0.2 },
      { featureId: 'smoking', label: 'Smoking', LR_positive: 2.0, prevalenceInDisease: 0.3 },
      { featureId: 'htn_cad', label: 'Cardiovascular disease', LR_positive: 1.5, prevalenceInDisease: 0.3 },
      { featureId: 'prior_abdominal_surgery', label: 'Recent abdominal/pelvic surgery', LR_positive: 3.0, prevalenceInDisease: 0.25 },
    ],
  },

  pathophysiology: {
    mechanism: 'Venous thromboembolism begins as a deep vein thrombosis (DVT), usually in the lower extremities. The thrombus may propagate into the IVC or embolise to the pulmonary circulation, causing pulmonary embolism (PE). With extensive IVC/caval thrombosis, patients can present with abdominal or flank pain. PE causes chest pain, dyspnoea, and if massive, obstructive shock.',
    timelineStages: [
      { stageId: 1, label: 'DVT (0–7d)', typicalHoursFromOnset: [0, 168],
        dominantSymptoms: [sym('pain_initial_location', 0.6, 0.5), sym('dyspnea', 0.3, 0.7),
          sym('chest_pain', 0.2, 0.7)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Calf pain/swelling or abdominal pain if caval', painLocationTypical: 'Calf, thigh, or abdomen (IVC thrombosis)',
        painRadiationTypical: 'None' },
      { stageId: 2, label: 'PE (acute)', typicalHoursFromOnset: [0, 48],
        dominantSymptoms: [sym('dyspnea', 0.85, 0.75), sym('chest_pain', 0.7, 0.7),
          sym('pleuritic_pain', 0.6, 0.8), sym('cough', 0.4, 0.7), sym('syncope', 0.3, 0.9)],
        examFindings: [], severityTrajectory: 'rapidly_worsening',
        painCharacterTypical: 'Pleuritic chest pain, sharp on inspiration', painLocationTypical: 'Chest (pleuritic) ± abdomen if caval thrombosis',
        painRadiationTypical: 'None' },
    ],
    progressionRule: 'DVT may embolise at any time. Untreated PE has 30% mortality. Massive PE causes obstructive shock within minutes to hours.',
  },

  features: {
    symptoms: [
      sym('dyspnea', 0.85, 0.75, { stageRelevance: [2] }),
      sym('chest_pain', 0.7, 0.7, { stageRelevance: [2] }),
      sym('pleuritic_pain', 0.6, 0.8, { stageRelevance: [2] }),
      sym('cough', 0.4, 0.7, { stageRelevance: [2] }),
      sym('hematuria', 0.2, 0.9, { stageRelevance: [1] }),
      sym('pain_initial_location', 0.6, 0.5, { stageRelevance: [1] }),
      sym('pain_location_now', 0.5, 0.5, { stageRelevance: [1, 2] }),
      sym('syncope', 0.3, 0.9, { stageRelevance: [2] }),
      sym('previous_similar_episodes', 0.3, 0.7, { stageRelevance: [1] }),
      sym('smoking', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0, category: 'risk_factor', LR_positive: 2.0, label: 'Smoking', shortLabel: 'Smoking', stageRelevance: [1] }),
      sym('anticoagulant_use', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0, category: 'risk_factor', LR_positive: 5.0, label: 'Recent surgery / immobility', shortLabel: 'Surgery / immobility', stageRelevance: [1] }),
      sym('known_cancer', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0, category: 'risk_factor', LR_positive: 4.0, label: 'Known cancer', shortLabel: 'Known cancer', stageRelevance: [1] }),
      sym('htn_cad', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0, category: 'risk_factor', LR_positive: 1.5, label: 'Cardiovascular disease', shortLabel: 'Cardiovascular disease', stageRelevance: [1] }),
      sym('prior_abdominal_surgery', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0, category: 'risk_factor', LR_positive: 3.0, label: 'Recent abdominal/pelvic surgery', shortLabel: 'Recent abdominal/pelvic surgery', stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('dyspnea', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.1, label: 'No dyspnoea — significant PE unlikely' }),
    ],
    supporting: [
      sym('pleuritic_pain', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.3, label: 'Non-pleuritic chest pain — consider alternative' }),
    ],
  },

  differential: {
    mimics: ['mi', 'pneumonia', 'pneumothorax', 'pericarditis', 'musculoskeletal_chest_pain'],
    distinguishingFeatures: [
      { fromDiseaseId: 'mi', featureIds: ['pleuritic_pain', 'dyspnea', 'htn_cad'] },
      { fromDiseaseId: 'pneumonia', featureIds: ['fever', 'cough_sputum', 'pleuritic_pain'] },
    ],
    neverCloseConditions: ['mi', 'aortic_dissection'],
  },

  complications: [
    { name: 'Massive PE / obstructive shock', warningFeatures: ['syncope', 'dyspnea'],
      riskFactors: ['age>70', 'known_cancer'], timeWindowHours: [0, 24], severityTier: 'critical',
      description: 'Large embolus obstructs pulmonary outflow causing haemodynamic collapse — thrombolysis or embolectomy required.' },
    { name: 'Infarction / paradoxica l embolism', warningFeatures: ['chest_pain', 'hemoptysis'],
      riskFactors: ['pfo'], timeWindowHours: [24, 72], severityTier: 'severe',
      description: 'Pulmonary infarction or stroke from paradoxical embolus through a PFO.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['syncope', 'dyspnea'],
};

const inferiorMi: DiseaseNode = {
  id: 'inferior_mi',
  name: 'Inferior ST-Elevation MI',
  icdCode: 'I21.1',
  system: 'medical',
  organSystem: 'cardiovascular',
  acuity: 'immediately_life_threatening',
  acuityTier: 1,

  epidemiology: {
    ageMin: 30, ageMax: 90, agePeak: [50, 80],
    sexRisk: { male: 1.5, female: 1.0 },
    backgroundPrevalence: 0.005,
    riskFactors: [
      { featureId: 'htn_cad', label: 'Hypertension / CAD', LR_positive: 4.0, prevalenceInDisease: 0.6 },
      { featureId: 'smoking', label: 'Smoking', LR_positive: 3.0, prevalenceInDisease: 0.5 },
      { featureId: 'diabetes', label: 'Diabetes', LR_positive: 3.0, prevalenceInDisease: 0.3 },
    ],
  },

  pathophysiology: {
    mechanism: 'Acute occlusion of the right coronary artery (most commonly) causes infarction of the inferior wall of the left ventricle. The inferior wall lies adjacent to the diaphragm, and diaphragmatic irritation produces epigastric pain, nausea, and vomiting — mimicking an acute abdomen. This is a classic diagnostic trap. Urgent revascularisation is critical.',
    timelineStages: [
      { stageId: 1, label: 'Acute (0–6h)', typicalHoursFromOnset: [0, 6],
        dominantSymptoms: [sym('pain_initial_location', 0.8, 0.5), sym('pain_character', 0.8, 0.6),
          sym('pain_radiation', 0.7, 0.85), sym('chest_pain', 0.85, 0.7), sym('dyspnea', 0.6, 0.7)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Pressure, crushing, or squeezing', painLocationTypical: 'Epigastric or retrosternal chest',
        painRadiationTypical: 'To jaw, left arm, or back' },
      { stageId: 2, label: 'Reperfused / infarcted (>6h)', typicalHoursFromOnset: [6, 72],
        dominantSymptoms: [sym('pain_location_now', 0.7, 0.5), sym('nausea', 0.7, 0.45),
          sym('vomiting', 0.5, 0.55), sym('vomiting_timing', 0.5, 0.6)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Persistent pressure or burning, may improve with reperfusion', painLocationTypical: 'Epigastric or chest',
        painRadiationTypical: 'To jaw, left arm, or back' },
    ],
    progressionRule: 'Myocardial necrosis progresses rapidly. Time-to-reperfusion is the strongest predictor of survival — goal <90 minutes from presentation.',
  },

  features: {
    symptoms: [
      sym('pain_initial_location', 0.8, 0.5, { stageRelevance: [1] }),
      sym('pain_location_now', 0.7, 0.5, { stageRelevance: [2] }),
      sym('pain_character', 0.8, 0.6, { stageRelevance: [1, 2] }),
      sym('pain_radiation', 0.7, 0.85, { stageRelevance: [1, 2] }),
      sym('chest_pain', 0.85, 0.7, { stageRelevance: [1, 2] }),
      sym('dyspnea', 0.6, 0.7, { stageRelevance: [1, 2] }),
      sym('nausea', 0.7, 0.45, { stageRelevance: [2] }),
      sym('vomiting', 0.5, 0.55, { stageRelevance: [2] }),
      sym('vomiting_timing', 0.5, 0.6, { stageRelevance: [2] }),
      sym('syncope', 0.3, 0.9, { stageRelevance: [1, 2] }),
      sym('htn_cad', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0, category: 'risk_factor', LR_positive: 4.0, label: 'Hypertension / CAD', shortLabel: 'Hypertension / CAD', stageRelevance: [1] }),
      sym('smoking', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0, category: 'risk_factor', LR_positive: 3.0, label: 'Smoking', shortLabel: 'Smoking', stageRelevance: [1] }),
      sym('diabetes', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0, category: 'risk_factor', LR_positive: 3.0, label: 'Diabetes', shortLabel: 'Diabetes', stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('pain_character', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.1, label: 'Sharp/stabbing or tearing pain — not typical for MI' }),
    ],
    supporting: [
      sym('pain_radiation', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.2, label: 'No radiation to arm/jaw — MI less likely' }),
    ],
  },

  differential: {
    mimics: ['pancreatitis', 'perforated_ulcer', 'cholecystitis', 'gastritis', 'aortic_dissection', 'pulmonary_embolism'],
    distinguishingFeatures: [
      { fromDiseaseId: 'pancreatitis', featureIds: ['chest_pain', 'pain_radiation', 'htn_cad'] },
      { fromDiseaseId: 'perforated_ulcer', featureIds: ['chest_pain', 'pain_onset', 'peritonism'] },
      { fromDiseaseId: 'aortic_dissection', featureIds: ['pain_character', 'pain_migration', 'htn_cad'] },
    ],
    neverCloseConditions: ['aortic_dissection', 'pulmonary_embolism'],
  },

  complications: [
    { name: 'Cardiogenic shock', warningFeatures: ['syncope', 'dyspnea'],
      riskFactors: ['age>65', 'diabetes', 'anterior_extension'], timeWindowHours: [0, 24], severityTier: 'critical',
      description: 'Extensive myocardial damage causing pump failure — inotropes and revascularisation required.' },
    { name: 'Arrhythmia (heart block)', warningFeatures: ['syncope'],
      riskFactors: ['inferior_mi'], timeWindowHours: [0, 6], severityTier: 'critical',
      description: 'Inferior MI can cause AV nodal ischaemia leading to bradycardia or heart block — pacing may be needed.' },
    { name: 'Free wall rupture', warningFeatures: ['syncope', 'pain_severity'],
      riskFactors: ['delayed_reperfusion'], timeWindowHours: [24, 168], severityTier: 'critical',
      description: 'Myocardial wall rupture with haemopericardium and tamponade — surgical emergency.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['syncope', 'chest_pain', 'dyspnea'],
};

const pneumonia: DiseaseNode = {
  id: 'pneumonia',
  name: 'Pneumonia',
  icdCode: 'J18.9',
  system: 'medical',
  organSystem: 'pulmonary',
  acuity: 'urgent',
  acuityTier: 2,

  epidemiology: {
    ageMin: 0, ageMax: 90, agePeak: [0, 85],
    sexRisk: { male: 1.0, female: 1.0 },
    backgroundPrevalence: 0.01,
    riskFactors: [
      { featureId: 'smoking', label: 'Smoking / COPD', LR_positive: 3.0, prevalenceInDisease: 0.4 },
      { featureId: 'htn_cad', label: 'Cardiovascular disease', LR_positive: 2.0, prevalenceInDisease: 0.3 },
      { featureId: 'diabetes', label: 'Diabetes', LR_positive: 2.0, prevalenceInDisease: 0.2 },
    ],
  },

  pathophysiology: {
    mechanism: 'Infection of the lung parenchyma caused by bacteria, viruses, or fungi. Lower lobe pneumonia irritates the diaphragm, producing referred abdominal pain — a common mimic of acute abdomen. The classic presentation includes cough, fever, sputum production, and pleuritic chest pain.',
    timelineStages: [
      { stageId: 1, label: 'Early (0–48h)', typicalHoursFromOnset: [0, 48],
        dominantSymptoms: [sym('pain_initial_location', 0.6, 0.5), sym('cough', 0.85, 0.75),
          sym('fever', 0.8, 0.55), sym('fever_chills', 0.6, 0.85)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Pleuritic — sharp, worsened by deep breathing', painLocationTypical: 'Chest or upper abdomen (lower lobe)',
        painRadiationTypical: 'To abdomen or chest wall' },
      { stageId: 2, label: 'Consolidation (>48h)', typicalHoursFromOnset: [48, 168],
        dominantSymptoms: [sym('cough_sputum', 0.7, 0.8), sym('dyspnea', 0.6, 0.7),
          sym('pleuritic_pain', 0.5, 0.8), sym('pain_worsening_factors', 0.5, 0.5)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Pleuritic pain with productive cough', painLocationTypical: 'Chest or upper abdomen',
        painRadiationTypical: 'To abdomen or chest wall' },
    ],
    progressionRule: 'Without antibiotics, may progress from early to consolidation over 48h. Complications include empyema, abscess, and sepsis.',
  },

  features: {
    symptoms: [
      sym('cough', 0.85, 0.75, { stageRelevance: [1, 2] }),
      sym('cough_sputum', 0.7, 0.8, { stageRelevance: [2] }),
      sym('fever', 0.8, 0.55, { stageRelevance: [1, 2] }),
      sym('fever_chills', 0.6, 0.85, { stageRelevance: [1] }),
      sym('pleuritic_pain', 0.5, 0.8, { stageRelevance: [2] }),
      sym('pain_radiation', 0.4, 0.8, { stageRelevance: [1, 2] }),
      sym('pain_initial_location', 0.6, 0.5, { stageRelevance: [1] }),
      sym('pain_location_now', 0.5, 0.5, { stageRelevance: [2] }),
      sym('pain_worsening_factors', 0.5, 0.5, { stageRelevance: [2] }),
      sym('dyspnea', 0.6, 0.7, { stageRelevance: [2] }),
      sym('previous_similar_episodes', 0.3, 0.7, { stageRelevance: [1] }),
      sym('syncope', 0.15, 0.9, { stageRelevance: [2] }),
      sym('smoking', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0, category: 'risk_factor', LR_positive: 3.0, label: 'Smoking / COPD', shortLabel: 'Smoking / COPD', stageRelevance: [1] }),
      sym('htn_cad', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0, category: 'risk_factor', LR_positive: 2.0, label: 'Cardiovascular disease', shortLabel: 'Cardiovascular disease', stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('cough', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.05, label: 'No cough — pneumonia very unlikely' }),
      sym('fever', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.15, label: 'Afebrile — pneumonia less likely but not excluded in elderly' }),
    ],
    supporting: [
      sym('fever_chills', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.2, label: 'No rigors — may still have pneumonia' }),
    ],
  },

  differential: {
    mimics: ['pulmonary_embolism', 'mi', 'pleurisy', 'pneumothorax', 'cholecystitis', 'appendicitis'],
    distinguishingFeatures: [
      { fromDiseaseId: 'pulmonary_embolism', featureIds: ['fever', 'cough_sputum', 'fever_chills'] },
      { fromDiseaseId: 'mi', featureIds: ['cough', 'fever', 'cough_sputum'] },
      { fromDiseaseId: 'cholecystitis', featureIds: ['cough', 'fever', 'pain_initial_location'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Sepsis / septic shock', warningFeatures: ['fever_chills', 'dyspnea', 'syncope'],
      riskFactors: ['age>65', 'diabetes', 'immunocompromised'], timeWindowHours: [48, 120], severityTier: 'critical',
      description: 'Systemic infection with organ dysfunction — ICU-level care and IV antibiotics required.' },
    { name: 'Parapneumonic effusion / empyema', warningFeatures: ['pleuritic_pain', 'dyspnea'],
      riskFactors: ['delayed_treatment'], timeWindowHours: [72, 336], severityTier: 'severe',
      description: 'Infected pleural fluid collection requiring drainage.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['fever_chills', 'dyspnea', 'syncope'],
};

export const VASCULAR_CARDIAC_NODES: DiseaseNode[] = [
  aorticDissection,
  ischaemicColitis,
  dvtPe,
  inferiorMi,
  pneumonia,
];
