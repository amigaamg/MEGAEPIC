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
// 1. RECTUS SHEATH HAEMATOMA
// ═══════════════════════════════════════════════════════════════════════════════
export const rectusSheathHaematoma: DiseaseNode = {
  id: 'rectus_sheath_haematoma',
  name: 'Rectus Sheath Haematoma',
  icdCode: 'M79.81',
  system: 'surgical',
  organSystem: 'musculoskeletal',
  acuity: 'semi_urgent',
  acuityTier: 3,

  epidemiology: {
    ageMin: 30, ageMax: 90, agePeak: [50, 80],
    sexRisk: { male: 1.0, female: 1.0 },
    backgroundPrevalence: 0.001,
    riskFactors: [
      { featureId: 'anticoagulant_use', label: 'Anticoagulant use', LR_positive: 8.0, prevalenceInDisease: 0.6 },
      { featureId: 'prior_abdominal_surgery', label: 'Recent abdominal surgery', LR_positive: 3.0, prevalenceInDisease: 0.3 },
      { featureId: 'smoking', label: 'Smoking', LR_positive: 1.5, prevalenceInDisease: 0.3 },
      { featureId: 'steroid_use', label: 'Steroid use', LR_positive: 2.0, prevalenceInDisease: 0.15 },
    ],
  },

  pathophysiology: {
    mechanism: 'Bleeding into the rectus abdominis muscle sheath, typically from the inferior or superior epigastric artery. Often precipitated by sudden increases in intra-abdominal pressure (coughing, straining, lifting) or anticoagulation. The blood is contained within the rectus sheath, producing a tender palpable mass. Pain is localised to the anterior abdominal wall, NOT intra-abdominal. Large haematomas may cause haemodynamic compromise. The condition is frequently misdiagnosed as peritonism or an acute surgical abdomen.',
    timelineStages: [
      { stageId: 1, label: 'Acute haematoma (0-24h)', typicalHoursFromOnset: [0, 24],
        dominantSymptoms: [sym('pain_onset', 0.8, 0.6), sym('pain_initial_location', 0.85, 0.5),
          sym('pain_character', 0.7, 0.55), sym('pain_severity', 0.7, 0.4)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Sharp, well-localised, anterior abdominal wall',
        painLocationTypical: 'Anterior abdominal wall, unilateral',
        painRadiationTypical: 'None' },
      { stageId: 2, label: 'Resolving (1-2w)', typicalHoursFromOnset: [24, 336],
        dominantSymptoms: [sym('pain_character', 0.3, 0.5), sym('guarding', 0.2, 0.5)],
        examFindings: [], severityTrajectory: 'improving',
        painCharacterTypical: 'Dull ache, resolving', painLocationTypical: 'Anterior abdominal wall',
        painRadiationTypical: 'None' },
    ],
    progressionRule: 'Haematoma expands over 0-24h then stabilises. Resorption occurs over 1-2 weeks. Large bleeds may cause haemodynamic instability within hours.',
  },

  features: {
    symptoms: [
      sym('pain_onset', 0.8, 0.6, { stageRelevance: [1] }),
      sym('pain_initial_location', 0.85, 0.5, { stageRelevance: [1] }),
      sym('pain_character', 0.7, 0.55, { stageRelevance: [1] }),
      sym('pain_severity', 0.7, 0.4, { stageRelevance: [1] }),
      sym('peritonism', 0.3, 0.8, { stageRelevance: [1] }),
      sym('guarding', 0.5, 0.7, { stageRelevance: [1] }),
      sym('syncope', 0.3, 0.9, { stageRelevance: [1] }),
      sym('nausea', 0.4, 0.5, { stageRelevance: [1] }),
      sym('anticoagulant_use', 0.6, 0.85, { stageRelevance: [1] }),
      sym('prior_abdominal_surgery', 0.3, 0.7, { stageRelevance: [1] }),
      sym('smoking', 0.3, 0.65, { stageRelevance: [1] }),
      sym('steroid_use', 0.15, 0.9, { stageRelevance: [1] }),
      sym('previous_similar_episodes', 0.1, 0.85, { stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('pain_initial_location', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.1, label: 'No anterior abdominal wall pain — rectus sheath haematoma unlikely' }),
    ],
    supporting: [
      sym('pain_migration', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.3, label: 'No pain migration — supports wall pain over visceral cause' }),
    ],
  },

  differential: {
    mimics: ['acute_appendicitis', 'acute_cholecystitis', 'perforated_peptic_ulcer', 'intestinal_obstruction', 'abdominal_wall_abscess'],
    distinguishingFeatures: [
      { fromDiseaseId: 'perforated_peptic_ulcer', featureIds: ['pain_onset', 'anticoagulant_use', 'rigidity'] },
      { fromDiseaseId: 'acute_appendicitis', featureIds: ['pain_migration', 'fever', 'pain_location_now'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Haemorrhagic shock', warningFeatures: ['syncope'],
      riskFactors: ['anticoagulant_use', 'age>70'], timeWindowHours: [0, 24], severityTier: 'critical',
      description: 'Large rectus sheath haematoma causing significant blood loss and haemodynamic instability.' },
    { name: 'Abdominal wall abscess', warningFeatures: ['fever', 'peritonism'],
      riskFactors: ['diabetes'], timeWindowHours: [72, 336], severityTier: 'moderate',
      description: 'Infection of the haematoma cavity requiring drainage.' },
  ],

  clinicalScores: [],

  redFlagFeatureIds: ['syncope', 'anticoagulant_use'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 2. HERPES ZOSTER (PRE-ERUPTIVE)
// ═══════════════════════════════════════════════════════════════════════════════
export const herpesZoster: DiseaseNode = {
  id: 'herpes_zoster',
  name: 'Herpes Zoster (Pre-eruptive)',
  icdCode: 'B02',
  system: 'medical',
  organSystem: 'dermatological',
  acuity: 'semi_urgent',
  acuityTier: 3,

  epidemiology: {
    ageMin: 20, ageMax: 90, agePeak: [50, 80],
    sexRisk: { male: 1.0, female: 1.1 },
    backgroundPrevalence: 0.003,
    riskFactors: [
      { featureId: 'hiv_status', label: 'Immunocompromised', LR_positive: 4.0, prevalenceInDisease: 0.2 },
      { featureId: 'known_cancer', label: 'Malignancy', LR_positive: 2.5, prevalenceInDisease: 0.1 },
    ],
  },

  pathophysiology: {
    mechanism: 'Reactivation of varicella-zoster virus (VZV) from dorsal root ganglia, travelling along the sensory nerve to the dermatomal distribution of the skin. The prodromal (pre-eruptive) phase is characterised by neuropathic pain — burning, tingling, or sharp pain confined to one dermatome — that precedes the characteristic vesicular rash by 1-5 days. During this phase, the diagnosis is extremely challenging and the pain may mimic surgical abdomen, myocardial infarction, or other visceral pathology depending on the dermatome affected.',
    timelineStages: [
      { stageId: 1, label: 'Pre-eruptive (0-5d pain before rash)', typicalHoursFromOnset: [0, 120],
        dominantSymptoms: [sym('pain_onset', 0.7, 0.5), sym('pain_initial_location', 0.85, 0.5),
          sym('pain_character', 0.8, 0.6), sym('pain_severity', 0.7, 0.4)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Burning, tingling, sharp neuropathic pain',
        painLocationTypical: 'Unilateral, dermatomal',
        painRadiationTypical: 'Along dermatome' },
      { stageId: 2, label: 'Eruptive (rash appears)', typicalHoursFromOnset: [24, 120],
        dominantSymptoms: [sym('skin_rash', 0.9, 0.85), sym('fever', 0.3, 0.6)],
        examFindings: [], severityTrajectory: 'stable',
        painCharacterTypical: 'Burning, persistent', painLocationTypical: 'Same dermatome + rash',
        painRadiationTypical: 'Along dermatome' },
    ],
    progressionRule: 'Pain precedes rash by 1-5 days. Once rash appears, additional lesions may crust over 7-10 days. Post-herpetic neuralgia may persist for months.',
  },

  features: {
    symptoms: [
      sym('pain_onset', 0.7, 0.5, { stageRelevance: [1] }),
      sym('pain_initial_location', 0.85, 0.5, { stageRelevance: [1] }),
      sym('pain_character', 0.8, 0.6, { stageRelevance: [1, 2] }),
      sym('pain_severity', 0.7, 0.4, { stageRelevance: [1] }),
      sym('skin_rash', 0.9, 0.85, { stageRelevance: [2] }),
      sym('fever', 0.3, 0.6, { stageRelevance: [1] }),
      sym('previous_similar_episodes', 0.1, 0.85, { stageRelevance: [1] }),
      sym('hiv_status', 0.2, 0.85, { stageRelevance: [1] }),
      sym('known_cancer', 0.1, 0.9, { stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('pain_character', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.1, label: 'Non-neuropathic pain pattern — herpes zoster unlikely' }),
    ],
    supporting: [
      sym('pain_migration', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.3, label: 'No pain migration — supports dermatomal over visceral cause' }),
    ],
  },

  differential: {
    mimics: ['acute_cholecystitis', 'ureteric_colic', 'acute_appendicitis', 'mi', 'pleuritic_pain'],
    distinguishingFeatures: [
      { fromDiseaseId: 'acute_cholecystitis', featureIds: ['pain_character', 'fever', 'skin_rash'] },
      { fromDiseaseId: 'ureteric_colic', featureIds: ['pain_character', 'pain_radiation', 'skin_rash'] },
      { fromDiseaseId: 'acute_appendicitis', featureIds: ['pain_character', 'pain_migration', 'skin_rash'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Post-herpetic neuralgia', warningFeatures: ['pain_severity'],
      riskFactors: ['age>60'], timeWindowHours: [720, 4320], severityTier: 'moderate',
      description: 'Persistent neuropathic pain lasting >90 days after rash onset — affects up to 30% of patients over 60.' },
    { name: 'Disseminated zoster', warningFeatures: ['fever_chills', 'skin_rash'],
      riskFactors: ['hiv_status', 'known_cancer'], timeWindowHours: [72, 336], severityTier: 'severe',
      description: 'Widespread cutaneous or visceral involvement in immunocompromised patients.' },
  ],

  clinicalScores: [],

  redFlagFeatureIds: [],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 3. COLORECTAL CANCER
// ═══════════════════════════════════════════════════════════════════════════════
export const colonCancer: DiseaseNode = {
  id: 'colon_cancer',
  name: 'Colorectal Cancer',
  icdCode: 'C18',
  system: 'surgical',
  organSystem: 'GI',
  acuity: 'routine',
  acuityTier: 4,

  epidemiology: {
    ageMin: 30, ageMax: 90, agePeak: [60, 80],
    sexRisk: { male: 1.2, female: 1.0 },
    backgroundPrevalence: 0.005,
    riskFactors: [
      { featureId: 'family_history_gi_cancer', label: 'Family history of colorectal cancer', LR_positive: 4.0, prevalenceInDisease: 0.15 },
      { featureId: 'smoking', label: 'Smoking', LR_positive: 1.5, prevalenceInDisease: 0.3 },
      { featureId: 'alcohol_use', label: 'Alcohol use', LR_positive: 1.5, prevalenceInDisease: 0.35 },
      { featureId: 'known_cancer', label: 'Personal history of cancer', LR_positive: 2.0, prevalenceInDisease: 0.1 },
    ],
  },

  pathophysiology: {
    mechanism: 'Adenocarcinoma arising from the colorectal mucosa. Right-sided tumours typically present with iron-deficiency anaemia, melena, and vague right-sided pain. Left-sided tumours present with change in bowel habit, haematochezia, and left-sided cramping pain. Advanced disease causes weight loss, anorexia, abdominal distension, and obstructive symptoms. The growth is typically slow over months to years, with early localised disease often asymptomatic.',
    timelineStages: [
      { stageId: 1, label: 'Early (localised)', typicalHoursFromOnset: [0, 4320],
        dominantSymptoms: [sym('pain_onset', 0.5, 0.5), sym('bowel_habits', 0.6, 0.65),
          sym('fatigue', 0.4, 0.5), sym('weight_loss', 0.3, 0.85)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Cramping or dull ache, varies by location',
        painLocationTypical: 'Varies — right lower quadrant or left lower quadrant',
        painRadiationTypical: 'None' },
      { stageId: 2, label: 'Advanced (metastatic)', typicalHoursFromOnset: [4320, 43200],
        dominantSymptoms: [sym('weight_loss', 0.7, 0.85), sym('hematochezia', 0.5, 0.95),
          sym('abdominal_distension', 0.6, 0.7), sym('obstipation', 0.3, 0.85)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Persistent dull ache or cramping', painLocationTypical: 'Localised to tumour site',
        painRadiationTypical: 'None' },
    ],
    progressionRule: 'Indolent growth over months to years. Early disease may be asymptomatic. Obstructing tumours present acutely. Metastatic disease carries poor prognosis.',
  },

  features: {
    symptoms: [
      sym('pain_onset', 0.5, 0.5, { stageRelevance: [1] }),
      sym('pain_initial_location', 0.5, 0.5, { stageRelevance: [1] }),
      sym('pain_character', 0.5, 0.5, { stageRelevance: [1, 2] }),
      sym('bowel_habits', 0.6, 0.65, { stageRelevance: [1, 2] }),
      sym('hematochezia', 0.5, 0.95, { stageRelevance: [2] }),
      sym('melena', 0.3, 0.9, { stageRelevance: [2] }),
      sym('tenesmus', 0.3, 0.8, { stageRelevance: [1, 2] }),
      sym('weight_loss', 0.6, 0.85, { stageRelevance: [1, 2] }),
      sym('fatigue', 0.5, 0.5, { stageRelevance: [1, 2] }),
      sym('anorexia', 0.4, 0.55, { stageRelevance: [1, 2] }),
      sym('abdominal_distension', 0.4, 0.7, { stageRelevance: [2] }),
      sym('bloating', 0.3, 0.6, { stageRelevance: [1, 2] }),
      sym('obstipation', 0.3, 0.85, { stageRelevance: [2] }),
      sym('previous_similar_episodes', 0.1, 0.85, { stageRelevance: [1] }),
      sym('family_history_gi_cancer', 0.15, 0.9, { stageRelevance: [1] }),
      sym('smoking', 0.3, 0.65, { stageRelevance: [1] }),
      sym('alcohol_use', 0.35, 0.7, { stageRelevance: [1] }),
      sym('known_cancer', 0.1, 0.9, { stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('hematochezia', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.3, label: 'No haematochezia — left-sided colon cancer less likely' }),
    ],
    supporting: [
      sym('melena', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.4, label: 'No melena — right-sided colon cancer less likely' }),
    ],
  },

  differential: {
    mimics: ['ibs', 'diverticulitis', 'crohns_disease', 'constipation_simple', 'intestinal_obstruction'],
    distinguishingFeatures: [
      { fromDiseaseId: 'ibs', featureIds: ['hematochezia', 'weight_loss', 'family_history_gi_cancer', 'age'] },
      { fromDiseaseId: 'diverticulitis', featureIds: ['fever', 'pain_onset', 'previous_similar_episodes'] },
      { fromDiseaseId: 'crohns_disease', featureIds: ['fever', 'diarrhea', 'previous_similar_episodes'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Bowel obstruction', warningFeatures: ['obstipation', 'abdominal_distension', 'vomiting'],
      riskFactors: ['left_sided_tumour'], timeWindowHours: [4320, 43200], severityTier: 'severe',
      description: 'Obstructing tumour causing large bowel obstruction requiring surgical decompression.' },
    { name: 'Perforation', warningFeatures: ['peritonism', 'rigidity'],
      riskFactors: ['obstruction'], timeWindowHours: [4320, 43200], severityTier: 'critical',
      description: 'Tumour perforation causing faecal peritonitis — surgical emergency.' },
    { name: 'Metastatic disease', warningFeatures: ['weight_loss', 'abdominal_distension'],
      riskFactors: ['delayed_presentation'], timeWindowHours: [21600, 43200], severityTier: 'severe',
      description: 'Spread to liver, lungs, or peritoneum — curative resection may no longer be possible.' },
  ],

  clinicalScores: [],

  redFlagFeatureIds: ['hematochezia', 'weight_loss', 'obstipation'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 4. HSP (HENOCH-SCHONLEIN PURPURA)
// ═══════════════════════════════════════════════════════════════════════════════
export const henochSchonleinPurpura: DiseaseNode = {
  id: 'henoch_schonlein_purpura',
  name: 'Henoch-Schönlein Purpura (IgA Vasculitis)',
  icdCode: 'D69.0',
  system: 'medical',
  organSystem: 'dermatological',
  acuity: 'semi_urgent',
  acuityTier: 3,

  epidemiology: {
    ageMin: 1, ageMax: 50, agePeak: [3, 12],
    sexRisk: { male: 1.5, female: 1.0 },
    backgroundPrevalence: 0.001,
    riskFactors: [
      { featureId: 'recent_travel', label: 'Recent infection (post-infectious trigger)', LR_positive: 3.0, prevalenceInDisease: 0.5 },
    ],
  },

  pathophysiology: {
    mechanism: 'IgA-mediated small-vessel vasculitis with classical tetrad: palpable purpura (non-thrombocytopenic), arthralgia, abdominal pain, and renal involvement. The abdominal pain results from vasculitis of the GI tract wall, causing submucosal haemorrhage and oedema. Intussusception is a feared complication. The disease is typically self-limiting in children but may cause long-term renal impairment in adults.',
    timelineStages: [
      { stageId: 1, label: 'Acute (0-7d)', typicalHoursFromOnset: [0, 168],
        dominantSymptoms: [sym('pain_onset', 0.6, 0.5), sym('pain_initial_location', 0.6, 0.5),
          sym('pain_character', 0.6, 0.55), sym('skin_rash', 0.9, 0.85),
          sym('joint_pain', 0.7, 0.8)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Colicky, diffuse', painLocationTypical: 'Periumbilical, diffuse',
        painRadiationTypical: 'None' },
      { stageId: 2, label: 'Resolving (2-4w)', typicalHoursFromOnset: [168, 672],
        dominantSymptoms: [sym('skin_rash', 0.5, 0.85), sym('joint_pain', 0.3, 0.8)],
        examFindings: [], severityTrajectory: 'improving',
        painCharacterTypical: 'Mild or resolving', painLocationTypical: 'Diffuse',
        painRadiationTypical: 'None' },
    ],
    progressionRule: 'Acute phase lasts 0-7 days. Most cases resolve spontaneously over 2-4 weeks. Renal involvement (IgA nephropathy) may present weeks after initial illness.',
  },

  features: {
    symptoms: [
      sym('pain_onset', 0.6, 0.5, { stageRelevance: [1] }),
      sym('pain_initial_location', 0.6, 0.5, { stageRelevance: [1] }),
      sym('pain_location_now', 0.5, 0.5, { stageRelevance: [1] }),
      sym('pain_character', 0.6, 0.55, { stageRelevance: [1] }),
      sym('skin_rash', 0.9, 0.85, { stageRelevance: [1, 2] }),
      sym('joint_pain', 0.7, 0.8, { stageRelevance: [1, 2] }),
      sym('nausea', 0.4, 0.5, { stageRelevance: [1] }),
      sym('vomiting', 0.3, 0.55, { stageRelevance: [1] }),
      sym('hematochezia', 0.3, 0.85, { stageRelevance: [1] }),
      sym('melena', 0.2, 0.9, { stageRelevance: [1] }),
      sym('abdominal_distension', 0.3, 0.7, { stageRelevance: [1] }),
      sym('peritonism', 0.2, 0.85, { stageRelevance: [1] }),
      sym('fever', 0.4, 0.6, { stageRelevance: [1] }),
      sym('previous_similar_episodes', 0.2, 0.8, { stageRelevance: [1] }),
      sym('recent_travel', 0.5, 0.8, { stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('skin_rash', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.05, label: 'No palpable purpura — HSP very unlikely' }),
    ],
    supporting: [
      sym('hematochezia', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.4, label: 'No GI bleeding — supports milder course' }),
    ],
  },

  differential: {
    mimics: ['acute_appendicitis', 'intussusception', 'ibs', 'coeliac_disease', 'meningococcaemia'],
    distinguishingFeatures: [
      { fromDiseaseId: 'acute_appendicitis', featureIds: ['skin_rash', 'joint_pain', 'pain_migration'] },
      { fromDiseaseId: 'intussusception', featureIds: ['pain_onset', 'skin_rash', 'hematochezia'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Intussusception', warningFeatures: ['peritonism', 'hematochezia', 'abdominal_distension'],
      riskFactors: ['age<6'], timeWindowHours: [24, 168], severityTier: 'severe',
      description: 'Ileal intussusception due to bowel wall vasculitis — may require surgical reduction.' },
    { name: 'IgA nephropathy', warningFeatures: ['weight_loss', 'fatigue'],
      riskFactors: ['age>20'], timeWindowHours: [168, 2160], severityTier: 'moderate',
      description: 'Renal involvement with haematuria and proteinuria — monitor renal function.' },
  ],

  clinicalScores: [],

  redFlagFeatureIds: ['hematochezia', 'peritonism', 'syncope'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 5. ABDOMINAL TUBERCULOSIS
// ═══════════════════════════════════════════════════════════════════════════════
export const abdominalTb: DiseaseNode = {
  id: 'abdominal_tb',
  name: 'Abdominal Tuberculosis',
  icdCode: 'A18.3',
  system: 'infectious',
  organSystem: 'infectious',
  acuity: 'routine',
  acuityTier: 4,

  epidemiology: {
    ageMin: 15, ageMax: 60, agePeak: [20, 40],
    sexRisk: { male: 1.0, female: 1.1 },
    backgroundPrevalence: 0.001,
    geographicFlags: ['endemic_tb'],
    riskFactors: [
      { featureId: 'hiv_status', label: 'HIV / immunocompromised', LR_positive: 6.0, prevalenceInDisease: 0.3 },
      { featureId: 'recent_travel', label: 'Travel to endemic region', LR_positive: 4.0, prevalenceInDisease: 0.5 },
    ],
  },

  pathophysiology: {
    mechanism: 'Mycobacterium tuberculosis infection of the peritoneum, abdominal lymph nodes, or GI tract. Peritoneal TB is the most common form, presenting with exudative ascites, abdominal pain, and constitutional symptoms. The infection is typically haematogenous from a primary pulmonary focus or from reactivation of latent TB. Ileocaecal TB may mimic Crohn\'s disease with RLQ pain and mass.',
    timelineStages: [
      { stageId: 1, label: 'Early symptomatic', typicalHoursFromOnset: [0, 2160],
        dominantSymptoms: [sym('pain_onset', 0.6, 0.5), sym('pain_character', 0.5, 0.5),
          sym('weight_loss', 0.6, 0.85), sym('fever', 0.6, 0.6), sym('night_sweats', 0.5, 0.9)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Dull ache, diffuse or RLQ', painLocationTypical: 'Diffuse or RLQ',
        painRadiationTypical: 'None' },
      { stageId: 2, label: 'Advanced with ascites', typicalHoursFromOnset: [2160, 8640],
        dominantSymptoms: [sym('abdominal_distension', 0.7, 0.7), sym('weight_loss', 0.8, 0.85),
          sym('fever', 0.7, 0.6), sym('night_sweats', 0.7, 0.9), sym('fatigue', 0.8, 0.5)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Dull, diffuse abdominal discomfort',
        painLocationTypical: 'Diffuse — whole abdomen with distension',
        painRadiationTypical: 'None' },
    ],
    progressionRule: 'Insidious onset over weeks to months. Early symptoms are non-specific. Ascites develops gradually. Without treatment, disseminated TB and mortality.',
  },

  features: {
    symptoms: [
      sym('pain_onset', 0.6, 0.5, { stageRelevance: [1] }),
      sym('pain_initial_location', 0.5, 0.5, { stageRelevance: [1] }),
      sym('pain_character', 0.5, 0.5, { stageRelevance: [1, 2] }),
      sym('abdominal_distension', 0.7, 0.7, { stageRelevance: [2] }),
      sym('weight_loss', 0.7, 0.85, { stageRelevance: [1, 2] }),
      sym('fever', 0.65, 0.6, { stageRelevance: [1, 2] }),
      sym('night_sweats', 0.6, 0.9, { stageRelevance: [1, 2] }),
      sym('fatigue', 0.7, 0.5, { stageRelevance: [1, 2] }),
      sym('anorexia', 0.5, 0.55, { stageRelevance: [1] }),
      sym('diarrhea', 0.3, 0.7, { stageRelevance: [1] }),
      sym('constipation', 0.3, 0.75, { stageRelevance: [1] }),
      sym('hiv_status', 0.3, 0.85, { stageRelevance: [1] }),
      sym('recent_travel', 0.5, 0.8, { stageRelevance: [1] }),
      sym('previous_similar_episodes', 0.05, 0.9, { stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('weight_loss', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.2, label: 'No weight loss — abdominal TB less likely' }),
    ],
    supporting: [
      sym('hematochezia', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.3, label: 'No haematochezia — supports TB over IBD' }),
    ],
  },

  differential: {
    mimics: ['crohns_disease', 'ovarian_cancer', 'cirrhosis_ascites', 'lymphoma', 'peritoneal_carcinomatosis'],
    distinguishingFeatures: [
      { fromDiseaseId: 'crohns_disease', featureIds: ['night_sweats', 'fever', 'previous_similar_episodes', 'recent_travel'] },
      { fromDiseaseId: 'ovarian_cancer', featureIds: ['last_menstrual_period', 'pain_onset'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Intestinal perforation', warningFeatures: ['peritonism', 'rigidity', 'fever_chills'],
      riskFactors: ['delayed_treatment'], timeWindowHours: [4320, 21600], severityTier: 'critical',
      description: 'Tuberculous ulcer perforation causing peritonitis — surgical emergency.' },
    { name: 'Intestinal obstruction', warningFeatures: ['obstipation', 'abdominal_distension', 'vomiting'],
      riskFactors: ['ileocaecal_disease'], timeWindowHours: [4320, 21600], severityTier: 'severe',
      description: 'Stricture formation from healed TB ulcers causing bowel obstruction.' },
  ],

  clinicalScores: [],

  redFlagFeatureIds: ['fever_chills'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 6. LEAD POISONING
// ═══════════════════════════════════════════════════════════════════════════════
export const leadPoisoning: DiseaseNode = {
  id: 'lead_poisoning',
  name: 'Lead Poisoning',
  icdCode: 'T56.0',
  system: 'toxicological',
  organSystem: 'metabolic',
  acuity: 'semi_urgent',
  acuityTier: 3,

  epidemiology: {
    ageMin: 1, ageMax: 70, agePeak: [1, 10],
    sexRisk: { male: 1.2, female: 1.0 },
    backgroundPrevalence: 0.0005,
    geographicFlags: ['industrial'],
    riskFactors: [
      { featureId: 'prior_abdominal_surgery', label: 'Occupational exposure (battery, paint, plumbing)', LR_positive: 5.0, prevalenceInDisease: 0.4 },
    ],
  },

  pathophysiology: {
    mechanism: 'Chronic lead exposure disrupts haem synthesis and causes neurotoxicity. Abdominal manifestations are due to lead-induced smooth muscle spasm of the intestinal wall, producing severe colicky pain. The pain is typically diffuse, episodic, and may be accompanied by constipation or obstipation. Chronic exposure also causes microcytic anaemia, peripheral neuropathy, and renal impairment. Children are particularly vulnerable to neurodevelopmental effects.',
    timelineStages: [
      { stageId: 1, label: 'Acute colic', typicalHoursFromOnset: [0, 72],
        dominantSymptoms: [sym('pain_onset', 0.5, 0.5), sym('pain_character', 0.8, 0.6),
          sym('pain_severity', 0.8, 0.4), sym('constipation', 0.6, 0.75)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Severe colicky, cramping', painLocationTypical: 'Diffuse abdomen',
        painRadiationTypical: 'None' },
      { stageId: 2, label: 'Chronic toxicity', typicalHoursFromOnset: [72, 2160],
        dominantSymptoms: [sym('fatigue', 0.7, 0.5), sym('weight_loss', 0.4, 0.85),
          sym('constipation', 0.5, 0.75), sym('anorexia', 0.5, 0.55)],
        examFindings: [], severityTrajectory: 'stable',
        painCharacterTypical: 'Recurrent colicky episodes', painLocationTypical: 'Diffuse',
        painRadiationTypical: 'None' },
    ],
    progressionRule: 'Acute colic episodes last hours to days. Chronic exposure leads to persistent toxicity. Chelation therapy is required for significant blood lead levels.',
  },

  features: {
    symptoms: [
      sym('pain_onset', 0.5, 0.5, { stageRelevance: [1] }),
      sym('pain_initial_location', 0.3, 0.5, { stageRelevance: [1] }),
      sym('pain_character', 0.8, 0.6, { stageRelevance: [1, 2] }),
      sym('pain_severity', 0.8, 0.4, { stageRelevance: [1] }),
      sym('constipation', 0.6, 0.75, { stageRelevance: [1, 2] }),
      sym('obstipation', 0.3, 0.85, { stageRelevance: [1] }),
      sym('anorexia', 0.5, 0.55, { stageRelevance: [1, 2] }),
      sym('fatigue', 0.7, 0.5, { stageRelevance: [2] }),
      sym('weight_loss', 0.4, 0.85, { stageRelevance: [2] }),
      sym('joint_pain', 0.3, 0.8, { stageRelevance: [2] }),
      sym('previous_similar_episodes', 0.5, 0.7, { stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('pain_character', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.15, label: 'Non-colicky pain — lead colic unlikely' }),
    ],
    supporting: [
      sym('hematochezia', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.3, label: 'No haematochezia — supports lead colic over IBD' }),
    ],
  },

  differential: {
    mimics: ['ibs', 'constipation_simple', 'intestinal_obstruction', 'porphyria', 'pancreatitis'],
    distinguishingFeatures: [
      { fromDiseaseId: 'ibs', featureIds: ['pain_severity', 'constipation', 'previous_similar_episodes'] },
      { fromDiseaseId: 'intestinal_obstruction', featureIds: ['pain_onset', 'vomiting', 'obstipation'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Lead encephalopathy', warningFeatures: ['syncope'],
      riskFactors: ['children', 'high_exposure'], timeWindowHours: [720, 4320], severityTier: 'critical',
      description: 'Cerebral oedema and neurological deterioration — medical emergency requiring chelation.' },
    { name: 'Peripheral neuropathy', warningFeatures: ['joint_pain'],
      riskFactors: ['chronic_exposure'], timeWindowHours: [4320, 43200], severityTier: 'moderate',
      description: 'Motor neuropathy typically affecting wrist and ankle extensors (lead palsy).' },
  ],

  clinicalScores: [],

  redFlagFeatureIds: ['syncope'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 7. STRANGULATED HERNIA
// ═══════════════════════════════════════════════════════════════════════════════
export const strangulatedHernia: DiseaseNode = {
  id: 'strangulated_hernia',
  name: 'Strangulated Hernia',
  icdCode: 'K46.0',
  system: 'surgical',
  organSystem: 'GI',
  acuity: 'immediately_life_threatening',
  acuityTier: 1,

  epidemiology: {
    ageMin: 40, ageMax: 90, agePeak: [60, 85],
    sexRisk: { male: 2.0, female: 1.0 },
    backgroundPrevalence: 0.002,
    riskFactors: [
      { featureId: 'prior_abdominal_surgery', label: 'Previous hernia repair', LR_positive: 3.0, prevalenceInDisease: 0.2 },
    ],
  },

  pathophysiology: {
    mechanism: 'A hernia with compromised blood supply to the herniated bowel (strangulation) — a surgical emergency. Unlike simple incarceration (where the hernia is irreducible but bowel is viable), strangulation causes bowel ischaemia, necrosis, and perforation within hours. The classic presentation is a painful, irreducible, tender hernia mass with signs of bowel obstruction (nausea, vomiting, obstipation) and eventually peritonism over the hernia site.',
    timelineStages: [
      { stageId: 1, label: 'Strangulation (0-6h — bowel viable)', typicalHoursFromOnset: [0, 6],
        dominantSymptoms: [sym('pain_onset', 0.8, 0.6), sym('pain_character', 0.7, 0.55),
          sym('hernia_mass', 0.9, 0.85), sym('nausea', 0.6, 0.5)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Severe, constant pain at hernia site',
        painLocationTypical: 'Groin or abdominal wall at hernia site',
        painRadiationTypical: 'None' },
      { stageId: 2, label: 'Necrosis (>6h — bowel non-viable)', typicalHoursFromOnset: [6, 24],
        dominantSymptoms: [sym('vomiting_description', 0.4, 0.85), sym('obstipation', 0.7, 0.85),
          sym('abdominal_distension', 0.6, 0.7), sym('peritonism', 0.7, 0.85),
          sym('syncope', 0.3, 0.9), sym('fever', 0.5, 0.6)],
        examFindings: [], severityTrajectory: 'rapidly_worsening',
        painCharacterTypical: 'Excruciating, constant', painLocationTypical: 'Hernia site + diffuse',
        painRadiationTypical: 'None' },
    ],
    progressionRule: 'Strangulation leads to bowel necrosis within 6 hours. Perforation and generalised peritonitis follow rapidly. Emergency surgery is mandatory.',
  },

  features: {
    symptoms: [
      sym('pain_onset', 0.8, 0.6, { stageRelevance: [1] }),
      sym('pain_initial_location', 0.7, 0.5, { stageRelevance: [1] }),
      sym('pain_character', 0.7, 0.55, { stageRelevance: [1, 2] }),
      sym('pain_severity', 0.8, 0.4, { stageRelevance: [1, 2] }),
      sym('hernia_mass', 0.9, 0.85, { stageRelevance: [1, 2] }),
      sym('nausea', 0.6, 0.5, { stageRelevance: [1] }),
      sym('vomiting', 0.6, 0.55, { stageRelevance: [2] }),
      sym('vomiting_description', 0.4, 0.85, { stageRelevance: [2] }),
      sym('obstipation', 0.7, 0.85, { stageRelevance: [2] }),
      sym('abdominal_distension', 0.6, 0.7, { stageRelevance: [2] }),
      sym('peritonism', 0.7, 0.85, { stageRelevance: [2] }),
      sym('syncope', 0.3, 0.9, { stageRelevance: [2] }),
      sym('fever', 0.5, 0.6, { stageRelevance: [2] }),
      sym('prior_abdominal_surgery', 0.2, 0.7, { stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('hernia_mass', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.02, label: 'No hernia mass — strangulated hernia excluded' }),
    ],
    supporting: [
      sym('obstipation', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.2, label: 'Passing gas — obstruction unlikely' }),
    ],
  },

  differential: {
    mimics: ['intestinal_obstruction', 'testicular_torsion', 'orchitis', 'incarcerated_hernia', 'strangulated_hernia'],
    distinguishingFeatures: [
      { fromDiseaseId: 'intestinal_obstruction', featureIds: ['hernia_mass', 'pain_initial_location'] },
      { fromDiseaseId: 'testicular_torsion', featureIds: ['hernia_mass', 'scrotal_swelling', 'testicular_pain'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Bowel necrosis', warningFeatures: ['peritonism', 'fever_chills', 'syncope'],
      riskFactors: ['delayed_presentation'], timeWindowHours: [6, 24], severityTier: 'critical',
      description: 'Non-viable bowel requiring resection — mortality increases with delay.' },
    { name: 'Perforation / peritonitis', warningFeatures: ['peritonism', 'rigidity', 'syncope'],
      riskFactors: [], timeWindowHours: [12, 48], severityTier: 'critical',
      description: 'Faecal peritonitis from perforated strangulated bowel — surgical emergency.' },
    { name: 'Sepsis / septic shock', warningFeatures: ['syncope', 'fever_chills'],
      riskFactors: ['age>70', 'diabetes'], timeWindowHours: [12, 48], severityTier: 'critical',
      description: 'Systemic infection from necrotic bowel — ICU-level care required.' },
  ],

  clinicalScores: [],

  redFlagFeatureIds: ['peritonism', 'syncope'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// Other disease index
// ═══════════════════════════════════════════════════════════════════════════════
export const OTHER_NODES: DiseaseNode[] = [
  rectusSheathHaematoma,
  herpesZoster,
  colonCancer,
  henochSchonleinPurpura,
  abdominalTb,
  leadPoisoning,
  strangulatedHernia,
];
