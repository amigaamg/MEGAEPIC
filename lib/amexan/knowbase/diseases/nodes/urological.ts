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
// 1. PYELONEPHRITIS
// ═══════════════════════════════════════════════════════════════════════════════
export const pyelonephritis: DiseaseNode = {
  id: 'pyelonephritis',
  name: 'Pyelonephritis',
  icdCode: 'N10',
  system: 'urological',
  organSystem: 'renal',
  acuity: 'urgent',
  acuityTier: 2,

  epidemiology: {
    ageMin: 0, ageMax: 90, agePeak: [20, 50],
    sexRisk: { male: 0.4, female: 1.0 },
    backgroundPrevalence: 0.01,
    riskFactors: [
      { featureId: 'diabetes', label: 'Diabetes mellitus', LR_positive: 2.5, prevalenceInDisease: 0.2 },
      { featureId: 'prior_uti', label: 'History of recurrent UTI', LR_positive: 3.0, prevalenceInDisease: 0.3 },
    ],
  },

  pathophysiology: {
    mechanism: 'Bacterial infection ascends from the lower urinary tract to the renal pelvis and parenchyma, most commonly caused by Escherichia coli. The infection triggers an inflammatory response in the renal interstitium, causing fever, rigors, and flank pain. Bacteraemia may ensue, leading to sepsis syndrome in severe cases. Risk is increased by ureteric reflux, obstruction, diabetes, and pregnancy.',
    timelineStages: [
      { stageId: 1, label: 'Mild pyelonephritis', typicalHoursFromOnset: [0, 24],
        dominantSymptoms: [sym('pain_onset', 0.6, 0.5), sym('pain_initial_location', 0.7, 0.5),
          sym('pain_character', 0.5, 0.55), sym('fever_chills', 0.8, 0.85)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Dull ache, constant', painLocationTypical: 'Flank',
        painRadiationTypical: 'None' },
      { stageId: 2, label: 'Severe / sepsis', typicalHoursFromOnset: [24, 72],
        dominantSymptoms: [sym('pain_location_now', 0.7, 0.5), sym('fever_chills', 0.9, 0.85),
          sym('fever', 0.85, 0.5), sym('nausea', 0.6, 0.45), sym('vomiting', 0.5, 0.55)],
        examFindings: [], severityTrajectory: 'rapidly_worsening',
        painCharacterTypical: 'Severe, constant flank ache', painLocationTypical: 'Flank',
        painRadiationTypical: 'None' },
    ],
    progressionRule: 'Mild pyelonephritis may be treated with oral antibiotics. Severe cases progress to bacteraemia and septic shock within 24–72h without parenteral antibiotics.',
  },

  features: {
    symptoms: [
      sym('pain_onset', 0.6, 0.5, { stageRelevance: [1] }),
      sym('pain_initial_location', 0.7, 0.5, { stageRelevance: [1] }),
      sym('pain_location_now', 0.7, 0.5, { stageRelevance: [2] }),
      sym('pain_character', 0.5, 0.55, { stageRelevance: [1, 2] }),
      sym('pain_severity', 0.6, 0.4, { stageRelevance: [1, 2] }),
      sym('flank_pain', 0.8, 0.75, { stageRelevance: [1, 2] }),
      sym('fever_chills', 0.8, 0.85, { stageRelevance: [1, 2] }),
      sym('fever', 0.75, 0.5, { stageRelevance: [1, 2] }),
      sym('dysuria', 0.6, 0.75, { stageRelevance: [1] }),
      sym('urinary_frequency', 0.5, 0.7, { stageRelevance: [1] }),
      sym('nausea', 0.6, 0.45, { stageRelevance: [1, 2] }),
      sym('vomiting', 0.5, 0.55, { stageRelevance: [2] }),
      sym('previous_similar_episodes', 0.3, 0.7, { stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('fever_chills', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.1, label: 'No fever or chills — pyelonephritis unlikely' }),
    ],
    supporting: [
      sym('pain_character', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.3, label: 'Colicky pain suggests stone, not infection' }),
    ],
  },

  differential: {
    mimics: ['ureteric_colic', 'cystitis', 'diverticulitis', 'pneumonia', 'pancreatitis'],
    distinguishingFeatures: [
      { fromDiseaseId: 'ureteric_colic', featureIds: ['pain_character', 'fever_chills', 'hematuria'] },
      { fromDiseaseId: 'cystitis', featureIds: ['fever_chills', 'flank_pain', 'fever'] },
      { fromDiseaseId: 'diverticulitis', featureIds: ['bowel_habits', 'pain_location_now', 'fever'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Renal abscess', warningFeatures: ['fever_chills', 'flank_pain'],
      riskFactors: ['diabetes'], timeWindowHours: [72, 168], severityTier: 'severe',
      description: 'Localised pus collection in renal parenchyma requiring drainage.' },
    { name: 'Urosepsis / septic shock', warningFeatures: ['fever_chills', 'syncope'],
      riskFactors: ['diabetes', 'immunocompromised', 'age>65'], timeWindowHours: [24, 72], severityTier: 'critical',
      description: 'Bacteraemia with systemic inflammatory response — ICU-level care required.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['fever_chills', 'syncope'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 2. CYSTITIS
// ═══════════════════════════════════════════════════════════════════════════════
export const cystitis: DiseaseNode = {
  id: 'cystitis',
  name: 'Cystitis',
  icdCode: 'N30.9',
  system: 'urological',
  organSystem: 'renal',
  acuity: 'routine',
  acuityTier: 4,

  epidemiology: {
    ageMin: 1, ageMax: 90, agePeak: [20, 40],
    sexRisk: { male: 0.2, female: 1.0 },
    backgroundPrevalence: 0.1,
    riskFactors: [
      { featureId: 'sexual_activity', label: 'Sexual activity', LR_positive: 2.5, prevalenceInDisease: 0.6 },
      { featureId: 'diabetes', label: 'Diabetes mellitus', LR_positive: 2.0, prevalenceInDisease: 0.15 },
    ],
  },

  pathophysiology: {
    mechanism: 'Bacterial infection of the bladder mucosa, typically Escherichia coli, causing inflammation of the urothelium. This irritates the bladder wall, producing dysuria, urinary frequency, urgency, and suprapubic discomfort. Unlike pyelonephritis, systemic symptoms are mild or absent. The infection remains limited to the lower urinary tract.',
    timelineStages: [
      { stageId: 1, label: 'Acute cystitis', typicalHoursFromOnset: [0, 72],
        dominantSymptoms: [sym('pain_initial_location', 0.6, 0.5), sym('pain_character', 0.5, 0.55),
          sym('dysuria', 0.9, 0.75), sym('urinary_frequency', 0.7, 0.65)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Burning or cramping suprapubic', painLocationTypical: 'Suprapubic',
        painRadiationTypical: 'None' },
      { stageId: 2, label: 'Uncomplicated', typicalHoursFromOnset: [72, 168],
        dominantSymptoms: [sym('pain_location_now', 0.4, 0.5), sym('dysuria', 0.7, 0.75),
          sym('urinary_frequency', 0.5, 0.7)],
        examFindings: [], severityTrajectory: 'improving',
        painCharacterTypical: 'Mild burning or pressure', painLocationTypical: 'Suprapubic',
        painRadiationTypical: 'None' },
    ],
    progressionRule: 'Self-limiting in many cases. May resolve spontaneously or with oral antibiotics. If untreated, upper tract ascent can cause pyelonephritis.',
  },

  features: {
    symptoms: [
      sym('pain_initial_location', 0.6, 0.5, { stageRelevance: [1] }),
      sym('pain_location_now', 0.4, 0.5, { stageRelevance: [2] }),
      sym('pain_character', 0.5, 0.55, { stageRelevance: [1, 2] }),
      sym('pain_severity', 0.3, 0.4, { stageRelevance: [1, 2] }),
      sym('dysuria', 0.9, 0.75, { stageRelevance: [1, 2] }),
      sym('urinary_frequency', 0.7, 0.7, { stageRelevance: [1, 2] }),
      sym('hematuria', 0.3, 0.9, { stageRelevance: [1] }),
      sym('nausea', 0.2, 0.55, { stageRelevance: [1] }),
      sym('fever', 0.2, 0.6, { stageRelevance: [1] }),
      sym('previous_similar_episodes', 0.5, 0.7, { stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('dysuria', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.1, label: 'No dysuria — cystitis very unlikely' }),
    ],
    supporting: [
      sym('fever_chills', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.3, label: 'No fever or chills favours simple cystitis over pyelonephritis' }),
    ],
  },

  differential: {
    mimics: ['pyelonephritis', 'ureteric_colic', 'pid', 'vaginitis'],
    distinguishingFeatures: [
      { fromDiseaseId: 'pyelonephritis', featureIds: ['fever_chills', 'flank_pain', 'fever'] },
      { fromDiseaseId: 'ureteric_colic', featureIds: ['pain_character', 'pain_radiation', 'hematuria'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Ascending infection / pyelonephritis', warningFeatures: ['fever_chills', 'flank_pain', 'fever'],
      riskFactors: ['diabetes', 'pregnancy'], timeWindowHours: [72, 168], severityTier: 'moderate',
      description: 'Infection ascends to the renal pelvis causing pyelonephritis requiring parenteral antibiotics.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['fever_chills'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 3. TESTICULAR TORSION
// ═══════════════════════════════════════════════════════════════════════════════
export const testicularTorsion: DiseaseNode = {
  id: 'testicular_torsion',
  name: 'Testicular Torsion',
  icdCode: 'N44.0',
  system: 'urological',
  organSystem: 'reproductive_male',
  acuity: 'immediately_life_threatening',
  acuityTier: 1,

  epidemiology: {
    ageMin: 0, ageMax: 50, agePeak: [12, 18],
    sexRisk: { male: 1.0, female: 0 },
    backgroundPrevalence: 0.003,
    riskFactors: [
      { featureId: 'previous_testicular_pain', label: 'Previous testicular pain (prior torsion)', LR_positive: 4.0, prevalenceInDisease: 0.3 },
      { featureId: 'bell_clapper_deformity', label: 'Bell-clapper deformity (known)', LR_positive: 8.0, prevalenceInDisease: 0.1 },
    ],
  },

  pathophysiology: {
    mechanism: 'The spermatic cord twists around its axis, compromising testicular blood supply. Venous occlusion occurs first, causing congestion and oedema, followed by arterial occlusion leading to testicular ischaemia and infarction. The bell-clapper deformity (high tunica vaginalis insertion) predisposes to torsion. Pain is sudden, severe, and located in the testis, often with referred pain to the lower abdomen.',
    timelineStages: [
      { stageId: 1, label: 'Acute torsion', typicalHoursFromOnset: [0, 6],
        dominantSymptoms: [sym('pain_onset', 0.8, 0.6), sym('pain_initial_location', 0.85, 0.55),
          sym('testicular_pain', 0.95, 0.9), sym('nausea', 0.6, 0.45)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Sudden, severe, excruciating', painLocationTypical: 'Testis/scrotum',
        painRadiationTypical: 'To lower abdomen or groin' },
      { stageId: 2, label: 'Ischaemia / infarction', typicalHoursFromOnset: [6, 24],
        dominantSymptoms: [sym('pain_location_now', 0.7, 0.5), sym('pain_severity', 0.9, 0.4),
          sym('scrotal_swelling', 0.7, 0.8), sym('vomiting', 0.5, 0.55)],
        examFindings: [], severityTrajectory: 'rapidly_worsening',
        painCharacterTypical: 'Severe, constant', painLocationTypical: 'Testis/scrotum',
        painRadiationTypical: 'Lower abdomen' },
    ],
    progressionRule: 'Testicular salvage is time-critical. Detorsion within 6h yields >90% salvage. After 12h, salvage drops to <20%. Complete infarction occurs by 24h.',
  },

  features: {
    symptoms: [
      sym('pain_onset', 0.8, 0.6, { stageRelevance: [1] }),
      sym('pain_initial_location', 0.85, 0.55, { stageRelevance: [1] }),
      sym('pain_location_now', 0.7, 0.5, { stageRelevance: [2] }),
      sym('pain_character', 0.6, 0.55, { stageRelevance: [1, 2] }),
      sym('pain_severity', 0.9, 0.4, { stageRelevance: [1, 2] }),
      sym('pain_radiation', 0.5, 0.8, { stageRelevance: [1, 2] }),
      sym('testicular_pain', 0.95, 0.9, { stageRelevance: [1, 2] }),
      sym('scrotal_swelling', 0.7, 0.8, { stageRelevance: [1, 2] }),
      sym('nausea', 0.6, 0.45, { stageRelevance: [1] }),
      sym('vomiting', 0.5, 0.55, { stageRelevance: [2] }),
      sym('previous_similar_episodes', 0.15, 0.8, { stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('testicular_pain', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.03, label: 'No testicular pain — testicular torsion extremely unlikely' }),
    ],
    supporting: [
      sym('dysuria', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.3, label: 'No urinary symptoms — supports torsion over epididymitis' }),
    ],
  },

  differential: {
    mimics: ['epididymitis', 'orchitis', 'incarcerated_hernia', 'ureteric_colic'],
    distinguishingFeatures: [
      { fromDiseaseId: 'epididymitis', featureIds: ['pain_onset', 'dysuria', 'fever', 'testicular_pain'] },
      { fromDiseaseId: 'incarcerated_hernia', featureIds: ['hernia_mass', 'testicular_pain'] },
      { fromDiseaseId: 'ureteric_colic', featureIds: ['pain_character', 'pain_radiation', 'hematuria'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Testicular infarction', warningFeatures: ['testicular_pain', 'scrotal_swelling'],
      riskFactors: ['delayed_presentation'], timeWindowHours: [6, 24], severityTier: 'severe',
      description: 'Irreversible ischaemic necrosis of testicular tissue requiring orchiectomy.' },
    { name: 'Infertility', warningFeatures: [],
      riskFactors: ['delayed_detorsion', 'contralateral_torsion'], timeWindowHours: [24, 720], severityTier: 'moderate',
      description: 'Loss of testicular tissue and potential damage to blood-testis barrier affecting fertility.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['testicular_pain', 'nausea'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 4. URINARY RETENTION
// ═══════════════════════════════════════════════════════════════════════════════
export const urinaryRetention: DiseaseNode = {
  id: 'urinary_retention',
  name: 'Urinary Retention',
  icdCode: 'R33',
  system: 'urological',
  organSystem: 'renal',
  acuity: 'semi_urgent',
  acuityTier: 3,

  epidemiology: {
    ageMin: 1, ageMax: 90, agePeak: [60, 85],
    sexRisk: { male: 2.0, female: 1.0 },
    backgroundPrevalence: 0.02,
    riskFactors: [
      { featureId: 'prior_abdominal_surgery', label: 'Prior pelvic/abdominal surgery', LR_positive: 2.5, prevalenceInDisease: 0.3 },
      { featureId: 'alcohol_use', label: 'Alcohol use', LR_positive: 1.5, prevalenceInDisease: 0.2 },
      { featureId: 'diabetes', label: 'Diabetes mellitus', LR_positive: 2.0, prevalenceInDisease: 0.25 },
    ],
  },

  pathophysiology: {
    mechanism: 'Inability to empty the bladder despite the presence of urine. Acute retention is often due to mechanical obstruction (BPH, urethral stricture, impacted stone) or pharmacological causes (anticholinergics, opioids). Chronic retention develops gradually from detrusor underactivity or chronic outlet obstruction. The distended bladder stimulates stretch receptors, causing severe suprapubic pain.',
    timelineStages: [
      { stageId: 1, label: 'Acute retention', typicalHoursFromOnset: [0, 6],
        dominantSymptoms: [sym('pain_onset', 0.6, 0.5), sym('pain_initial_location', 0.75, 0.5),
          sym('pain_character', 0.6, 0.55), sym('urinary_retention', 0.9, 0.9)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Constant, severe distension', painLocationTypical: 'Suprapubic',
        painRadiationTypical: 'None' },
      { stageId: 2, label: 'Chronic retention', typicalHoursFromOnset: [168, 3360],
        dominantSymptoms: [sym('pain_location_now', 0.5, 0.5), sym('urinary_frequency', 0.6, 0.7),
          sym('abdominal_distension', 0.7, 0.7), sym('urinary_retention', 0.7, 0.9)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Chronic suprapubic discomfort or pressure', painLocationTypical: 'Suprapubic',
        painRadiationTypical: 'None' },
    ],
    progressionRule: 'Acute retention requires immediate catheterisation. Chronic retention may be tolerated for days to weeks but leads to hydronephrosis and renal impairment if unrelieved.',
  },

  features: {
    symptoms: [
      sym('pain_onset', 0.6, 0.5, { stageRelevance: [1] }),
      sym('pain_initial_location', 0.75, 0.5, { stageRelevance: [1] }),
      sym('pain_location_now', 0.5, 0.5, { stageRelevance: [2] }),
      sym('pain_character', 0.6, 0.55, { stageRelevance: [1, 2] }),
      sym('pain_severity', 0.7, 0.4, { stageRelevance: [1, 2] }),
      sym('urinary_retention', 0.9, 0.9, { stageRelevance: [1, 2] }),
      sym('urinary_frequency', 0.6, 0.7, { stageRelevance: [2] }),
      sym('abdominal_distension', 0.7, 0.7, { stageRelevance: [1, 2] }),
      sym('previous_similar_episodes', 0.4, 0.7, { stageRelevance: [1] }),
      sym('dysuria', 0.2, 0.75, { stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('urinary_retention', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.05, label: 'Able to void — urinary retention unlikely' }),
    ],
    supporting: [
      sym('pain_character', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.3, label: 'Colicky pain suggests stone, not retention' }),
    ],
  },

  differential: {
    mimics: ['ureteric_colic', 'cystitis', 'constipation', 'prostatitis'],
    distinguishingFeatures: [
      { fromDiseaseId: 'ureteric_colic', featureIds: ['pain_character', 'urinary_retention', 'pain_radiation'] },
      { fromDiseaseId: 'cystitis', featureIds: ['dysuria', 'urinary_retention', 'fever'] },
      { fromDiseaseId: 'constipation', featureIds: ['bowel_habits', 'abdominal_distension', 'urinary_retention'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Hydronephrosis / renal impairment', warningFeatures: ['urinary_retention', 'abdominal_distension'],
      riskFactors: ['chronic_retention'], timeWindowHours: [168, 1008], severityTier: 'severe',
      description: 'Back-pressure from chronic retention causes ureteric dilation and renal cortical thinning.' },
    { name: 'UTI / pyelonephritis', warningFeatures: ['fever_chills', 'dysuria'],
      riskFactors: ['indwelling_catheter'], timeWindowHours: [24, 168], severityTier: 'moderate',
      description: 'Stagnant urine predisposes to bacterial overgrowth and ascending infection.' },
    { name: 'Bladder rupture', warningFeatures: ['syncope', 'peritonism'],
      riskFactors: ['trauma', 'recent_surgery'], timeWindowHours: [0, 24], severityTier: 'critical',
      description: 'Spontaneous or traumatic rupture of distended bladder — surgical emergency.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['syncope'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// Urological disease index
// ═══════════════════════════════════════════════════════════════════════════════
export const UROLOGICAL_NODES: DiseaseNode[] = [
  pyelonephritis,
  cystitis,
  testicularTorsion,
  urinaryRetention,
];
