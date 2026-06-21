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
// 1. IRRITABLE BOWEL SYNDROME
// ═══════════════════════════════════════════════════════════════════════════════
export const ibs: DiseaseNode = {
  id: 'ibs',
  name: 'Irritable Bowel Syndrome',
  icdCode: 'K58',
  system: 'medical',
  organSystem: 'GI',
  acuity: 'routine',
  acuityTier: 4,

  epidemiology: {
    ageMin: 10, ageMax: 70, agePeak: [20, 40],
    sexRisk: { male: 0.7, female: 1.3 },
    backgroundPrevalence: 0.1,
    riskFactors: [
      { featureId: 'previous_similar_episodes', label: 'Prior similar episodes', LR_positive: 2.5, prevalenceInDisease: 0.7 },
      { featureId: 'stress', label: 'Psychological stress', LR_positive: 3.0, prevalenceInDisease: 0.6 },
      { featureId: 'anxiety', label: 'Anxiety disorder', LR_positive: 2.5, prevalenceInDisease: 0.4 },
    ],
  },

  pathophysiology: {
    mechanism: 'Irritable Bowel Syndrome is a functional bowel disorder characterised by chronic relapsing abdominal pain associated with defecation, change in bowel habit, and bloating, in the absence of organic pathology. The pathophysiology involves visceral hypersensitivity, altered gut motility, dysregulation of the brain-gut axis, and changes in the gut microbiome. Pain is typically cramping and located in the lower abdomen, often worsened by eating and relieved by passing stool.',
    timelineStages: [
      { stageId: 1, label: 'Flare', typicalHoursFromOnset: [0, 168],
        dominantSymptoms: [sym('pain_character', 0.8, 0.55), sym('pain_initial_location', 0.7, 0.5),
          sym('bloating', 0.75, 0.6), sym('alternat_bowel', 0.7, 0.65)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Cramping, colicky', painLocationTypical: 'Lower abdomen, diffuse',
        painRadiationTypical: 'None' },
      { stageId: 2, label: 'Remission', typicalHoursFromOnset: [168, 720],
        dominantSymptoms: [sym('pain_character', 0.2, 0.5), sym('bloating', 0.3, 0.6)],
        examFindings: [], severityTrajectory: 'improving',
        painCharacterTypical: 'Mild or absent', painLocationTypical: 'None',
        painRadiationTypical: 'None' },
    ],
    progressionRule: 'Flare episodes typically last days to weeks, with symptom-free intervals between flares. Triggers include stress, dietary factors, and intercurrent illness.',
  },

  features: {
    symptoms: [
      sym('pain_character', 0.8, 0.55, { stageRelevance: [1] }),
      sym('pain_initial_location', 0.7, 0.5, { stageRelevance: [1] }),
      sym('pain_relieving_factors', 0.6, 0.6, { stageRelevance: [1] }),
      sym('alternat_bowel', 0.7, 0.65, { stageRelevance: [1] }),
      sym('constipation', 0.5, 0.6, { stageRelevance: [1] }),
      sym('diarrhea', 0.5, 0.55, { stageRelevance: [1] }),
      sym('bloating', 0.75, 0.6, { stageRelevance: [1] }),
      sym('stool_relief', 0.6, 0.6, { stageRelevance: [1] }),
      sym('previous_similar_episodes', 0.7, 0.65, { stageRelevance: [1] }),
      sym('eating_worsens', 0.5, 0.55, { stageRelevance: [1] }),
      sym('anorexia', 0.3, 0.55, { stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('hematochezia', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.05, label: 'No blood in stool — IBD unlikely' }),
      sym('weight_loss', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.15, label: 'No weight loss — organic disease less likely' }),
    ],
    supporting: [
      sym('melena', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.1, label: 'No melena — upper GI bleeding unlikely' }),
      sym('fever', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.2, label: 'No fever — inflammatory cause less likely' }),
    ],
  },

  differential: {
    mimics: ['crohns_disease', 'ulcerative_colitis', 'coeliac_disease', 'gastritis', 'constipation_simple'],
    distinguishingFeatures: [
      { fromDiseaseId: 'crohns_disease', featureIds: ['hematochezia', 'weight_loss', 'fever'] },
      { fromDiseaseId: 'ulcerative_colitis', featureIds: ['hematochezia', 'mucus_stool', 'tenesmus'] },
      { fromDiseaseId: 'coeliac_disease', featureIds: ['weight_loss', 'skin_rash', 'joint_pain'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Reduced quality of life', warningFeatures: ['previous_similar_episodes'],
      riskFactors: ['anxiety', 'stress'], timeWindowHours: [720, 4320], severityTier: 'mild',
      description: 'Chronic relapsing symptoms significantly impair daily functioning and quality of life.' },
  ],

  clinicalScores: [{
    name: 'Rome IV Criteria (IBS)',
    items: [
      { featureId: 'pain_character', label: 'Recurrent abdominal pain (≥1 day/week)', pointsWhenPresent: 1 },
      { featureId: 'stool_relief', label: 'Pain related to defecation', pointsWhenPresent: 1 },
      { featureId: 'alternat_bowel', label: 'Change in stool frequency', pointsWhenPresent: 1 },
      { featureId: 'bloating', label: 'Change in stool form (appearance)', pointsWhenPresent: 1 },
    ],
    interpretationThresholds: [
      { maxScore: 2, label: 'IBS possible but not diagnostic' },
      { maxScore: 4, label: 'Meets Rome IV criteria for IBS' },
    ],
    maxScore: 4,
  }],

  redFlagFeatureIds: [],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 2. INFLAMMATORY BOWEL DISEASE — CROHN'S
// ═══════════════════════════════════════════════════════════════════════════════
export const crohnsDisease: DiseaseNode = {
  id: 'crohns_disease',
  name: 'Crohn\'s Disease',
  icdCode: 'K50',
  system: 'medical',
  organSystem: 'GI',
  acuity: 'semi_urgent',
  acuityTier: 3,

  epidemiology: {
    ageMin: 10, ageMax: 60, agePeak: [15, 30],
    sexRisk: { male: 1.1, female: 1.0 },
    backgroundPrevalence: 0.003,
    riskFactors: [
      { featureId: 'family_history_gi_cancer', label: 'Family history of IBD', LR_positive: 4.0, prevalenceInDisease: 0.15 },
      { featureId: 'smoking', label: 'Smoking', LR_positive: 2.5, prevalenceInDisease: 0.45 },
      { featureId: 'previous_similar_episodes', label: 'Prior flares', LR_positive: 5.0, prevalenceInDisease: 0.7 },
    ],
  },

  pathophysiology: {
    mechanism: 'Chronic transmural inflammation of the gastrointestinal tract, most commonly affecting the ileocolic region. The inflammation is discontinuous (skip lesions) and can lead to strictures, fistulas, and abscesses. Presents with right lower quadrant abdominal pain, diarrhoea, weight loss, and fever. The transmural nature predisposes to fistulising complications.',
    timelineStages: [
      { stageId: 1, label: 'Active flare', typicalHoursFromOnset: [0, 168],
        dominantSymptoms: [sym('pain_initial_location', 0.7, 0.55), sym('pain_character', 0.6, 0.5),
          sym('diarrhea', 0.8, 0.55), sym('weight_loss', 0.6, 0.75)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Cramping, colicky', painLocationTypical: 'Right lower quadrant',
        painRadiationTypical: 'None' },
      { stageId: 2, label: 'Remission', typicalHoursFromOnset: [168, 4320],
        dominantSymptoms: [sym('diarrhea', 0.2, 0.5), sym('pain_character', 0.2, 0.5)],
        examFindings: [], severityTrajectory: 'improving',
        painCharacterTypical: 'Mild or absent', painLocationTypical: 'None',
        painRadiationTypical: 'None' },
    ],
    progressionRule: 'Chronic relapsing course. Flare episodes last weeks to months. Complications (stricture, fistula, abscess) develop over months to years without adequate disease control.',
  },

  features: {
    symptoms: [
      sym('pain_initial_location', 0.7, 0.55, { stageRelevance: [1] }),
      sym('pain_character', 0.6, 0.5, { stageRelevance: [1] }),
      sym('diarrhea', 0.8, 0.55, { stageRelevance: [1] }),
      sym('hematochezia', 0.3, 0.85, { stageRelevance: [1] }),
      sym('mucus_stool', 0.3, 0.75, { stageRelevance: [1] }),
      sym('tenesmus', 0.2, 0.8, { stageRelevance: [1] }),
      sym('weight_loss', 0.6, 0.75, { stageRelevance: [1] }),
      sym('fever', 0.5, 0.55, { stageRelevance: [1] }),
      sym('abdominal_distension', 0.3, 0.65, { stageRelevance: [1] }),
      sym('fatigue', 0.7, 0.5, { stageRelevance: [1] }),
      sym('joint_pain', 0.3, 0.75, { stageRelevance: [1] }),
      sym('skin_rash', 0.15, 0.85, { stageRelevance: [1] }),
      sym('previous_similar_episodes', 0.7, 0.65, { stageRelevance: [1] }),
      sym('anorexia', 0.5, 0.55, { stageRelevance: [1] }),
      sym('family_history_gi_cancer', 0.15, 0.9, { stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('diarrhea', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.1, label: 'No diarrhoea — active Crohn\'s unlikely' }),
    ],
    supporting: [
      sym('hematochezia', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.4, label: 'No blood in stool supports IBS over IBD' }),
    ],
  },

  differential: {
    mimics: ['ibs', 'ulcerative_colitis', 'acute_appendicitis', 'infectious_colitis', 'diverticulitis'],
    distinguishingFeatures: [
      { fromDiseaseId: 'ibs', featureIds: ['hematochezia', 'weight_loss', 'fever', 'family_history_gi_cancer'] },
      { fromDiseaseId: 'ulcerative_colitis', featureIds: ['pain_initial_location', 'tenesmus', 'hematochezia'] },
      { fromDiseaseId: 'acute_appendicitis', featureIds: ['pain_migration', 'fever', 'previous_similar_episodes'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Bowel stricture', warningFeatures: ['abdominal_distension', 'obstipation'],
      riskFactors: ['long_disease_duration'], timeWindowHours: [4320, 43200], severityTier: 'severe',
      description: 'Chronic transmural inflammation leads to fibrotic narrowing requiring endoscopic dilation or surgical resection.' },
    { name: 'Fistula formation', warningFeatures: ['skin_rash', 'fever_chills'],
      riskFactors: ['perianal_disease'], timeWindowHours: [4320, 43200], severityTier: 'severe',
      description: 'Abnormal communication between bowel and adjacent structures (bladder, vagina, skin) requiring surgical management.' },
    { name: 'Toxic megacolon', warningFeatures: ['abdominal_distension', 'fever_chills', 'peritonism'],
      riskFactors: ['severe_flare', 'steroid_use'], timeWindowHours: [168, 720], severityTier: 'critical',
      description: 'Colonic dilation >6cm with systemic toxicity — surgical emergency.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['hematochezia', 'fever_chills'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 3. INFLAMMATORY BOWEL DISEASE — ULCERATIVE COLITIS
// ═══════════════════════════════════════════════════════════════════════════════
export const ulcerativeColitis: DiseaseNode = {
  id: 'ulcerative_colitis',
  name: 'Ulcerative Colitis',
  icdCode: 'K51',
  system: 'medical',
  organSystem: 'GI',
  acuity: 'semi_urgent',
  acuityTier: 3,

  epidemiology: {
    ageMin: 15, ageMax: 70, agePeak: [20, 40],
    sexRisk: { male: 1.0, female: 1.0 },
    backgroundPrevalence: 0.003,
    riskFactors: [
      { featureId: 'family_history_gi_cancer', label: 'Family history of IBD', LR_positive: 4.0, prevalenceInDisease: 0.15 },
      { featureId: 'previous_similar_episodes', label: 'Prior flares', LR_positive: 5.0, prevalenceInDisease: 0.7 },
    ],
  },

  pathophysiology: {
    mechanism: 'Chronic continuous inflammation confined to the colonic mucosa, starting at the rectum and extending proximally in a contiguous manner. Presents with bloody diarrhoea, tenesmus, and left lower quadrant abdominal pain. Unlike Crohn\'s disease, inflammation is limited to the mucosa and does not involve the entire bowel wall, making fistulas and strictures less common.',
    timelineStages: [
      { stageId: 1, label: 'Mild–moderate flare', typicalHoursFromOnset: [0, 168],
        dominantSymptoms: [sym('diarrhea', 0.8, 0.55), sym('hematochezia', 0.7, 0.85),
          sym('tenesmus', 0.6, 0.8), sym('pain_initial_location', 0.6, 0.5)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Cramping, colicky', painLocationTypical: 'Left lower quadrant',
        painRadiationTypical: 'None' },
      { stageId: 2, label: 'Severe flare', typicalHoursFromOnset: [168, 336],
        dominantSymptoms: [sym('hematochezia', 0.9, 0.85), sym('urgency', 0.8, 0.75),
          sym('fever', 0.6, 0.55), sym('weight_loss', 0.5, 0.75)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Severe cramping', painLocationTypical: 'Left lower quadrant / diffuse',
        painRadiationTypical: 'None' },
    ],
    progressionRule: 'Chronic relapsing course. Mild–moderate flares may resolve with medical therapy. Severe flares risk progression to toxic megacolon and require hospitalisation.',
  },

  features: {
    symptoms: [
      sym('pain_initial_location', 0.6, 0.5, { stageRelevance: [1] }),
      sym('pain_character', 0.6, 0.5, { stageRelevance: [1, 2] }),
      sym('diarrhea', 0.85, 0.55, { stageRelevance: [1, 2] }),
      sym('hematochezia', 0.8, 0.85, { stageRelevance: [1, 2] }),
      sym('mucus_stool', 0.5, 0.75, { stageRelevance: [1, 2] }),
      sym('tenesmus', 0.65, 0.8, { stageRelevance: [1, 2] }),
      sym('urgency', 0.7, 0.75, { stageRelevance: [1, 2] }),
      sym('fever', 0.5, 0.55, { stageRelevance: [2] }),
      sym('weight_loss', 0.4, 0.75, { stageRelevance: [2] }),
      sym('fatigue', 0.7, 0.5, { stageRelevance: [1, 2] }),
      sym('joint_pain', 0.2, 0.75, { stageRelevance: [1, 2] }),
      sym('previous_similar_episodes', 0.7, 0.65, { stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('hematochezia', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.1, label: 'No blood in stool — active UC very unlikely' }),
    ],
    supporting: [
      sym('obstipation', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.3, label: 'No constipation — supports inflammatory cause over functional' }),
    ],
  },

  differential: {
    mimics: ['ibs', 'crohns_disease', 'infectious_colitis', 'diverticulitis', 'constipation_simple'],
    distinguishingFeatures: [
      { fromDiseaseId: 'ibs', featureIds: ['hematochezia', 'tenesmus', 'mucus_stool'] },
      { fromDiseaseId: 'crohns_disease', featureIds: ['pain_initial_location', 'fever', 'skin_rash'] },
      { fromDiseaseId: 'infectious_colitis', featureIds: ['recent_travel', 'fever', 'previous_similar_episodes'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Toxic megacolon', warningFeatures: ['abdominal_distension', 'fever_chills', 'peritonism'],
      riskFactors: ['severe_flare', 'steroid_use'], timeWindowHours: [168, 720], severityTier: 'critical',
      description: 'Colonic dilation >6cm with systemic toxicity — surgical emergency requiring total colectomy.' },
    { name: 'Colorectal carcinoma', warningFeatures: ['weight_loss', 'hematochezia'],
      riskFactors: ['long_disease_duration', 'extensive_colitis'], timeWindowHours: [43200, 262800], severityTier: 'critical',
      description: 'Increased cancer risk after 8–10 years of disease, especially with extensive colitis.' },
  ],

  clinicalScores: [{
    name: 'Mayo Score (Ulcerative Colitis)',
    items: [
      { featureId: 'diarrhea', label: 'Stool frequency', pointsWhenPresent: 1 },
      { featureId: 'hematochezia', label: 'Rectal bleeding', pointsWhenPresent: 1 },
      { featureId: 'urgency', label: 'Urgency of defecation', pointsWhenPresent: 1 },
    ],
    interpretationThresholds: [
      { maxScore: 1, label: 'Clinical remission' },
      { maxScore: 2, label: 'Mild disease activity' },
      { maxScore: 3, label: 'Moderate–severe disease activity' },
    ],
    maxScore: 3,
  }],

  redFlagFeatureIds: ['hematochezia', 'fever_chills'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 4. GASTRITIS
// ═══════════════════════════════════════════════════════════════════════════════
export const gastritis: DiseaseNode = {
  id: 'gastritis',
  name: 'Gastritis',
  icdCode: 'K29',
  system: 'medical',
  organSystem: 'GI',
  acuity: 'routine',
  acuityTier: 4,

  epidemiology: {
    ageMin: 15, ageMax: 80, agePeak: [30, 60],
    sexRisk: { male: 1.0, female: 1.0 },
    backgroundPrevalence: 0.08,
    riskFactors: [
      { featureId: 'nsaid_use', label: 'NSAID use', LR_positive: 4.0, prevalenceInDisease: 0.5 },
      { featureId: 'alcohol_use', label: 'Alcohol use', LR_positive: 2.5, prevalenceInDisease: 0.4 },
      { featureId: 'h_pylori', label: 'H. pylori infection', LR_positive: 5.0, prevalenceInDisease: 0.6 },
    ],
  },

  pathophysiology: {
    mechanism: 'Inflammation of the gastric mucosa caused by disruption of the mucosal protective barrier. Acute gastritis is often triggered by NSAIDs, alcohol, or physiological stress. Chronic gastritis is most commonly due to H. pylori infection. The inflammation causes epigastric pain (burning or gnawing), nausea, heartburn, and belching. Pain may be worsened or relieved by eating depending on the predominant ulcer location.',
    timelineStages: [
      { stageId: 1, label: 'Acute gastritis', typicalHoursFromOnset: [0, 72],
        dominantSymptoms: [sym('pain_initial_location', 0.8, 0.5), sym('pain_character', 0.7, 0.55),
          sym('nausea', 0.7, 0.5), sym('heartburn', 0.5, 0.65)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Burning, gnawing epigastric pain', painLocationTypical: 'Epigastrium',
        painRadiationTypical: 'None' },
      { stageId: 2, label: 'Chronic gastritis', typicalHoursFromOnset: [72, 4320],
        dominantSymptoms: [sym('pain_initial_location', 0.6, 0.5), sym('belching', 0.5, 0.6),
          sym('anorexia', 0.4, 0.55), sym('bloating', 0.4, 0.6)],
        examFindings: [], severityTrajectory: 'stable',
        painCharacterTypical: 'Mild burning or dull ache', painLocationTypical: 'Epigastrium',
        painRadiationTypical: 'None' },
    ],
    progressionRule: 'Acute gastritis typically resolves within days of removing the offending agent. Chronic gastritis persists and may progress to atrophic gastritis, intestinal metaplasia, and gastric cancer over years.',
  },

  features: {
    symptoms: [
      sym('pain_initial_location', 0.8, 0.5, { stageRelevance: [1, 2] }),
      sym('pain_character', 0.7, 0.55, { stageRelevance: [1, 2] }),
      sym('heartburn', 0.5, 0.65, { stageRelevance: [1] }),
      sym('belching', 0.5, 0.6, { stageRelevance: [1, 2] }),
      sym('nausea', 0.7, 0.45, { stageRelevance: [1] }),
      sym('anorexia', 0.4, 0.55, { stageRelevance: [1, 2] }),
      sym('eating_worsens', 0.5, 0.55, { stageRelevance: [1] }),
      sym('eating_relief', 0.3, 0.6, { stageRelevance: [1] }),
      sym('nsaid_use', 0.5, 0.75, { stageRelevance: [1] }),
      sym('alcohol_use', 0.4, 0.7, { stageRelevance: [1] }),
      sym('previous_similar_episodes', 0.5, 0.65, { stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('pain_initial_location', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.1, label: 'No epigastric pain — gastritis unlikely' }),
    ],
    supporting: [
      sym('hematochezia', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.2, label: 'No blood in stool — lower GI bleed unlikely' }),
    ],
  },

  differential: {
    mimics: ['ibs', 'perforated_peptic_ulcer', 'cholecystitis', 'pancreatitis', 'gastric_outlet_obstruction'],
    distinguishingFeatures: [
      { fromDiseaseId: 'perforated_peptic_ulcer', featureIds: ['pain_onset', 'peritonism', 'rigidity'] },
      { fromDiseaseId: 'cholecystitis', featureIds: ['pain_initial_location', 'pain_radiation', 'fever'] },
      { fromDiseaseId: 'pancreatitis', featureIds: ['pain_radiation', 'pain_severity', 'vomiting'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Upper GI bleeding', warningFeatures: ['melena', 'hematemesis'],
      riskFactors: ['nsaid_use', 'alcohol_use'], timeWindowHours: [24, 168], severityTier: 'severe',
      description: 'Erosive gastritis may cause significant bleeding presenting as melena or haematemesis.' },
    { name: 'Peptic ulcer disease', warningFeatures: ['melena', 'eating_worsens'],
      riskFactors: ['h_pylori', 'nsaid_use'], timeWindowHours: [168, 4320], severityTier: 'moderate',
      description: 'Progression from gastritis to frank ulceration of the gastric or duodenal mucosa.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['melena', 'hematemesis'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 5. FOOD POISONING (acute gastroenteritis from preformed toxins / infection)
// ═══════════════════════════════════════════════════════════════════════════════
export const foodPoisoning: DiseaseNode = {
  id: 'food_poisoning',
  name: 'Food Poisoning',
  icdCode: 'A05',
  system: 'medical',
  organSystem: 'GI',
  acuity: 'routine',
  acuityTier: 4,

  epidemiology: {
    ageMin: 0, ageMax: 90, agePeak: [1, 60],
    sexRisk: { male: 1.0, female: 1.0 },
    backgroundPrevalence: 0.05,
    riskFactors: [
      { featureId: 'recent_travel', label: 'Recent travel', LR_positive: 2.5, prevalenceInDisease: 0.3 },
      { featureId: 'sick_contacts', label: 'Multiple affected individuals (same meal)', LR_positive: 5.0, prevalenceInDisease: 0.4 },
    ],
  },

  pathophysiology: {
    mechanism: 'Acute gastroenteritis caused by ingestion of food contaminated with preformed bacterial toxins (S. aureus, B. cereus) or live pathogens (Salmonella, Campylobacter, Shigella). Preformed toxins have a short incubation period (1–6 hours) with prominent vomiting. Infectious pathogens have a longer incubation (12–72 hours) with more diarrhoea. The illness is typically self-limiting.',
    timelineStages: [
      { stageId: 1, label: 'Acute phase', typicalHoursFromOnset: [0, 24],
        dominantSymptoms: [sym('pain_onset', 0.7, 0.5), sym('pain_character', 0.6, 0.5),
          sym('nausea', 0.85, 0.45), sym('vomiting', 0.8, 0.5), sym('diarrhea', 0.8, 0.55)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Cramping, colicky', painLocationTypical: 'Periumbilical',
        painRadiationTypical: 'None' },
      { stageId: 2, label: 'Recovery', typicalHoursFromOnset: [24, 72],
        dominantSymptoms: [sym('diarrhea', 0.5, 0.55), sym('fatigue', 0.4, 0.5)],
        examFindings: [], severityTrajectory: 'improving',
        painCharacterTypical: 'Mild or resolving', painLocationTypical: 'Diffuse',
        painRadiationTypical: 'None' },
    ],
    progressionRule: 'Self-limiting over 24–72 hours. Persistent symptoms >72 hours suggest parasitic infection, IBD, or non-infectious cause.',
  },

  features: {
    symptoms: [
      sym('pain_onset', 0.7, 0.5, { stageRelevance: [1] }),
      sym('pain_character', 0.6, 0.5, { stageRelevance: [1] }),
      sym('pain_initial_location', 0.4, 0.5, { stageRelevance: [1] }),
      sym('nausea', 0.85, 0.45, { stageRelevance: [1] }),
      sym('vomiting', 0.8, 0.5, { stageRelevance: [1] }),
      sym('vomiting_timing', 0.6, 0.55, { stageRelevance: [1] }),
      sym('vomiting_frequency', 0.5, 0.6, { stageRelevance: [1] }),
      sym('diarrhea', 0.8, 0.55, { stageRelevance: [1, 2] }),
      sym('fever', 0.5, 0.55, { stageRelevance: [1] }),
      sym('recent_travel', 0.3, 0.8, { stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('vomiting', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.15, label: 'No vomiting — food poisoning less likely (consider bacterial diarrhoea)' }),
      sym('diarrhea', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.1, label: 'No diarrhoea — food poisoning unlikely' }),
    ],
    supporting: [
      sym('obstipation', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.2, label: 'No obstipation — supports infectious over obstructive cause' }),
    ],
  },

  differential: {
    mimics: ['gastroenteritis', 'ibs', 'crohns_disease', 'appendicitis'],
    distinguishingFeatures: [
      { fromDiseaseId: 'gastroenteritis', featureIds: ['pain_onset', 'sick_contacts', 'recent_travel'] },
      { fromDiseaseId: 'ibs', featureIds: ['fever', 'vomiting', 'previous_similar_episodes'] },
      { fromDiseaseId: 'appendicitis', featureIds: ['pain_migration', 'anorexia', 'vomiting_timing'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Dehydration', warningFeatures: ['syncope', 'vomiting_frequency'],
      riskFactors: ['age<5', 'age>65'], timeWindowHours: [12, 48], severityTier: 'moderate',
      description: 'Fluid loss from vomiting and diarrhoea requiring IV rehydration.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['hematochezia', 'syncope'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 6. COELIAC DISEASE
// ═══════════════════════════════════════════════════════════════════════════════
export const coeliacDisease: DiseaseNode = {
  id: 'coeliac_disease',
  name: 'Coeliac Disease',
  icdCode: 'K90.0',
  system: 'medical',
  organSystem: 'GI',
  acuity: 'routine',
  acuityTier: 4,

  epidemiology: {
    ageMin: 1, ageMax: 80, agePeak: [30, 50],
    sexRisk: { male: 0.7, female: 1.3 },
    backgroundPrevalence: 0.01,
    riskFactors: [
      { featureId: 'family_history_gi_cancer', label: 'Family history of coeliac disease', LR_positive: 6.0, prevalenceInDisease: 0.15 },
      { featureId: 'autoimmune_disease', label: 'Other autoimmune disease (T1DM, thyroiditis)', LR_positive: 4.0, prevalenceInDisease: 0.2 },
    ],
  },

  pathophysiology: {
    mechanism: 'Autoimmune enteropathy triggered by gluten ingestion in genetically susceptible individuals. The immune response targets tissue transglutaminase, leading to villous atrophy, crypt hyperplasia, and intraepithelial lymphocytosis in the small intestine. This results in malabsorption presenting with abdominal pain, bloating, diarrhoea, weight loss, and fatigue. The only effective treatment is a strict gluten-free diet.',
    timelineStages: [
      { stageId: 1, label: 'Active (gluten exposure)', typicalHoursFromOnset: [0, 168],
        dominantSymptoms: [sym('pain_character', 0.5, 0.5), sym('diarrhea', 0.7, 0.55),
          sym('bloating', 0.6, 0.6), sym('fatigue', 0.7, 0.5)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Cramping, diffuse abdominal pain', painLocationTypical: 'Diffuse abdomen',
        painRadiationTypical: 'None' },
      { stageId: 2, label: 'Remission (gluten-free diet)', typicalHoursFromOnset: [168, 4320],
        dominantSymptoms: [sym('diarrhea', 0.2, 0.55), sym('bloating', 0.2, 0.6)],
        examFindings: [], severityTrajectory: 'improving',
        painCharacterTypical: 'Mild or absent', painLocationTypical: 'None',
        painRadiationTypical: 'None' },
    ],
    progressionRule: 'Symptoms develop within hours to days of gluten ingestion. Full mucosal recovery on a gluten-free diet takes weeks to months. Ongoing gluten exposure leads to chronic malabsorption and complications.',
  },

  features: {
    symptoms: [
      sym('pain_character', 0.5, 0.5, { stageRelevance: [1] }),
      sym('pain_initial_location', 0.3, 0.5, { stageRelevance: [1] }),
      sym('diarrhea', 0.7, 0.55, { stageRelevance: [1] }),
      sym('bloating', 0.6, 0.6, { stageRelevance: [1] }),
      sym('constipation', 0.3, 0.6, { stageRelevance: [1] }),
      sym('weight_loss', 0.5, 0.75, { stageRelevance: [1] }),
      sym('fatigue', 0.7, 0.5, { stageRelevance: [1] }),
      sym('skin_rash', 0.2, 0.85, { stageRelevance: [1] }),
      sym('joint_pain', 0.2, 0.75, { stageRelevance: [1] }),
      sym('previous_similar_episodes', 0.6, 0.65, { stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('diarrhea', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.2, label: 'No diarrhoea — coeliac less likely (though constipation-predominant exists)' }),
    ],
    supporting: [
      sym('hematochezia', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.3, label: 'No blood in stool — IBD less likely' }),
    ],
  },

  differential: {
    mimics: ['ibs', 'crohns_disease', 'gastritis', 'food_poisoning', 'constipation_simple'],
    distinguishingFeatures: [
      { fromDiseaseId: 'ibs', featureIds: ['weight_loss', 'skin_rash', 'joint_pain'] },
      { fromDiseaseId: 'crohns_disease', featureIds: ['hematochezia', 'fever', 'skin_rash'] },
      { fromDiseaseId: 'food_poisoning', featureIds: ['pain_onset', 'vomiting', 'previous_similar_episodes'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Malabsorption / nutritional deficiencies', warningFeatures: ['weight_loss', 'fatigue'],
      riskFactors: ['delayed_diagnosis'], timeWindowHours: [4320, 43200], severityTier: 'moderate',
      description: 'Chronic villous atrophy leads to iron-deficiency anaemia, osteoporosis, and vitamin deficiencies.' },
    { name: 'Refractory coeliac disease', warningFeatures: ['weight_loss'],
      riskFactors: ['delayed_diagnosis', 'age>50'], timeWindowHours: [21600, 43200], severityTier: 'severe',
      description: 'Persistent villous atrophy despite strict gluten-free diet — may progress to enteropathy-associated T-cell lymphoma.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['weight_loss'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 7. CONSTIPATION (simple functional)
// ═══════════════════════════════════════════════════════════════════════════════
export const constipationSimple: DiseaseNode = {
  id: 'constipation_simple',
  name: 'Simple Functional Constipation',
  icdCode: 'K59.0',
  system: 'medical',
  organSystem: 'GI',
  acuity: 'routine',
  acuityTier: 4,

  epidemiology: {
    ageMin: 1, ageMax: 90, agePeak: [60, 85],
    sexRisk: { male: 0.5, female: 1.5 },
    backgroundPrevalence: 0.15,
    riskFactors: [
      { featureId: 'low_fibre_diet', label: 'Low-fibre diet', LR_positive: 2.5, prevalenceInDisease: 0.5 },
      { featureId: 'dehydration', label: 'Inadequate fluid intake', LR_positive: 2.0, prevalenceInDisease: 0.4 },
      { featureId: 'opioid_use', label: 'Opioid use', LR_positive: 4.0, prevalenceInDisease: 0.2 },
    ],
  },

  pathophysiology: {
    mechanism: 'Functional constipation results from slowed colonic transit, increased water absorption from the stool, and/or difficulty with evacuation. It is extremely common, especially in the elderly, and is often multifactorial (diet, medications, immobility, pelvic floor dysfunction). Pain is typically dull or cramping in the left lower quadrant or diffusely throughout the abdomen.',
    timelineStages: [
      { stageId: 1, label: 'Mild (days)', typicalHoursFromOnset: [0, 72],
        dominantSymptoms: [sym('constipation', 0.85, 0.7), sym('pain_character', 0.5, 0.5),
          sym('bloating', 0.5, 0.6), sym('abdominal_distension', 0.3, 0.65)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Dull ache or cramping', painLocationTypical: 'Left lower quadrant / diffuse',
        painRadiationTypical: 'None' },
      { stageId: 2, label: 'Severe / impacted (weeks)', typicalHoursFromOnset: [72, 336],
        dominantSymptoms: [sym('constipation', 0.95, 0.7), sym('obstipation', 0.4, 0.85),
          sym('abdominal_distension', 0.6, 0.65), sym('pain_severity', 0.6, 0.4)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Severe cramping or constant dull ache', painLocationTypical: 'Left lower quadrant / diffuse',
        painRadiationTypical: 'None' },
    ],
    progressionRule: 'May be acute (days) or chronic (weeks). Severe impaction can lead to overflow incontinence, urinary retention, and rarely perforation.',
  },

  features: {
    symptoms: [
      sym('pain_character', 0.5, 0.5, { stageRelevance: [1, 2] }),
      sym('pain_initial_location', 0.4, 0.5, { stageRelevance: [1, 2] }),
      sym('constipation', 0.85, 0.7, { stageRelevance: [1, 2] }),
      sym('bowel_habits', 0.7, 0.6, { stageRelevance: [1, 2] }),
      sym('obstipation', 0.4, 0.85, { stageRelevance: [2] }),
      sym('abdominal_distension', 0.5, 0.65, { stageRelevance: [1, 2] }),
      sym('bloating', 0.5, 0.6, { stageRelevance: [1, 2] }),
      sym('pain_relieving_factors', 0.7, 0.6, { stageRelevance: [1] }),
      sym('previous_similar_episodes', 0.6, 0.65, { stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('constipation', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.05, label: 'No constipation — simple functional constipation excluded' }),
    ],
    supporting: [
      sym('diarrhea', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.2, label: 'No diarrhoea — supports constipation over gastroenteritis' }),
    ],
  },

  differential: {
    mimics: ['ibs', 'intestinal_obstruction', 'diverticulitis', 'colorectal_cancer', 'crohns_disease'],
    distinguishingFeatures: [
      { fromDiseaseId: 'ibs', featureIds: ['pain_character', 'alternat_bowel', 'bloating'] },
      { fromDiseaseId: 'intestinal_obstruction', featureIds: ['obstipation', 'vomiting', 'pain_severity'] },
      { fromDiseaseId: 'diverticulitis', featureIds: ['fever', 'pain_location_now', 'bowel_habits'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Faecal impaction', warningFeatures: ['obstipation', 'abdominal_distension'],
      riskFactors: ['opioid_use', 'immobility'], timeWindowHours: [168, 720], severityTier: 'moderate',
      description: 'Hardened stool in the rectum requiring manual disimpaction or enemas.' },
    { name: 'Overflow incontinence', warningFeatures: ['diarrhea', 'constipation'],
      riskFactors: ['age>65'], timeWindowHours: [336, 2160], severityTier: 'mild',
      description: 'Liquid stool bypassing impacted faecal mass, causing paradoxical diarrhoea.' },
  ],

  clinicalScores: [{
    name: 'Rome IV Criteria (Functional Constipation)',
    items: [
      { featureId: 'constipation', label: 'Straining during >25% of defecations', pointsWhenPresent: 1 },
      { featureId: 'bowel_habits', label: 'Lumpy or hard stools >25% of defecations', pointsWhenPresent: 1 },
      { featureId: 'obstipation', label: 'Sensation of incomplete evacuation', pointsWhenPresent: 1 },
      { featureId: 'pain_relieving_factors', label: 'Manual manoeuvres needed >25% of defecations', pointsWhenPresent: 1 },
    ],
    interpretationThresholds: [
      { maxScore: 2, label: 'Possible functional constipation' },
      { maxScore: 4, label: 'Meets Rome IV criteria for functional constipation' },
    ],
    maxScore: 4,
  }],

  redFlagFeatureIds: ['obstipation', 'syncope'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// Medical GI disease index
// ═══════════════════════════════════════════════════════════════════════════════
export const MEDICAL_GI_NODES: DiseaseNode[] = [
  ibs,
  crohnsDisease,
  ulcerativeColitis,
  gastritis,
  foodPoisoning,
  coeliacDisease,
  constipationSimple,
];
