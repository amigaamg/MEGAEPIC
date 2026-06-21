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
// 1. INCARCERATED / STRANGULATED HERNIA
// ═══════════════════════════════════════════════════════════════════════════════
export const incarceratedHernia: DiseaseNode = {
  id: 'incarcerated_hernia',
  name: 'Incarcerated / Strangulated Hernia',
  icdCode: 'K46.8',
  system: 'surgical',
  organSystem: 'GI',
  acuity: 'urgent',
  acuityTier: 2,

  epidemiology: {
    ageMin: 1, ageMax: 90, agePeak: [60, 85],
    sexRisk: { male: 3.0, female: 1.0 },
    backgroundPrevalence: 0.02,
    riskFactors: [
      { featureId: 'prior_abdominal_surgery', label: 'Prior abdominal surgery', LR_positive: 3.0, prevalenceInDisease: 0.4 },
      { featureId: 'constipation', label: 'Chronic constipation', LR_positive: 2.5, prevalenceInDisease: 0.3 },
      { featureId: 'cough', label: 'Chronic cough', LR_positive: 2.0, prevalenceInDisease: 0.25 },
    ],
  },

  pathophysiology: {
    mechanism: 'A hernia becomes irreducible when its contents cannot be returned to the abdominal cavity due to a narrow neck or adhesions. Incarceration leads to venous congestion, oedema, and further swelling. If the blood supply becomes compromised, the hernia is strangulated — venous outflow is obstructed first, then arterial inflow, leading to ischaemia, gangrene, and perforation of the trapped bowel. Pain is initially colicky from bowel obstruction, then constant as ischaemia develops.',
    timelineStages: [
      { stageId: 1, label: 'Incarceration', typicalHoursFromOnset: [0, 12],
        dominantSymptoms: [sym('hernia_mass', 0.9, 0.9), sym('pain_initial_location', 0.7, 0.5),
          sym('pain_character', 0.6, 0.55), sym('pain_worsening_factors', 0.5, 0.5)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Dull ache or cramping at the hernia site', painLocationTypical: 'Groin or abdominal wall at hernia site',
        painRadiationTypical: 'None' },
      { stageId: 2, label: 'Strangulation', typicalHoursFromOnset: [12, 48],
        dominantSymptoms: [sym('pain_location_now', 0.8, 0.5), sym('pain_severity', 0.8, 0.4),
          sym('peritonism', 0.4, 0.85), sym('vomiting', 0.7, 0.5), sym('obstipation', 0.5, 0.85)],
        examFindings: [], severityTrajectory: 'rapidly_worsening',
        painCharacterTypical: 'Constant, severe, over hernia with colicky abdominal pain', painLocationTypical: 'Groin + diffuse abdomen if obstruction',
        painRadiationTypical: 'None' },
    ],
    progressionRule: 'Incarceration may persist for hours to days. Once strangulation occurs, bowel ischaemia develops within 6–12h, leading to gangrene and perforation if not surgically relieved.',
  },

  features: {
    symptoms: [
      sym('hernia_mass', 0.9, 0.9, { stageRelevance: [1, 2] }),
      sym('pain_onset', 0.5, 0.5, { stageRelevance: [1] }),
      sym('pain_initial_location', 0.7, 0.5, { stageRelevance: [1] }),
      sym('pain_location_now', 0.8, 0.5, { stageRelevance: [2] }),
      sym('pain_character', 0.6, 0.55, { stageRelevance: [1, 2] }),
      sym('pain_severity', 0.8, 0.4, { stageRelevance: [1, 2] }),
      sym('pain_worsening_factors', 0.5, 0.5, { stageRelevance: [1, 2] }),
      sym('nausea', 0.6, 0.45, { stageRelevance: [1, 2] }),
      sym('vomiting', 0.7, 0.5, { stageRelevance: [2] }),
      sym('vomiting_description', 0.3, 0.85, { stageRelevance: [2] }),
      sym('obstipation', 0.5, 0.85, { stageRelevance: [2] }),
      sym('abdominal_distension', 0.5, 0.7, { stageRelevance: [2] }),
      sym('constipation', 0.3, 0.7, { stageRelevance: [1] }),
      sym('peritonism', 0.4, 0.85, { stageRelevance: [2] }),
      sym('bowel_habits', 0.5, 0.6, { stageRelevance: [2] }),
      sym('previous_similar_episodes', 0.4, 0.7, { stageRelevance: [1] }),
      sym('fever', 0.3, 0.55, { stageRelevance: [2] }),
      sym('fever_chills', 0.2, 0.85, { stageRelevance: [2] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('hernia_mass', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.05, label: 'No hernia mass or bulge — incarcerated hernia very unlikely' }),
    ],
    supporting: [
      sym('obstipation', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.2, label: 'Passing gas and stool — no bowel obstruction from hernia' }),
    ],
  },

  differential: {
    mimics: ['intestinal_obstruction', 'volvulus', 'constipation', 'testicular_torsion'],
    distinguishingFeatures: [
      { fromDiseaseId: 'intestinal_obstruction', featureIds: ['hernia_mass', 'pain_initial_location'] },
      { fromDiseaseId: 'constipation', featureIds: ['hernia_mass', 'pain_worsening_factors'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Strangulation', warningFeatures: ['peritonism', 'abdominal_distension', 'fever_chills'],
      riskFactors: ['age>60', 'diabetes'], timeWindowHours: [12, 48], severityTier: 'critical',
      description: 'Bowel wall ischaemia from compromised blood supply — emergency surgical repair required.' },
    { name: 'Bowel perforation', warningFeatures: ['peritonism', 'rigidity', 'syncope'],
      riskFactors: ['steroid_use', 'delayed_presentation'], timeWindowHours: [24, 72], severityTier: 'critical',
      description: 'Full-thickness necrosis leading to faecal peritonitis — life-threatening.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['peritonism', 'syncope', 'fever_chills'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 2. VOLVULUS
// ═══════════════════════════════════════════════════════════════════════════════
export const volvulus: DiseaseNode = {
  id: 'volvulus',
  name: 'Volvulus',
  icdCode: 'K56.2',
  system: 'surgical',
  organSystem: 'GI',
  acuity: 'urgent',
  acuityTier: 2,

  epidemiology: {
    ageMin: 1, ageMax: 90, agePeak: [60, 85],
    sexRisk: { male: 1.5, female: 1.0 },
    backgroundPrevalence: 0.005,
    riskFactors: [
      { featureId: 'constipation', label: 'Chronic constipation', LR_positive: 3.0, prevalenceInDisease: 0.5 },
      { featureId: 'prior_abdominal_surgery', label: 'Prior abdominal surgery', LR_positive: 2.5, prevalenceInDisease: 0.3 },
    ],
  },

  pathophysiology: {
    mechanism: 'A loop of bowel twists around its mesenteric axis, creating a closed-loop obstruction. The sigmoid colon is most commonly affected (elderly, chronic constipation), followed by the caecum (younger patients). Twisting compromises venous outflow first, causing congestion and oedema, then arterial inflow, leading to ischaemia. The classic presentation is sudden severe colicky pain with massive abdominal distension and obstipation. Progression to perforation can occur within hours.',
    timelineStages: [
      { stageId: 1, label: 'Acute torsion', typicalHoursFromOnset: [0, 6],
        dominantSymptoms: [sym('pain_onset', 0.85, 0.55), sym('pain_character', 0.8, 0.6),
          sym('pain_initial_location', 0.7, 0.5), sym('abdominal_distension', 0.8, 0.75)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Sudden severe colicky pain, waves', painLocationTypical: 'Lower abdomen (sigmoid) or central (caecal)',
        painRadiationTypical: 'None' },
      { stageId: 2, label: 'Ischaemia / perforation', typicalHoursFromOnset: [6, 24],
        dominantSymptoms: [sym('pain_location_now', 0.75, 0.5), sym('obstipation', 0.85, 0.85),
          sym('abdominal_distension', 0.9, 0.75), sym('peritonism', 0.6, 0.8), sym('vomiting_description', 0.4, 0.85)],
        examFindings: [], severityTrajectory: 'rapidly_worsening',
        painCharacterTypical: 'Constant, severe, diffuse', painLocationTypical: 'Generalised — massive distension',
        painRadiationTypical: 'None' },
    ],
    progressionRule: 'Sigmoid volvulus may resolve spontaneously or with decompression. Caecal volvulus rarely self-corrects. Ischaemia develops within 6–12h of sustained torsion.',
  },

  features: {
    symptoms: [
      sym('pain_onset', 0.85, 0.55, { stageRelevance: [1] }),
      sym('pain_initial_location', 0.7, 0.5, { stageRelevance: [1] }),
      sym('pain_location_now', 0.75, 0.5, { stageRelevance: [2] }),
      sym('pain_character', 0.8, 0.6, { stageRelevance: [1, 2] }),
      sym('pain_severity', 0.85, 0.4, { stageRelevance: [1, 2] }),
      sym('pain_worsening_factors', 0.5, 0.5, { stageRelevance: [2] }),
      sym('nausea', 0.6, 0.45, { stageRelevance: [1, 2] }),
      sym('vomiting', 0.6, 0.5, { stageRelevance: [2] }),
      sym('vomiting_description', 0.4, 0.85, { stageRelevance: [2] }),
      sym('vomiting_frequency', 0.4, 0.6, { stageRelevance: [2] }),
      sym('abdominal_distension', 0.9, 0.75, { stageRelevance: [1, 2] }),
      sym('obstipation', 0.85, 0.85, { stageRelevance: [2] }),
      sym('bowel_habits', 0.7, 0.6, { stageRelevance: [1, 2] }),
      sym('constipation', 0.5, 0.7, { stageRelevance: [1] }),
      sym('peritonism', 0.6, 0.8, { stageRelevance: [2] }),
      sym('guarding', 0.4, 0.75, { stageRelevance: [2] }),
      sym('previous_similar_episodes', 0.15, 0.75, { stageRelevance: [1] }),
      sym('fever', 0.3, 0.55, { stageRelevance: [2] }),
      sym('fever_chills', 0.2, 0.85, { stageRelevance: [2] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('abdominal_distension', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.1, label: 'No abdominal distension — volvulus unlikely' }),
      sym('obstipation', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.15, label: 'Passing gas and stool — closed-loop obstruction unlikely' }),
    ],
    supporting: [
      sym('diarrhea', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.2, label: 'No diarrhoea — supports obstruction over gastroenteritis' }),
    ],
  },

  differential: {
    mimics: ['intestinal_obstruction', 'incarcerated_hernia', 'perforated_ulcer', 'pancreatitis', 'diverticulitis'],
    distinguishingFeatures: [
      { fromDiseaseId: 'intestinal_obstruction', featureIds: ['pain_onset', 'abdominal_distension', 'previous_similar_episodes'] },
      { fromDiseaseId: 'perforated_ulcer', featureIds: ['pain_onset', 'pain_migration', 'peritonism'] },
      { fromDiseaseId: 'diverticulitis', featureIds: ['pain_location_now', 'abdominal_distension', 'fever'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Bowel ischaemia / infarction', warningFeatures: ['peritonism', 'fever_chills', 'pain_severity'],
      riskFactors: ['age>70', 'diabetes'], timeWindowHours: [6, 24], severityTier: 'critical',
      description: 'Twisted mesentery compromises blood flow — bowel resection and high mortality if delayed.' },
    { name: 'Perforation', warningFeatures: ['peritonism', 'rigidity', 'syncope'],
      riskFactors: ['steroid_use'], timeWindowHours: [12, 48], severityTier: 'critical',
      description: 'Necrotic bowel perforates causing faecal peritonitis — surgical emergency.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['peritonism', 'rigidity', 'syncope', 'fever_chills'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 3. INTUSSUSCEPTION
// ═══════════════════════════════════════════════════════════════════════════════
export const intussusception: DiseaseNode = {
  id: 'intussusception',
  name: 'Intussusception',
  icdCode: 'K56.1',
  system: 'surgical',
  organSystem: 'paediatric',
  acuity: 'urgent',
  acuityTier: 2,

  epidemiology: {
    ageMin: 0, ageMax: 80, agePeak: [0, 2],
    sexRisk: { male: 2.0, female: 1.0 },
    backgroundPrevalence: 0.002,
    riskFactors: [],
  },

  pathophysiology: {
    mechanism: 'One segment of bowel (intussusceptum) telescopes into the adjacent distal segment (intussuscipiens), typically at the ileocaecal junction. This causes venous congestion, oedema, and eventually arterial compromise. The classic triad is colicky abdominal pain, red-currant jelly stool (from mucosal ischaemia), and a palpable sausage-shaped abdominal mass. In adults, intussusception usually has a pathological lead point (tumour, Meckel\'s diverticulum).',
    timelineStages: [
      { stageId: 1, label: 'Early intussusception', typicalHoursFromOnset: [0, 12],
        dominantSymptoms: [sym('pain_onset', 0.8, 0.55), sym('pain_character', 0.85, 0.6),
          sym('pain_initial_location', 0.6, 0.5), sym('vomiting', 0.6, 0.5)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Colicky — paroxysmal, child draws up legs', painLocationTypical: 'Periumbilical or diffuse',
        painRadiationTypical: 'None' },
      { stageId: 2, label: 'Established / complicated', typicalHoursFromOnset: [12, 48],
        dominantSymptoms: [sym('pain_location_now', 0.6, 0.5), sym('hematochezia', 0.5, 0.95),
          sym('vomiting_description', 0.5, 0.8), sym('abdominal_distension', 0.4, 0.7)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Waves of colicky pain, becoming constant as ischaemia develops', painLocationTypical: 'Right side or diffuse',
        painRadiationTypical: 'None' },
    ],
    progressionRule: 'Without treatment, progresses to bowel ischaemia over 24–48h. Perforation and peritonitis develop if unrelieved.',
  },

  features: {
    symptoms: [
      sym('pain_onset', 0.8, 0.55, { stageRelevance: [1] }),
      sym('pain_initial_location', 0.6, 0.5, { stageRelevance: [1] }),
      sym('pain_location_now', 0.6, 0.5, { stageRelevance: [2] }),
      sym('pain_character', 0.85, 0.6, { stageRelevance: [1, 2] }),
      sym('pain_severity', 0.75, 0.4, { stageRelevance: [1, 2] }),
      sym('pain_worsening_factors', 0.3, 0.5, { stageRelevance: [2] }),
      sym('nausea', 0.7, 0.45, { stageRelevance: [1, 2] }),
      sym('vomiting', 0.7, 0.5, { stageRelevance: [1, 2] }),
      sym('vomiting_timing', 0.5, 0.6, { stageRelevance: [2] }),
      sym('vomiting_description', 0.5, 0.8, { stageRelevance: [2] }),
      sym('vomiting_frequency', 0.3, 0.6, { stageRelevance: [2] }),
      sym('hematochezia', 0.5, 0.95, { stageRelevance: [2] }),
      sym('abdominal_distension', 0.4, 0.7, { stageRelevance: [2] }),
      sym('bowel_habits', 0.5, 0.6, { stageRelevance: [2] }),
      sym('diarrhea', 0.2, 0.7, { stageRelevance: [1] }),
      sym('fever', 0.3, 0.55, { stageRelevance: [2] }),
      sym('peritonism', 0.2, 0.85, { stageRelevance: [2] }),
      sym('previous_similar_episodes', 0.05, 0.75, { stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('hematochezia', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.3, label: 'No blood in stool — intussusception less likely but not excluded' }),
      sym('pain_character', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.15, label: 'Non-colicky, constant pain makes intussusception unlikely' }),
    ],
    supporting: [
      sym('diarrhea', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.3, label: 'No diarrhoea — supports intussusception over gastroenteritis' }),
    ],
  },

  differential: {
    mimics: ['gastroenteritis', 'appendicitis', 'meckel_diverticulitis', 'constipation'],
    distinguishingFeatures: [
      { fromDiseaseId: 'gastroenteritis', featureIds: ['hematochezia', 'pain_character', 'pain_worsening_factors'] },
      { fromDiseaseId: 'appendicitis', featureIds: ['pain_migration', 'hematochezia', 'pain_character'] },
      { fromDiseaseId: 'meckel_diverticulitis', featureIds: ['hematochezia', 'pain_character'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Bowel ischaemia', warningFeatures: ['hematochezia', 'peritonism', 'abdominal_distension'],
      riskFactors: ['delayed_presentation'], timeWindowHours: [24, 48], severityTier: 'critical',
      description: 'Venous congestion leads to mucosal ischaemia and bleeding — surgical reduction required.' },
    { name: 'Perforation', warningFeatures: ['peritonism', 'rigidity', 'fever_chills'],
      riskFactors: ['age<3'], timeWindowHours: [36, 72], severityTier: 'critical',
      description: 'Full-thickness necrosis with faecal peritonitis — emergency laparotomy.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['hematochezia', 'peritonism'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 4. MESENTERIC ADENITIS
// ═══════════════════════════════════════════════════════════════════════════════
export const mesentericAdenitis: DiseaseNode = {
  id: 'mesenteric_adenitis',
  name: 'Mesenteric Adenitis',
  icdCode: 'I88.0',
  system: 'surgical',
  organSystem: 'GI',
  acuity: 'routine',
  acuityTier: 4,

  epidemiology: {
    ageMin: 1, ageMax: 30, agePeak: [3, 15],
    sexRisk: { male: 1.2, female: 1.0 },
    backgroundPrevalence: 0.03,
    riskFactors: [
      { featureId: 'recent_travel', label: 'Recent viral illness exposure', LR_positive: 2.0, prevalenceInDisease: 0.4 },
      { featureId: 'smoking', label: 'Smoking (household exposure)', LR_positive: 1.2, prevalenceInDisease: 0.2 },
    ],
  },

  pathophysiology: {
    mechanism: 'Inflammation and enlargement of mesenteric lymph nodes, most commonly in the right iliac fossa, secondary to a viral upper respiratory tract infection (adenovirus, enterovirus, EBV). The enlarged nodes cause right-sided abdominal pain that mimics appendicitis. Unlike appendicitis, pain is less well localised, migration is uncommon, and associated URTI symptoms (cough, coryza) are often present. It is a benign self-limiting condition.',
    timelineStages: [
      { stageId: 1, label: 'Acute presentation', typicalHoursFromOnset: [0, 48],
        dominantSymptoms: [sym('pain_initial_location', 0.6, 0.5), sym('pain_location_now', 0.65, 0.5),
          sym('fever', 0.7, 0.5), sym('cough', 0.5, 0.75)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Dull ache, poorly localised', painLocationTypical: 'Right lower quadrant or periumbilical',
        painRadiationTypical: 'None' },
      { stageId: 2, label: 'Resolution', typicalHoursFromOnset: [48, 120],
        dominantSymptoms: [sym('pain_location_now', 0.4, 0.5), sym('fever', 0.5, 0.5)],
        examFindings: [], severityTrajectory: 'improving',
        painCharacterTypical: 'Improving dull ache', painLocationTypical: 'Right lower quadrant',
        painRadiationTypical: 'None' },
    ],
    progressionRule: 'Self-limiting over 3–7 days. Pain and fever resolve spontaneously without specific treatment.',
  },

  features: {
    symptoms: [
      sym('pain_onset', 0.5, 0.5, { stageRelevance: [1] }),
      sym('pain_initial_location', 0.6, 0.5, { stageRelevance: [1] }),
      sym('pain_location_now', 0.65, 0.5, { stageRelevance: [1, 2] }),
      sym('pain_character', 0.5, 0.5, { stageRelevance: [1, 2] }),
      sym('pain_severity', 0.5, 0.4, { stageRelevance: [1, 2] }),
      sym('pain_migration', 0.2, 0.7, { stageRelevance: [1] }),
      sym('pain_worsening_factors', 0.3, 0.5, { stageRelevance: [1] }),
      sym('nausea', 0.4, 0.5, { stageRelevance: [1] }),
      sym('vomiting', 0.3, 0.55, { stageRelevance: [1] }),
      sym('anorexia', 0.4, 0.55, { stageRelevance: [1] }),
      sym('fever', 0.7, 0.5, { stageRelevance: [1, 2] }),
      sym('fever_chills', 0.2, 0.85, { stageRelevance: [1] }),
      sym('cough', 0.5, 0.75, { stageRelevance: [1] }),
      sym('bowel_habits', 0.3, 0.6, { stageRelevance: [1] }),
      sym('diarrhea', 0.3, 0.7, { stageRelevance: [1] }),
      sym('previous_similar_episodes', 0.3, 0.7, { stageRelevance: [1] }),
      sym('skin_rash', 0.1, 0.85, { stageRelevance: [1] }),
      sym('joint_pain', 0.15, 0.8, { stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('pain_migration', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.1, label: 'Pain migration from periumbilical to RLQ — more suggestive of appendicitis' }),
      sym('cough', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.4, label: 'No URTI symptoms — mesenteric adenitis less likely' }),
    ],
    supporting: [
      sym('anorexia', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.4, label: 'Preserved appetite — supports mesenteric adenitis over appendicitis' }),
    ],
  },

  differential: {
    mimics: ['acute_appendicitis', 'meckel_diverticulitis', 'gastroenteritis', 'ibd_flare'],
    distinguishingFeatures: [
      { fromDiseaseId: 'acute_appendicitis', featureIds: ['pain_migration', 'cough', 'fever', 'anorexia'] },
      { fromDiseaseId: 'gastroenteritis', featureIds: ['diarrhea', 'vomiting', 'cough'] },
      { fromDiseaseId: 'meckel_diverticulitis', featureIds: ['hematochezia'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Secondary bacterial infection', warningFeatures: ['fever_chills', 'peritonism'],
      riskFactors: ['immunocompromised'], timeWindowHours: [72, 168], severityTier: 'mild',
      description: 'Rare bacterial superinfection of enlarged lymph nodes requiring antibiotics.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['peritonism'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 5. GASTRIC OUTLET OBSTRUCTION
// ═══════════════════════════════════════════════════════════════════════════════
export const gastricOutletObstruction: DiseaseNode = {
  id: 'gastric_outlet_obstruction',
  name: 'Gastric Outlet Obstruction',
  icdCode: 'K31.1',
  system: 'surgical',
  organSystem: 'GI',
  acuity: 'urgent',
  acuityTier: 2,

  epidemiology: {
    ageMin: 20, ageMax: 90, agePeak: [40, 70],
    sexRisk: { male: 1.5, female: 1.0 },
    backgroundPrevalence: 0.003,
    riskFactors: [
      { featureId: 'nsaid_use', label: 'NSAID use (PUD scarring)', LR_positive: 4.0, prevalenceInDisease: 0.4 },
      { featureId: 'smoking', label: 'Smoking', LR_positive: 2.0, prevalenceInDisease: 0.4 },
      { featureId: 'known_cancer', label: 'Known gastric or pancreatic cancer', LR_positive: 8.0, prevalenceInDisease: 0.15 },
    ],
  },

  pathophysiology: {
    mechanism: 'Mechanical obstruction at the pylorus prevents gastric emptying into the duodenum. Causes include chronic PUD scarring (most common), gastric cancer, pancreatic cancer, or pyloric stenosis. The stomach dilates and its contents accumulate, leading to non-bilious vomiting of undigested food hours after meals. Pain is epigastric, dull, and aggravated by eating. Patients develop early satiety, weight loss, and eventually malnutrition and dehydration.',
    timelineStages: [
      { stageId: 1, label: 'Early obstruction', typicalHoursFromOnset: [0, 168],
        dominantSymptoms: [sym('pain_initial_location', 0.8, 0.55), sym('pain_character', 0.6, 0.55),
          sym('vomiting', 0.7, 0.55), sym('vomiting_description', 0.6, 0.85)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Dull, gnawing epigastric pain', painLocationTypical: 'Epigastrium',
        painRadiationTypical: 'None' },
      { stageId: 2, label: 'Established / decompensation', typicalHoursFromOnset: [168, 720],
        dominantSymptoms: [sym('pain_location_now', 0.8, 0.55), sym('vomiting_frequency', 0.65, 0.6),
          sym('weight_loss', 0.6, 0.8), sym('abdominal_distension', 0.6, 0.7)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Constant epigastric fullness and ache', painLocationTypical: 'Epigastrium',
        painRadiationTypical: 'None' },
    ],
    progressionRule: 'Gradual onset over weeks to months. Complete obstruction leads to persistent vomiting, dehydration, and metabolic alkalosis. May perforate or bleed if due to active PUD.',
  },

  features: {
    symptoms: [
      sym('pain_onset', 0.5, 0.5, { stageRelevance: [1] }),
      sym('pain_initial_location', 0.8, 0.55, { stageRelevance: [1] }),
      sym('pain_location_now', 0.8, 0.55, { stageRelevance: [2] }),
      sym('pain_character', 0.6, 0.55, { stageRelevance: [1, 2] }),
      sym('pain_severity', 0.5, 0.4, { stageRelevance: [1, 2] }),
      sym('pain_worsening_factors', 0.7, 0.5, { stageRelevance: [1, 2] }),
      sym('pain_relieving_factors', 0.5, 0.5, { stageRelevance: [1] }),
      sym('nausea', 0.7, 0.45, { stageRelevance: [1, 2] }),
      sym('vomiting', 0.85, 0.6, { stageRelevance: [1, 2] }),
      sym('vomiting_timing', 0.7, 0.65, { stageRelevance: [1, 2] }),
      sym('vomiting_description', 0.75, 0.85, { stageRelevance: [1, 2] }),
      sym('vomiting_frequency', 0.65, 0.6, { stageRelevance: [2] }),
      sym('anorexia', 0.6, 0.55, { stageRelevance: [1, 2] }),
      sym('abdominal_distension', 0.6, 0.7, { stageRelevance: [2] }),
      sym('bloating', 0.5, 0.6, { stageRelevance: [1, 2] }),
      sym('weight_loss', 0.6, 0.8, { stageRelevance: [2] }),
      sym('bowel_habits', 0.2, 0.6, { stageRelevance: [2] }),
      sym('constipation', 0.2, 0.7, { stageRelevance: [2] }),
      sym('heartburn', 0.3, 0.7, { stageRelevance: [1] }),
      sym('melena', 0.2, 0.9, { stageRelevance: [2] }),
      sym('previous_similar_episodes', 0.3, 0.7, { stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('vomiting_description', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.15, label: 'Bilious vomiting — not gastric outlet obstruction (more distal obstruction)' }),
      sym('pain_initial_location', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.2, label: 'No epigastric pain — gastric outlet obstruction unlikely' }),
    ],
    supporting: [
      sym('vomiting_timing', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.3, label: 'Vomiting before pain onset supports gastroenteritis over obstruction' }),
    ],
  },

  differential: {
    mimics: ['pancreatitis', 'cholecystitis', 'functional_dyspepsia', 'gastroparesis', 'pancreatic_cancer'],
    distinguishingFeatures: [
      { fromDiseaseId: 'pancreatitis', featureIds: ['vomiting_description', 'pain_radiation', 'pain_severity'] },
      { fromDiseaseId: 'cholecystitis', featureIds: ['vomiting_description', 'pain_location_now', 'pain_radiation'] },
      { fromDiseaseId: 'pancreatic_cancer', featureIds: ['weight_loss', 'jaundice', 'pain_severity'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Metabolic alkalosis / dehydration', warningFeatures: ['vomiting_frequency', 'syncope'],
      riskFactors: ['age>65', 'diuretic_use'], timeWindowHours: [72, 336], severityTier: 'severe',
      description: 'Loss of gastric acid and fluid causes hypochloraemic hypokalaemic metabolic alkalosis requiring IV repletion.' },
    { name: 'Gastric perforation', warningFeatures: ['peritonism', 'rigidity', 'pain_onset'],
      riskFactors: ['nsaid_use', 'steroid_use'], timeWindowHours: [0, 168], severityTier: 'critical',
      description: 'Full-thickness ulceration leading to peritonitis — surgical emergency.' },
    { name: 'Malnutrition', warningFeatures: ['weight_loss'],
      riskFactors: ['delayed_diagnosis'], timeWindowHours: [720, 4320], severityTier: 'moderate',
      description: 'Chronic inability to eat leads to weight loss, vitamin deficiencies, and cachexia.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['peritonism', 'syncope', 'weight_loss'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 6. BOERHAAVE SYNDROME (spontaneous oesophageal rupture)
// ═══════════════════════════════════════════════════════════════════════════════
export const boerhaave: DiseaseNode = {
  id: 'boerhaave',
  name: 'Boerhaave Syndrome',
  icdCode: 'K22.3',
  system: 'surgical',
  organSystem: 'GI',
  acuity: 'immediately_life_threatening',
  acuityTier: 1,

  epidemiology: {
    ageMin: 20, ageMax: 80, agePeak: [40, 60],
    sexRisk: { male: 3.0, female: 1.0 },
    backgroundPrevalence: 0.0005,
    riskFactors: [
      { featureId: 'alcohol_use', label: 'Alcohol use / binge drinking', LR_positive: 4.0, prevalenceInDisease: 0.5 },
      { featureId: 'recent_binge', label: 'Recent binge drinking', LR_positive: 5.0, prevalenceInDisease: 0.3 },
      { featureId: 'known_cancer', label: 'Oesophageal pathology', LR_positive: 3.0, prevalenceInDisease: 0.1 },
    ],
  },

  pathophysiology: {
    mechanism: 'Spontaneous transmural rupture of the oesophagus caused by a sudden rise in intra-oesophageal pressure against a closed glottis (classically during forceful vomiting or retching). The tear is most commonly in the left posterolateral wall of the distal oesophagus. Gastric contents leak into the mediastinum and pleural cavity, causing chemical mediastinitis, tissue necrosis, and rapidly progressive sepsis. Mortality exceeds 50% if not treated within 24 hours.',
    timelineStages: [
      { stageId: 1, label: 'Acute rupture', typicalHoursFromOnset: [0, 4],
        dominantSymptoms: [sym('pain_onset', 0.9, 0.6), sym('pain_initial_location', 0.85, 0.55),
          sym('pain_character', 0.7, 0.6), sym('vomiting', 0.85, 0.55)],
        examFindings: [], severityTrajectory: 'rapidly_worsening',
        painCharacterTypical: 'Excruciating, tearing or ripping', painLocationTypical: 'Lower chest or epigastrium',
        painRadiationTypical: 'To left shoulder or back' },
      { stageId: 2, label: 'Sepsis / shock', typicalHoursFromOnset: [4, 24],
        dominantSymptoms: [sym('pain_location_now', 0.8, 0.55), sym('dyspnea', 0.7, 0.75),
          sym('fever_chills', 0.5, 0.85), sym('syncope', 0.4, 0.9)],
        examFindings: [], severityTrajectory: 'rapidly_worsening',
        painCharacterTypical: 'Severe, constant, may radiate widely', painLocationTypical: 'Lower chest / epigastrium / diffuse',
        painRadiationTypical: 'To shoulders, back, or neck' },
    ],
    progressionRule: 'Mortality increases rapidly without intervention — surgical repair within 12–24h is essential. Mediastinitis and sepsis progress within hours.',
  },

  features: {
    symptoms: [
      sym('pain_onset', 0.9, 0.6, { stageRelevance: [1] }),
      sym('pain_initial_location', 0.85, 0.55, { stageRelevance: [1] }),
      sym('pain_location_now', 0.8, 0.55, { stageRelevance: [2] }),
      sym('pain_character', 0.7, 0.6, { stageRelevance: [1, 2] }),
      sym('pain_severity', 0.9, 0.5, { stageRelevance: [1, 2] }),
      sym('pain_radiation', 0.6, 0.8, { stageRelevance: [1, 2] }),
      sym('pain_worsening_factors', 0.3, 0.5, { stageRelevance: [1] }),
      sym('nausea', 0.5, 0.45, { stageRelevance: [1] }),
      sym('vomiting', 0.85, 0.55, { stageRelevance: [1] }),
      sym('vomiting_timing', 0.7, 0.65, { stageRelevance: [1] }),
      sym('vomiting_description', 0.7, 0.8, { stageRelevance: [1] }),
      sym('dyspnea', 0.7, 0.75, { stageRelevance: [1, 2] }),
      sym('dysphagia', 0.4, 0.7, { stageRelevance: [1] }),
      sym('fever', 0.5, 0.5, { stageRelevance: [2] }),
      sym('fever_chills', 0.5, 0.85, { stageRelevance: [2] }),
      sym('syncope', 0.4, 0.9, { stageRelevance: [2] }),
      sym('cough', 0.3, 0.7, { stageRelevance: [1, 2] }),
      sym('chest_pain', 0.7, 0.7, { stageRelevance: [1, 2] }),
      sym('peritonism', 0.3, 0.85, { stageRelevance: [2] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('pain_onset', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.05, label: 'Gradual onset — Boerhaave extremely unlikely' }),
      sym('vomiting', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.1, label: 'No vomiting or retching before pain — Boerhaave unlikely' }),
    ],
    supporting: [
      sym('pain_character', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.3, label: 'Colicky pain suggests obstruction, not oesophageal rupture' }),
    ],
  },

  differential: {
    mimics: ['mi', 'perforated_ulcer', 'pancreatitis', 'pulmonary_embolism', 'aortic_dissection'],
    distinguishingFeatures: [
      { fromDiseaseId: 'mi', featureIds: ['vomiting', 'pain_radiation', 'htn_cad'] },
      { fromDiseaseId: 'perforated_ulcer', featureIds: ['vomiting_timing', 'dyspnea', 'pain_initial_location'] },
      { fromDiseaseId: 'pancreatitis', featureIds: ['vomiting_timing', 'pain_character', 'alcohol_use'] },
    ],
    neverCloseConditions: ['mi', 'aortic_dissection'],
  },

  complications: [
    { name: 'Mediastinitis', warningFeatures: ['fever_chills', 'dyspnea', 'syncope'],
      riskFactors: ['delayed_treatment'], timeWindowHours: [4, 24], severityTier: 'critical',
      description: 'Chemical and bacterial contamination of the mediastinum — rapidly fatal without surgical drainage.' },
    { name: 'Septic shock', warningFeatures: ['syncope', 'dyspnea', 'fever_chills'],
      riskFactors: ['diabetes', 'immunocompromised'], timeWindowHours: [6, 24], severityTier: 'critical',
      description: 'Systemic infection from mediastinal and pleural contamination — ICU-level care required.' },
    { name: 'Oesophageal-pleural fistula', warningFeatures: ['cough', 'dyspnea', 'fever'],
      riskFactors: ['delayed_treatment'], timeWindowHours: [24, 168], severityTier: 'severe',
      description: 'Persistent communication between oesophagus and pleural cavity requiring surgical repair.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['syncope', 'pain_onset', 'dyspnea', 'fever_chills'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// Surgical disease index
// ═══════════════════════════════════════════════════════════════════════════════
export const SURGICAL_NODES: DiseaseNode[] = [
  incarceratedHernia,
  volvulus,
  intussusception,
  mesentericAdenitis,
  gastricOutletObstruction,
  boerhaave,
];
