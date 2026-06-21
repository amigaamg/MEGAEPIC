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
// 1. ENDOMETRIOSIS
// ═══════════════════════════════════════════════════════════════════════════════
export const endometriosis: DiseaseNode = {
  id: 'endometriosis',
  name: 'Endometriosis',
  icdCode: 'N80',
  system: 'gynaecological',
  organSystem: 'reproductive_female',
  acuity: 'routine',
  acuityTier: 4,

  epidemiology: {
    ageMin: 15, ageMax: 50, agePeak: [25, 40],
    sexRisk: { male: 0, female: 1.0 },
    backgroundPrevalence: 0.05,
    riskFactors: [
      { featureId: 'nulliparity', label: 'Nulliparity', LR_positive: 2.0, prevalenceInDisease: 0.6 },
      { featureId: 'early_menarche', label: 'Early menarche', LR_positive: 1.5, prevalenceInDisease: 0.4 },
      { featureId: 'family_history_endometriosis', label: 'Family history of endometriosis', LR_positive: 4.0, prevalenceInDisease: 0.15 },
    ],
  },

  pathophysiology: {
    mechanism: 'Ectopic endometrial tissue outside the uterine cavity — most commonly on the ovaries, fallopian tubes, and pelvic peritoneum. This tissue responds to hormonal cycles, proliferating and bleeding during menstruation, causing chronic inflammation, adhesions, and scarring. The ectopic implants release prostaglandins and inflammatory mediators that sensitise pelvic pain fibres. Symptoms are typically cyclic, worsening during menstruation, but can become chronic and constant as disease progresses.',
    timelineStages: [
      { stageId: 1, label: 'Catamenial flare', typicalHoursFromOnset: [0, 120],
        dominantSymptoms: [sym('dysmenorrhea', 0.85, 0.5), sym('pain_character', 0.7, 0.5),
          sym('pain_initial_location', 0.7, 0.5), sym('pain_worsening_factors', 0.8, 0.6)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Cramping, dull ache, deep pelvic pain', painLocationTypical: 'Suprapubic / pelvic',
        painRadiationTypical: 'Lower back, thighs' },
      { stageId: 2, label: 'Intermenstrual', typicalHoursFromOnset: [120, 720],
        dominantSymptoms: [sym('pain_location_now', 0.6, 0.5), sym('dyspareunia', 0.5, 0.8),
          sym('bloating', 0.4, 0.6), sym('fatigue', 0.5, 0.5)],
        examFindings: [], severityTrajectory: 'stable',
        painCharacterTypical: 'Dull ache, may be constant', painLocationTypical: 'Pelvic / suprapubic',
        painRadiationTypical: 'Lower back' },
    ],
    progressionRule: 'Chronic progressive condition. Symptoms worsen over years. Cyclic catamenial flares occur with menses; intermenstrual pain develops as adhesions and scarring accumulate.',
  },

  features: {
    symptoms: [
      sym('pain_character', 0.7, 0.5, { stageRelevance: [1, 2] }),
      sym('pain_initial_location', 0.7, 0.5, { stageRelevance: [1] }),
      sym('pain_location_now', 0.6, 0.5, { stageRelevance: [2] }),
      sym('pain_severity', 0.6, 0.4, { stageRelevance: [1, 2] }),
      sym('pain_worsening_factors', 0.8, 0.6, { stageRelevance: [1] }),
      sym('dysmenorrhea', 0.85, 0.5, { stageRelevance: [1] }),
      sym('dyspareunia', 0.5, 0.8, { stageRelevance: [1, 2] }),
      sym('menorrhagia', 0.4, 0.7, { stageRelevance: [1, 2] }),
      sym('bloating', 0.4, 0.6, { stageRelevance: [1, 2] }),
      sym('previous_similar_episodes', 0.7, 0.7, { stageRelevance: [1] }),
      sym('bowel_habits', 0.3, 0.7, { stageRelevance: [1, 2] }),
      sym('nausea', 0.3, 0.5, { stageRelevance: [1] }),
      sym('fatigue', 0.5, 0.5, { stageRelevance: [2] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('dysmenorrhea', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.15, label: 'No cyclic pain with menses — endometriosis unlikely' }),
    ],
    supporting: [
      sym('fever', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.2, label: 'No fever — supports endometriosis over PID' }),
      sym('vaginal_discharge', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.3, label: 'No vaginal discharge — makes PID less likely' }),
    ],
  },

  differential: {
    mimics: ['pid', 'fibroids', 'ovarian_cyst_rupture', 'ibs'],
    distinguishingFeatures: [
      { fromDiseaseId: 'pid', featureIds: ['fever', 'vaginal_discharge', 'dysmenorrhea', 'previous_similar_episodes'] },
      { fromDiseaseId: 'fibroids', featureIds: ['pain_worsening_factors', 'dyspareunia', 'dysmenorrhea'] },
      { fromDiseaseId: 'ovarian_cyst_rupture', featureIds: ['pain_onset', 'peritonism', 'previous_similar_episodes'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Infertility', warningFeatures: [],
      riskFactors: ['delayed_diagnosis', 'advanced_disease'], timeWindowHours: [0, 0], severityTier: 'moderate',
      description: 'Tubal scarring and adhesions cause mechanical infertility requiring IVF or surgical treatment.' },
    { name: 'Ovarian endometrioma', warningFeatures: ['pain_severity'],
      riskFactors: [], timeWindowHours: [0, 0], severityTier: 'moderate',
      description: 'Chocolate cyst of ovary — may rupture causing acute pain mimicking ovarian cyst rupture.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['syncope'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 2. UTERINE FIBROIDS (Leiomyoma)
// ═══════════════════════════════════════════════════════════════════════════════
export const fibroids: DiseaseNode = {
  id: 'fibroids',
  name: 'Uterine Fibroids',
  icdCode: 'D25',
  system: 'gynaecological',
  organSystem: 'reproductive_female',
  acuity: 'routine',
  acuityTier: 4,

  epidemiology: {
    ageMin: 20, ageMax: 60, agePeak: [35, 50],
    sexRisk: { male: 0, female: 1.0 },
    backgroundPrevalence: 0.2,
    riskFactors: [
      { featureId: 'african_ancestry', label: 'African ancestry', LR_positive: 3.0, prevalenceInDisease: 0.6 },
      { featureId: 'nulliparity', label: 'Nulliparity', LR_positive: 2.0, prevalenceInDisease: 0.4 },
      { featureId: 'obesity', label: 'Obesity', LR_positive: 1.5, prevalenceInDisease: 0.3 },
    ],
  },

  pathophysiology: {
    mechanism: 'Benign smooth muscle tumours of the uterine myometrium, driven by oestrogen and progesterone. Growth occurs during reproductive years and regresses after menopause. Fibroids can be submucosal (causing heavy bleeding), intramural (causing pain and pressure), or subserosal (causing mass effect). Symptoms depend on size, number, and location. Heavy menstrual bleeding (menorrhagia) is the most common symptom, often leading to iron-deficiency anaemia.',
    timelineStages: [
      { stageId: 1, label: 'Asymptomatic', typicalHoursFromOnset: [0, 0],
        dominantSymptoms: [],
        examFindings: [], severityTrajectory: 'stable',
        painCharacterTypical: 'None', painLocationTypical: 'None',
        painRadiationTypical: 'None' },
      { stageId: 2, label: 'Symptomatic', typicalHoursFromOnset: [0, 0],
        dominantSymptoms: [sym('menorrhagia', 0.8, 0.7), sym('pain_character', 0.6, 0.5),
          sym('pain_initial_location', 0.6, 0.5), sym('dysmenorrhea', 0.5, 0.55)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Cramping or pressure sensation', painLocationTypical: 'Suprapubic / lower back',
        painRadiationTypical: 'Lower back, thighs' },
    ],
    progressionRule: 'Fibroids grow slowly over years. May remain asymptomatic or become symptomatic as they enlarge. Degeneration (red, hyaline, cystic) can cause acute pain. Malignant transformation (leiomyosarcoma) is very rare.',
  },

  features: {
    symptoms: [
      sym('pain_character', 0.6, 0.5, { stageRelevance: [2] }),
      sym('pain_initial_location', 0.6, 0.5, { stageRelevance: [2] }),
      sym('pain_location_now', 0.5, 0.5, { stageRelevance: [2] }),
      sym('pain_severity', 0.5, 0.4, { stageRelevance: [2] }),
      sym('menorrhagia', 0.8, 0.7, { stageRelevance: [2] }),
      sym('dysmenorrhea', 0.5, 0.55, { stageRelevance: [2] }),
      sym('bloating', 0.5, 0.6, { stageRelevance: [2] }),
      sym('abdominal_distension', 0.4, 0.7, { stageRelevance: [2] }),
      sym('urinary_frequency', 0.4, 0.7, { stageRelevance: [2] }),
      sym('bowel_habits', 0.3, 0.6, { stageRelevance: [2] }),
      sym('fatigue', 0.5, 0.5, { stageRelevance: [2] }),
      sym('previous_similar_episodes', 0.6, 0.7, { stageRelevance: [2] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('menorrhagia', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.15, label: 'No heavy menstrual bleeding — fibroids less likely' }),
    ],
    supporting: [
      sym('vaginal_bleeding', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.3, label: 'Bleeding is catamenial (with menses) not intermenstrual' }),
    ],
  },

  differential: {
    mimics: ['endometriosis', 'adenomyosis', 'ovarian_mass', 'endometrial_cancer'],
    distinguishingFeatures: [
      { fromDiseaseId: 'endometriosis', featureIds: ['dyspareunia', 'pain_worsening_factors', 'menorrhagia'] },
      { fromDiseaseId: 'adenomyosis', featureIds: ['pain_character', 'dysmenorrhea'] },
    ],
    neverCloseConditions: [],
  },

  complications: [
    { name: 'Iron-deficiency anaemia', warningFeatures: ['fatigue', 'palpitations'],
      riskFactors: ['menorrhagia'], timeWindowHours: [0, 0], severityTier: 'moderate',
      description: 'Chronic heavy menstrual bleeding leads to anaemia requiring iron supplementation or transfusion.' },
    { name: 'Fibroid degeneration', warningFeatures: ['pain_severity'],
      riskFactors: ['pregnancy', 'large_fibroid'], timeWindowHours: [0, 0], severityTier: 'moderate',
      description: 'Acute pain from red degeneration (especially in pregnancy) — managed conservatively.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['menorrhagia'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 3. OVARIAN CYST RUPTURE
// ═══════════════════════════════════════════════════════════════════════════════
export const ovarianCystRupture: DiseaseNode = {
  id: 'ovarian_cyst_rupture',
  name: 'Ovarian Cyst Rupture',
  icdCode: 'N83.1',
  system: 'gynaecological',
  organSystem: 'reproductive_female',
  acuity: 'semi_urgent',
  acuityTier: 3,

  epidemiology: {
    ageMin: 15, ageMax: 50, agePeak: [20, 40],
    sexRisk: { male: 0, female: 1.0 },
    backgroundPrevalence: 0.01,
    riskFactors: [
      { featureId: 'known_ovarian_cyst', label: 'Known ovarian cyst', LR_positive: 5.0, prevalenceInDisease: 0.3 },
      { featureId: 'ovulation_induction', label: 'Ovulation induction therapy', LR_positive: 3.0, prevalenceInDisease: 0.1 },
    ],
  },

  pathophysiology: {
    mechanism: 'A functional ovarian cyst (follicular or corpus luteum) ruptures, releasing cystic fluid and blood into the peritoneal cavity. Rupture typically occurs mid-cycle (ovulation) or during physical activity, coitus, or trauma. The fluid causes peritoneal irritation producing acute unilateral lower abdominal pain. Bleeding from a ruptured corpus luteum cyst can be significant, causing haemoperitoneum.',
    timelineStages: [
      { stageId: 1, label: 'Acute rupture', typicalHoursFromOnset: [0, 6],
        dominantSymptoms: [sym('pain_onset', 0.85, 0.55), sym('pain_initial_location', 0.7, 0.5),
          sym('pain_character', 0.8, 0.6), sym('pain_severity', 0.8, 0.4)],
        examFindings: [], severityTrajectory: 'worsening',
        painCharacterTypical: 'Sharp, sudden, unilateral', painLocationTypical: 'Unilateral lower abdomen',
        painRadiationTypical: 'None or to groin' },
      { stageId: 2, label: 'Resolving', typicalHoursFromOnset: [6, 48],
        dominantSymptoms: [sym('pain_location_now', 0.6, 0.5), sym('peritonism', 0.3, 0.8),
          sym('nausea', 0.5, 0.5), sym('vomiting', 0.3, 0.55)],
        examFindings: [], severityTrajectory: 'improving',
        painCharacterTypical: 'Dull ache, improving', painLocationTypical: 'Lower abdomen, may be bilateral',
        painRadiationTypical: 'None' },
    ],
    progressionRule: 'Pain is maximal at onset and gradually resolves over 24–48h. Significant haemorrhage from corpus luteum rupture may cause haemoperitoneum requiring surgical intervention.',
  },

  features: {
    symptoms: [
      sym('pain_onset', 0.85, 0.55, { stageRelevance: [1] }),
      sym('pain_initial_location', 0.7, 0.5, { stageRelevance: [1] }),
      sym('pain_location_now', 0.6, 0.5, { stageRelevance: [2] }),
      sym('pain_character', 0.8, 0.6, { stageRelevance: [1, 2] }),
      sym('pain_severity', 0.8, 0.4, { stageRelevance: [1, 2] }),
      sym('nausea', 0.5, 0.5, { stageRelevance: [1, 2] }),
      sym('vomiting', 0.3, 0.55, { stageRelevance: [1] }),
      sym('peritonism', 0.3, 0.8, { stageRelevance: [2] }),
      sym('syncope', 0.2, 0.9, { stageRelevance: [1] }),
      sym('last_menstrual_period', 0.5, 0.6, { stageRelevance: [1] }),
      sym('previous_similar_episodes', 0.3, 0.7, { stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('pain_onset', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.1, label: 'Gradual onset makes rupture unlikely' }),
    ],
    supporting: [
      sym('fever', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.3, label: 'No fever — supports cyst rupture over PID or appendicitis' }),
    ],
  },

  differential: {
    mimics: ['appendicitis', 'ectopic_pregnancy', 'ovarian_torsion', 'pid'],
    distinguishingFeatures: [
      { fromDiseaseId: 'appendicitis', featureIds: ['pain_onset', 'pain_initial_location', 'pain_migration'] },
      { fromDiseaseId: 'ectopic_pregnancy', featureIds: ['last_menstrual_period', 'vaginal_bleeding', 'syncope'] },
      { fromDiseaseId: 'ovarian_torsion', featureIds: ['pain_character', 'nausea', 'previous_similar_episodes'] },
    ],
    neverCloseConditions: ['ectopic_pregnancy'],
  },

  complications: [
    { name: 'Haemoperitoneum', warningFeatures: ['syncope', 'peritonism', 'abdominal_distension'],
      riskFactors: ['anticoagulant_use', 'corpus_luteum_cyst'], timeWindowHours: [0, 12], severityTier: 'critical',
      description: 'Significant bleeding into peritoneal cavity from ruptured cyst — may require laparoscopy or laparotomy.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['syncope'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 4. THREATENED ABORTION
// ═══════════════════════════════════════════════════════════════════════════════
export const threatenedAbortion: DiseaseNode = {
  id: 'threatened_abortion',
  name: 'Threatened Abortion',
  icdCode: 'O20.0',
  system: 'obstetric',
  organSystem: 'reproductive_female',
  acuity: 'semi_urgent',
  acuityTier: 3,

  epidemiology: {
    ageMin: 15, ageMax: 45, agePeak: [20, 35],
    sexRisk: { male: 0, female: 1.0 },
    backgroundPrevalence: 0.15,
    riskFactors: [
      { featureId: 'prior_miscarriage', label: 'Prior miscarriage', LR_positive: 3.0, prevalenceInDisease: 0.3 },
      { featureId: 'advanced_maternal_age', label: 'Advanced maternal age (>35)', LR_positive: 2.5, prevalenceInDisease: 0.3 },
      { featureId: 'smoking', label: 'Smoking', LR_positive: 2.0, prevalenceInDisease: 0.2 },
    ],
  },

  pathophysiology: {
    mechanism: 'Vaginal bleeding in early pregnancy (before 20 weeks) with a closed cervix and no passage of products of conception. The pregnancy is viable but at increased risk of miscarriage. Bleeding may result from implantation, decidual reaction, or partial separation of the placenta. Cramping pain results from uterine contractions attempting to expel the pregnancy.',
    timelineStages: [
      { stageId: 1, label: 'Bleeding', typicalHoursFromOnset: [0, 24],
        dominantSymptoms: [sym('vaginal_bleeding', 0.9, 0.85), sym('pain_character', 0.6, 0.5),
          sym('pain_initial_location', 0.6, 0.5), sym('pain_severity', 0.5, 0.4)],
        examFindings: [], severityTrajectory: 'stable',
        painCharacterTypical: 'Mild cramping', painLocationTypical: 'Suprapubic',
        painRadiationTypical: 'None' },
      { stageId: 2, label: 'Observation', typicalHoursFromOnset: [24, 168],
        dominantSymptoms: [sym('vaginal_bleeding', 0.5, 0.85), sym('pain_location_now', 0.4, 0.5)],
        examFindings: [], severityTrajectory: 'improving',
        painCharacterTypical: 'Resolving mild cramps', painLocationTypical: 'Suprapubic',
        painRadiationTypical: 'None' },
    ],
    progressionRule: 'May resolve with continued viable pregnancy or progress to inevitable / complete miscarriage. Bleeding typically lasts days. Heavy bleeding with passage of tissue signals inevitable abortion.',
  },

  features: {
    symptoms: [
      sym('vaginal_bleeding', 0.9, 0.85, { stageRelevance: [1, 2] }),
      sym('pain_character', 0.6, 0.5, { stageRelevance: [1] }),
      sym('pain_initial_location', 0.6, 0.5, { stageRelevance: [1] }),
      sym('pain_location_now', 0.4, 0.5, { stageRelevance: [2] }),
      sym('pain_severity', 0.5, 0.4, { stageRelevance: [1] }),
      sym('previous_similar_episodes', 0.4, 0.7, { stageRelevance: [1] }),
      sym('nausea', 0.5, 0.5, { stageRelevance: [1] }),
      sym('last_menstrual_period', 0.85, 0.8, { stageRelevance: [1] }),
      sym('pregnancy_status', 0.95, 0.9, { stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('vaginal_bleeding', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.05, label: 'No vaginal bleeding — threatened abortion unlikely' }),
      sym('pregnancy_status', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.01, label: 'Not pregnant — threatened abortion excluded' }),
    ],
    supporting: [
      sym('vaginal_discharge', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.5, label: 'No discharge makes PID less likely' }),
    ],
  },

  differential: {
    mimics: ['ectopic_pregnancy', 'miscarriage', 'pid', 'ovarian_cyst_rupture'],
    distinguishingFeatures: [
      { fromDiseaseId: 'ectopic_pregnancy', featureIds: ['pain_onset', 'syncope', 'pain_location_now'] },
      { fromDiseaseId: 'miscarriage', featureIds: ['vaginal_bleeding', 'pain_severity', 'pregnancy_status'] },
    ],
    neverCloseConditions: ['ectopic_pregnancy'],
  },

  complications: [
    { name: 'Miscarriage', warningFeatures: ['vaginal_bleeding', 'pain_severity'],
      riskFactors: ['advanced_maternal_age', 'prior_miscarriage'], timeWindowHours: [24, 168], severityTier: 'moderate',
      description: 'Progression to inevitable or complete miscarriage — may require surgical evacuation.' },
    { name: 'Haemorrhage', warningFeatures: ['syncope', 'vaginal_bleeding'],
      riskFactors: ['advanced_gestation', 'retained_products'], timeWindowHours: [24, 72], severityTier: 'severe',
      description: 'Heavy bleeding from incomplete miscarriage requiring transfusion and evacuation.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['syncope'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 5. PLACENTAL ABRUPTION
// ═══════════════════════════════════════════════════════════════════════════════
export const placentalAbruption: DiseaseNode = {
  id: 'placental_abruption',
  name: 'Placental Abruption',
  icdCode: 'O45',
  system: 'obstetric',
  organSystem: 'reproductive_female',
  acuity: 'immediately_life_threatening',
  acuityTier: 1,

  epidemiology: {
    ageMin: 15, ageMax: 45, agePeak: [25, 35],
    sexRisk: { male: 0, female: 1.0 },
    backgroundPrevalence: 0.005,
    riskFactors: [
      { featureId: 'preeclampsia', label: 'Pre-eclampsia / hypertension', LR_positive: 4.0, prevalenceInDisease: 0.3 },
      { featureId: 'abruptio_history', label: 'Prior placental abruption', LR_positive: 6.0, prevalenceInDisease: 0.1 },
      { featureId: 'trauma', label: 'Abdominal trauma', LR_positive: 5.0, prevalenceInDisease: 0.1 },
      { featureId: 'smoking', label: 'Smoking', LR_positive: 2.5, prevalenceInDisease: 0.3 },
      { featureId: 'cocaine_use', label: 'Cocaine use', LR_positive: 5.0, prevalenceInDisease: 0.05 },
    ],
  },

  pathophysiology: {
    mechanism: 'Premature separation of the normally implanted placenta from the uterine wall after 20 weeks of gestation. Bleeding occurs at the decidual-placental interface, forming a retroplacental clot that causes further separation. This leads to uterine hypertonus, fetal distress, and — if severe — maternal haemorrhagic shock and disseminated intravascular coagulation (DIC). Concealed abruption (no visible bleeding) occurs in 20% of cases and is especially dangerous.',
    timelineStages: [
      { stageId: 1, label: 'Abruption', typicalHoursFromOnset: [0, 2],
        dominantSymptoms: [sym('pain_onset', 0.85, 0.6), sym('pain_character', 0.8, 0.6),
          sym('pain_initial_location', 0.8, 0.55), sym('vaginal_bleeding', 0.7, 0.85)],
        examFindings: [], severityTrajectory: 'rapidly_worsening',
        painCharacterTypical: 'Severe, constant, uterine', painLocationTypical: 'Uterine area / suprapubic',
        painRadiationTypical: 'Lower back' },
      { stageId: 2, label: 'Haemorrhagic shock', typicalHoursFromOnset: [0, 2],
        dominantSymptoms: [sym('pain_severity', 0.9, 0.4), sym('syncope', 0.6, 0.9),
          sym('peritonism', 0.5, 0.85), sym('vaginal_bleeding', 0.7, 0.85)],
        examFindings: [], severityTrajectory: 'rapidly_worsening',
        painCharacterTypical: 'Excruciating, constant, uterine rigidity', painLocationTypical: 'Uterine / diffuse',
        painRadiationTypical: 'Lower back, thighs' },
    ],
    progressionRule: 'Life-threatening emergency. Fetal distress develops within minutes. DIC can develop within hours. Immediate delivery by caesarean section is often required regardless of gestational age.',
  },

  features: {
    symptoms: [
      sym('pain_onset', 0.85, 0.6, { stageRelevance: [1] }),
      sym('pain_character', 0.8, 0.6, { stageRelevance: [1, 2] }),
      sym('pain_initial_location', 0.8, 0.55, { stageRelevance: [1] }),
      sym('pain_location_now', 0.7, 0.5, { stageRelevance: [2] }),
      sym('pain_severity', 0.9, 0.4, { stageRelevance: [1, 2] }),
      sym('vaginal_bleeding', 0.7, 0.85, { stageRelevance: [1, 2] }),
      sym('peritonism', 0.5, 0.85, { stageRelevance: [2] }),
      sym('syncope', 0.6, 0.9, { stageRelevance: [2] }),
      sym('last_menstrual_period', 0.85, 0.8, { stageRelevance: [1] }),
      sym('pregnancy_status', 0.95, 0.9, { stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('pregnancy_status', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.01, label: 'Not pregnant — abruption excluded' }),
      sym('pregnancy_gestational_age', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.05, label: 'Less than 20 weeks gestation — abruption cannot occur' }),
    ],
    supporting: [
      sym('pain_onset', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.15, label: 'Gradual onset — less likely to be abruption' }),
    ],
  },

  differential: {
    mimics: ['placenta_praevia', 'uterine_rupture', 'preterm_labour', 'cholecystitis', 'pancreatitis'],
    distinguishingFeatures: [
      { fromDiseaseId: 'placenta_praevia', featureIds: ['pain_character', 'pain_severity', 'vaginal_bleeding'] },
      { fromDiseaseId: 'uterine_rupture', featureIds: ['prior_abdominal_surgery', 'pain_onset', 'pain_character'] },
      { fromDiseaseId: 'preterm_labour', featureIds: ['pain_character', 'pain_severity', 'vaginal_bleeding'] },
    ],
    neverCloseConditions: ['placenta_praevia'],
  },

  complications: [
    { name: 'DIC (Disseminated Intravascular Coagulation)', warningFeatures: ['syncope', 'vaginal_bleeding'],
      riskFactors: ['concealed_abruption', 'severe_abruption'], timeWindowHours: [0, 6], severityTier: 'critical',
      description: 'Release of thromboplastin from the placenta triggers consumptive coagulopathy — requires aggressive transfusion.' },
    { name: 'Maternal haemorrhagic shock', warningFeatures: ['syncope'],
      riskFactors: ['concealed_abruption'], timeWindowHours: [0, 4], severityTier: 'critical',
      description: 'Life-threatening blood loss requiring massive transfusion protocol and emergency delivery.' },
    { name: 'Fetal death', warningFeatures: [],
      riskFactors: ['severe_abruption', 'complete_abruption'], timeWindowHours: [0, 2], severityTier: 'critical',
      description: 'Complete separation cuts off fetal oxygenation — fetal demise within minutes.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['syncope', 'peritonism', 'vaginal_bleeding'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 6. UTERINE RUPTURE
// ═══════════════════════════════════════════════════════════════════════════════
export const uterineRupture: DiseaseNode = {
  id: 'uterine_rupture',
  name: 'Uterine Rupture',
  icdCode: 'O71.0',
  system: 'obstetric',
  organSystem: 'reproductive_female',
  acuity: 'immediately_life_threatening',
  acuityTier: 1,

  epidemiology: {
    ageMin: 15, ageMax: 45, agePeak: [25, 35],
    sexRisk: { male: 0, female: 1.0 },
    backgroundPrevalence: 0.0005,
    riskFactors: [
      { featureId: 'prior_caesarean', label: 'Previous caesarean section (scarred uterus)', LR_positive: 20.0, prevalenceInDisease: 0.7 },
      { featureId: 'prior_uterine_surgery', label: 'Prior uterine surgery (myomectomy)', LR_positive: 10.0, prevalenceInDisease: 0.2 },
      { featureId: 'prolonged_labour', label: 'Prolonged / obstructed labour', LR_positive: 5.0, prevalenceInDisease: 0.3 },
      { featureId: 'oxytocin_use', label: 'Oxytocin augmentation', LR_positive: 3.0, prevalenceInDisease: 0.2 },
    ],
  },

  pathophysiology: {
    mechanism: 'Full-thickness tear of the uterine wall, most commonly through a prior caesarean scar during labour. The tear allows communication between the uterine cavity and the peritoneal cavity, often with expulsion of the fetus and placenta into the abdomen. Massive haemorrhage occurs from the highly vascular uterine wall. Fetal distress is immediate and maternal hypovolaemic shock develops rapidly.',
    timelineStages: [
      { stageId: 1, label: 'Rupture', typicalHoursFromOnset: [0, 0.1],
        dominantSymptoms: [sym('pain_onset', 0.9, 0.65), sym('pain_character', 0.85, 0.7),
          sym('pain_severity', 0.95, 0.5), sym('syncope', 0.7, 0.9)],
        examFindings: [], severityTrajectory: 'rapidly_worsening',
        painCharacterTypical: 'Sudden tearing or ripping sensation during labour', painLocationTypical: 'Lower uterine segment',
        painRadiationTypical: 'None' },
      { stageId: 2, label: 'Shock', typicalHoursFromOnset: [0, 0.5],
        dominantSymptoms: [sym('syncope', 0.9, 0.9), sym('peritonism', 0.7, 0.85),
          sym('abdominal_distension', 0.5, 0.7), sym('vaginal_bleeding', 0.6, 0.85)],
        examFindings: [], severityTrajectory: 'rapidly_worsening',
        painCharacterTypical: 'Excruciating tearing pain, now diffuse', painLocationTypical: 'Generalised abdomen',
        painRadiationTypical: 'Shoulder (diaphragmatic irritation)' },
    ],
    progressionRule: 'Catastrophic with minutes to intervene. Fetal distress is immediate. Maternal haemorrhage is rapid and severe. Immediate laparotomy is required — every minute counts.',
  },

  features: {
    symptoms: [
      sym('pain_onset', 0.9, 0.65, { stageRelevance: [1] }),
      sym('pain_character', 0.85, 0.7, { stageRelevance: [1] }),
      sym('pain_severity', 0.95, 0.5, { stageRelevance: [1, 2] }),
      sym('syncope', 0.9, 0.9, { stageRelevance: [1, 2] }),
      sym('peritonism', 0.7, 0.85, { stageRelevance: [2] }),
      sym('abdominal_distension', 0.5, 0.7, { stageRelevance: [2] }),
      sym('vaginal_bleeding', 0.6, 0.85, { stageRelevance: [1, 2] }),
      sym('pregnancy_status', 0.95, 0.9, { stageRelevance: [1] }),
    ],
    signs: [],
    investigations: [],
  },

  importantNegatives: {
    rulingOut: [
      sym('pregnancy_status', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.01, label: 'Not pregnant — uterine rupture excluded' }),
    ],
    supporting: [
      sym('pain_character', 0.0, 0.0, { sensitivity: 0.0, specificity: 0.0,
        LR_negative: 0.1, label: 'Non-tearing pain — uterine rupture unlikely' }),
    ],
  },

  differential: {
    mimics: ['placental_abruption', 'amniotic_fluid_embolism', 'cord_prolapse', 'uterine_inversion'],
    distinguishingFeatures: [
      { fromDiseaseId: 'placental_abruption', featureIds: ['pain_character', 'prior_abdominal_surgery', 'pain_onset'] },
    ],
    neverCloseConditions: ['placental_abruption', 'amniotic_fluid_embolism'],
  },

  complications: [
    { name: 'Maternal death', warningFeatures: ['syncope'],
      riskFactors: ['delayed_laparotomy'], timeWindowHours: [0, 1], severityTier: 'critical',
      description: 'Exsanguination from uterine rupture — immediate surgical repair or hysterectomy required.' },
    { name: 'Fetal death', warningFeatures: [],
      riskFactors: ['complete_rupture'], timeWindowHours: [0, 0.25], severityTier: 'critical',
      description: 'Fetal expulsion into peritoneal cavity causes cord compression and placental separation.' },
    { name: 'Hysterectomy', warningFeatures: ['syncope'],
      riskFactors: ['extensive_rupture'], timeWindowHours: [0, 2], severityTier: 'critical',
      description: 'Unreparable uterine tear requires emergency hysterectomy to control haemorrhage.' },
  ],

  clinicalScores: [],
  redFlagFeatureIds: ['syncope', 'peritonism'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// Gynaecological & Obstetric disease index
// ═══════════════════════════════════════════════════════════════════════════════
export const GYNAECOLOGICAL_NODES: DiseaseNode[] = [
  endometriosis,
  fibroids,
  ovarianCystRupture,
  threatenedAbortion,
  placentalAbruption,
  uterineRupture,
];
