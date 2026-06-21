// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN DiseaseNode Schema v2 — Universal disease knowledge representation
// Every disease in the system is encoded using exactly this structure.
// The engine is disease-agnostic; it only reads DiseaseNode records.
// ═══════════════════════════════════════════════════════════════════════════════

export type OrganSystem = 'GI' | 'hepatobiliary' | 'pancreatic' | 'splenic'
  | 'renal' | 'urological' | 'reproductive_female' | 'reproductive_male'
  | 'cardiovascular' | 'pulmonary' | 'neurological' | 'musculoskeletal'
  | 'endocrine' | 'haematological' | 'dermatological' | 'psychiatric'
  | 'metabolic' | 'toxicological' | 'infectious' | 'paediatric' | 'geriatric';

export type DiseaseSystem = 'surgical' | 'medical' | 'gynaecological'
  | 'obstetric' | 'urological' | 'vascular' | 'haematological'
  | 'endocrine' | 'metabolic' | 'psychiatric' | 'infectious'
  | 'toxicological' | 'paediatric' | 'musculoskeletal';

export type Acuity = 'immediately_life_threatening' | 'urgent'
  | 'semi_urgent' | 'routine';

export type AcuityTier = 1 | 2 | 3 | 4; // 1 = immediate, 4 = routine

export type SeverityGrade = 'mild' | 'moderate' | 'severe' | 'critical';

export type ConvergenceState = 'exploring' | 'converging' | 'confirming';

export type FeatureCategory = 'symptom' | 'sign' | 'risk_factor'
  | 'investigation_result' | 'demographic' | 'contextual';

export type AnswerPolarity = 'present' | 'absent';

/** A single question/feature that can be asked of the patient */
export interface FeatureRecord {
  featureId: string;
  label: string;                    // "Did the pain move from your belly button to the lower right side?"
  shortLabel: string;               // "Pain migration (periumbilical → RLQ)"
  category: FeatureCategory;
  type: 'boolean' | 'select' | 'multi_select' | 'number' | 'text';
  options?: string[];               // For select/multi_select

  /** Sensitivity: proportion of patients WITH this disease who have this feature */
  sensitivity: number;
  /** Specificity: proportion WITHOUT this disease who LACK this feature */
  specificity: number;
  /** Likelihood ratio when feature is PRESENT (computed from sens/spec if not explicitly set) */
  LR_positive?: number;
  /** Likelihood ratio when feature is ABSENT */
  LR_negative?: number;

  /** Which timeline stages this feature applies to */
  stageRelevance: number[];

  /** If true, this feature can be pre-filled from chief complaints (avoid redundant asking) */
  canBeFromCC?: boolean;

  /** Clinical guide for the answer value */
  clinicalGuide?: string;

  /** If set, this feature is only asked when the parent feature has been answered with the specified value */
  dependsOn?: {
    featureId: string;           // e.g. 'vomiting'
    value: string | boolean;      // e.g. true (Yes) — only ask this if vomiting = Yes
  };
}

export interface TimelineStage {
  stageId: number;
  label: string;                    // "Early inflammation", "Suppuration", "Gangrene", "Perforation"
  typicalHoursFromOnset: [number, number]; // range [min, max]
  dominantSymptoms: FeatureRecord[];
  examFindings: FeatureRecord[];
  severityTrajectory: 'stable' | 'worsening' | 'rapidly_worsening' | 'improving';
  painCharacterTypical: string;
  painLocationTypical: string;
  painRadiationTypical: string;
}

export interface RiskFactor {
  featureId: string;
  label: string;
  LR_positive: number;
  prevalenceInDisease: number;       // what fraction of patients with the disease have this risk factor
}

export interface Complication {
  name: string;
  warningFeatures: string[];         // featureIds that signal this complication
  riskFactors: string[];
  timeWindowHours: [number, number]; // when after onset does this complication typically occur
  severityTier: SeverityGrade;
  description: string;
}

export interface ScoreItem {
  featureId: string;
  label: string;
  pointsWhenPresent: number;
  weight?: number;
}

export interface ClinicalScore {
  name: string;                      // "Alvarado", "STONE", "Ranson"
  items: ScoreItem[];
  interpretationThresholds: { maxScore: number; label: string }[];
  maxScore: number;
}

/** DiseaseNode — all knowledge about a single disease */
export interface DiseaseNode {
  id: string;                        // "acute_appendicitis"
  name: string;                      // "Acute Appendicitis"
  icdCode: string;                   // "K35"
  system: DiseaseSystem;
  organSystem: OrganSystem;
  acuity: Acuity;
  acuityTier: AcuityTier;

  /** Epidemiological priors (NOT probabilities — relative weights) */
  epidemiology: {
    ageMin: number;
    ageMax: number;
    agePeak: [number, number];       // peak incidence age range
    sexRisk: { male: number; female: number };
    backgroundPrevalence: number;    // 0–1 base rate
    riskFactors: RiskFactor[];
    geographicFlags?: string[];
  };

  /** Pathophysiology narrative + timeline */
  pathophysiology: {
    mechanism: string;               // 1-paragraph explanation
    timelineStages: TimelineStage[];
    progressionRule: string;         // "Untreated, advances from stage N to N+1 over X hours"
  };

  /** Feature probability table */
  features: {
    symptoms: FeatureRecord[];       // History features
    signs: FeatureRecord[];          // Exam findings (can be asked as history proxy)
    investigations: FeatureRecord[]; // Lab/imaging findings
  };

  /** Important negatives */
  importantNegatives: {
    rulingOut: FeatureRecord[];      // Absence strongly rules OUT this disease (LR− < 0.15)
    supporting: FeatureRecord[];     // Absence supports THIS disease by ruling out mimics
  };

  /** Differential competitors */
  differential: {
    mimics: string[];                // diseaseIds this is often confused with
    distinguishingFeatures: { fromDiseaseId: string; featureIds: string[] }[];
    neverCloseConditions: string[];  // diseaseIds that must stay in DDx regardless
  };

  /** Complications */
  complications: Complication[];

  /** Clinical scoring systems */
  clinicalScores: ClinicalScore[];

  /** Red-flag features that trigger immediate escalation */
  redFlagFeatureIds: string[];

  /** Minimum encounter state needed before this disease is worth asking about */
  activationThreshold?: {
    requiredPositiveFeatures: string[];  // must have these to activate
    requiredAbsentFeatures?: string[];   // must not have these to activate
  };

  /** Manifestation profile for vomiting — what kind of vomiting does this disease produce?
   *  Only needed if this disease commonly causes vomiting.
   *  Used by the vomiting highway to ask disease-discriminating questions. */
  vomitingManifestation?: VomitingManifestation;

  /** Manifestation profile for abdominal distension — what pattern of distension does this disease produce?
   *  Only needed if this disease commonly causes abdominal distension.
   *  Used by the distension highway to ask disease-discriminating questions. */
  distensionManifestation?: DistensionManifestation;

  /** Manifestation profile for diarrhoea — what pattern of diarrhoea does this disease produce?
   *  Only needed if this disease commonly causes diarrhoea.
   *  Used by the diarrhoea highway to ask disease-discriminating questions. */
  diarrhoeaManifestation?: DiarrhoeaManifestation;

  /** Manifestation profile for constipation — what pattern of constipation does this disease produce?
   *  Only needed if this disease commonly causes constipation.
   *  Used by the constipation highway to ask disease-discriminating questions. */
  constipationManifestation?: ConstipationManifestation;

  /** Manifestation profile for dysphagia/odynophagia — what pattern of swallowing difficulty does this disease produce?
   *  Only needed if this disease commonly causes dysphagia or odynophagia.
   *  Used by the dysphagia highway to ask disease-discriminating questions. */
  dysphagiaManifestation?: DysphagiaManifestation;

  /** Manifestation profile for GI bleeding — what pattern of bleeding does this disease produce?
   *  Only needed if this disease commonly causes hematemesis, melena, or hematochezia.
   *  Used by the GI bleeding highway to ask disease-discriminating questions. */
  giBleedingManifestation?: GiBleedingManifestation;

  /** Manifestation profile for jaundice — what pattern of hyperbilirubinemia does this disease produce?
   *  Only needed if this disease commonly causes jaundice.
   *  Used by the jaundice highway to ask disease-discriminating questions. */
  jaundiceManifestation?: JaundiceManifestation;
}

/** Vomiting manifestation profile — describes the typical vomiting pattern for a disease.
 *  Every descriptor helps the EIG engine ask the most discriminating question. */
export interface VomitingManifestation {
  /** When does vomiting occur relative to pain? */
  timingRelativeToPain: 'before' | 'after' | 'independent' | 'variable' | 'no_pain';

  /** Typical number of vomiting episodes */
  typicalFrequency: 'rare' | 'mild_1_3' | 'moderate_3_5' | 'severe_5_plus' | 'continuous';

  /** Is the vomitus typically bilious (yellow-green)? */
  bilious: 'never' | 'sometimes' | 'often' | 'always';

  /** Is vomiting typically projectile? */
  projectile: 'never' | 'sometimes' | 'often' | 'always';

  /** Is the vomitus ever feculent (stool-like)? */
  feculent: 'never' | 'sometimes' | 'often' | 'always';

  /** Does vomiting relieve the pain? */
  reliefAfterVomiting: boolean;

  /** Typical relation to meals */
  relationToEating: 'before' | 'after_immediate' | 'after_delayed' | 'unrelated' | 'variable';

  /** Is vomiting worse in the morning? */
  morningPredominance: boolean;

  /** Typical vomitus appearance */
  typicalAppearance: 'stomach_contents' | 'bile' | 'blood' | 'coffee_ground' | 'feculent' | 'variable';

  /** Typical severity of associated nausea */
  associatedNausea: 'always' | 'often' | 'sometimes' | 'rare';

  /** Does this disease typically present with vomiting as a PRIMARY symptom (not just associated)? */
  vomitingIsPrimary: boolean;

  /** Narrative description of typical vomiting pattern for HPI generation */
  typicalDescription: string;
}

/** Distension manifestation profile — describes the typical abdominal distension pattern for a disease.
 *  Every descriptor helps the EIG engine ask the most discriminating question. */
export interface DistensionManifestation {
  /** What part of the abdomen is most affected? */
  site: 'generalised' | 'upper_abdomen' | 'lower_abdomen' | 'left_side' | 'right_side' | 'localised_mass' | 'variable';

  /** Onset speed */
  onset: 'sudden_hours' | 'gradual_days' | 'slow_weeks_months' | 'variable';

  /** Progression pattern */
  progression: 'stable' | 'progressive' | 'intermittent_cyclic' | 'variable';

  /** Character of the distension */
  character: 'tense_tight' | 'soft_bloated' | 'firm_hard' | 'intermittent' | 'mass_like' | 'variable';

  /** Is it postprandially worse? */
  postprandial: 'yes' | 'no' | 'variable';

  /** Does the distension associate with pain? */
  associatedPain: 'always' | 'often' | 'sometimes' | 'rare' | 'never';

  /** Typical pain character if present */
  painType: 'colicky_cramping' | 'constant_dull' | 'constant_severe' | 'burning' | 'none' | 'variable';

  /** Relationship to bowel habits */
  bowelRelation: 'constipation_predominant' | 'obstipation' | 'diarrhea_predominant' | 'alternating' | 'no_change' | 'variable';

  /** Is distension relieved by passing stool/flatus? */
  relievedByStoolGas: 'yes' | 'partial' | 'no' | 'variable';

  /** Associated systemic features */
  systemicFeatures: ('weight_loss' | 'fever' | 'night_sweats' | 'jaundice' | 'leg_swelling' | 'dyspnea' | 'early_satiety' | 'none')[];

  /** Narrative description of typical distension pattern for HPI generation */
  typicalDescription: string;
}

/** Diarrhoea manifestation profile — describes the typical diarrhoea pattern for a disease.
 *  Every descriptor helps the EIG engine ask the most discriminating question. */
export interface DiarrhoeaManifestation {
  /** Duration category */
  duration: 'acute' | 'persistent' | 'chronic' | 'variable';

  /** Stool characteristics */
  stoolType: 'watery' | 'bloody' | 'mucoid' | 'fatty_steatorrhea' | 'mixed' | 'variable';

  /** Stool volume */
  volume: 'small' | 'moderate' | 'large' | 'massive' | 'variable';

  /** Frequency per day */
  frequency: 'mild_3_5' | 'moderate_5_10' | 'severe_10_plus' | 'continuous' | 'variable';

  /** Relation to food */
  relationToFood: 'worse_after_eating' | 'improves_with_fasting' | 'persists_despite_fasting' | 'unrelated' | 'variable';

  /** Nocturnal symptoms? */
  nocturnal: 'yes' | 'no' | 'variable';

  /** Associated symptoms */
  associatedSymptoms: ('fever' | 'vomiting' | 'abdominal_pain' | 'weight_loss' | 'blood' | 'mucus' | 'tenesmus' | 'flushing' | 'palpitations' | 'rash' | 'arthritis' | 'dehydration' | 'none')[];

  /** Mechanism */
  mechanism: 'osmotic' | 'secretory' | 'inflammatory' | 'malabsorptive' | 'dysmotility' | 'mixed' | 'variable';

  /** Typical description for HPI generation */
  typicalDescription: string;
}

/** Constipation manifestation profile — describes the typical constipation pattern for a disease.
 *  Every descriptor helps the EIG engine ask the most discriminating question. */
export interface ConstipationManifestation {
  /** Duration category */
  duration: 'acute' | 'chronic' | 'lifelong' | 'variable';

  /** Stool frequency per week */
  frequency: 'mild_3_5_per_week' | 'moderate_1_2_per_week' | 'severe_less_than_1_per_week' | 'variable';

  /** Stool consistency */
  stoolConsistency: 'hard_pellets' | 'large_painful' | 'ribbon_like' | 'normal_with_straining' | 'overflow_diarrhoea' | 'variable';

  /** Straining with defecation */
  straining: 'yes' | 'no' | 'variable';

  /** Sensation of incomplete evacuation */
  incompleteEvacuation: 'yes' | 'no' | 'variable';

  /** Need for manual maneuvers to pass stool */
  manualManeuvers: 'yes' | 'no' | 'variable';

  /** Abdominal pain association */
  abdominalPain: 'yes_relieved_by_defecation' | 'yes_not_relieved' | 'no' | 'variable';

  /** Bloating association */
  bloating: 'yes' | 'no' | 'variable';

  /** Rectal bleeding association */
  bleeding: 'yes' | 'no' | 'variable';

  /** Associated symptoms */
  associatedSymptoms: ('weight_loss' | 'vomiting' | 'abdominal_distension' | 'neurological' | 'endocrine' | 'fever' | 'tenesmus' | 'mucus' | 'none')[];

  /** Mechanism */
  mechanism: 'slow_transit' | 'outlet_obstruction' | 'functional' | 'ibs' | 'drug_induced' | 'endocrine' | 'neurological' | 'mechanical_obstruction' | 'mixed' | 'variable';

  /** Typical description for HPI generation */
  typicalDescription: string;
}

/** Dysphagia/odynophagia manifestation profile — describes the typical swallowing difficulty pattern for a disease.
 *  Every descriptor helps the EIG engine ask the most discriminating question. */
export interface DysphagiaManifestation {
  /** Phase of swallowing affected */
  phase: 'oropharyngeal' | 'esophageal' | 'both' | 'variable';

  /** Type of symptom — dysphagia, odynophagia, or both */
  symptomType: 'dysphagia' | 'odynophagia' | 'both' | 'variable';

  /** What foods are affected */
  foodType: 'solids_only' | 'solids_then_liquids' | 'solids_and_liquids' | 'intermittent_solids' | 'variable';

  /** Onset pattern */
  onset: 'acute' | 'subacute' | 'chronic_progressive' | 'intermittent' | 'variable';

  /** Progression */
  progression: 'progressive' | 'stable' | 'intermittent' | 'variable';

  /** Associated pain character (for odynophagia) */
  painCharacter: 'burning' | 'sharp' | 'deep_retrosternal' | 'none' | 'variable';

  /** Associated symptoms */
  associatedSymptoms: ('weight_loss' | 'regurgitation' | 'aspiration' | 'choking' | 'coughing' | 'hoarseness' | 'heartburn' | 'neck_mass' | 'neurological' | 'fever' | 'halitosis' | 'none')[];

  /** Risk context */
  riskContext: ('smoking_alcohol' | 'hiv' | 'immunosuppression' | 'gerd' | 'neurological' | 'autoimmune' | 'caustic' | 'medication' | 'none')[];

  /** Mechanism */
  mechanism: 'mechanical_obstruction' | 'motility_disorder' | 'inflammatory' | 'neurological' | 'infectious' | 'autoimmune' | 'functional' | 'mixed' | 'variable';

  /** Typical description for HPI generation */
  typicalDescription: string;
}

/** GI bleeding manifestation profile — describes the typical bleeding pattern for a disease.
 *  Every descriptor helps the EIG engine ask the most discriminating question. */
export interface GiBleedingManifestation {
  /** Type of GI bleeding presentation */
  bleedingType: ('hematemesis' | 'melena' | 'hematochezia' | 'occult' | 'variable')[];

  /** Site of bleeding */
  site: 'esophageal' | 'gastric' | 'duodenal' | 'small_bowel' | 'colonic' | 'rectal' | 'anal' | 'unknown' | 'variable';

  /** Onset pattern */
  onset: 'acute' | 'subacute' | 'chronic_occult' | 'intermittent' | 'variable';

  /** Severity/volume */
  severity: 'massive_shock' | 'moderate' | 'mild_self_limited' | 'occult' | 'variable';

  /** Color/character */
  character: 'bright_red' | 'dark_red_maroon' | 'coffee_ground' | 'black_tarry' | 'occult' | 'variable';

  /** Associated pain pattern */
  painPattern: 'painless' | 'epigastric_pain' | 'abdominal_pain' | 'colicky_pain' | 'rectal_pain' | 'variable';

  /** Associated symptoms */
  associatedSymptoms: ('vomiting' | 'nausea' | 'dysphagia' | 'weight_loss' | 'fever' | 'diarrhea' | 'tenesmus' | 'jaundice' | 'ascites' | 'syncope' | 'anemia' | 'none')[];

  /** Risk context */
  riskContext: ('portal_hypertension' | 'nsaid' | 'anticoagulant' | 'alcohol' | 'smoking' | 'prior_gi_bleed' | 'aaa' | 'h_pylori' | 'gerd' | 'none')[];

  /** Mechanism */
  mechanism: 'acid_related' | 'portal_hypertension' | 'vascular_malformation' | 'inflammatory' | 'neoplastic' | 'mechanical_trauma' | 'ischemic' | 'infectious' | 'coagulopathy' | 'variable';

  /** Typical description for HPI generation */
  typicalDescription: string;
}

/** Jaundice manifestation profile — describes the typical hyperbilirubinemia pattern for a disease.
 *  Every descriptor helps the EIG engine ask the most discriminating question. */
export interface JaundiceManifestation {
  /** Bilirubin classification — the most fundamental discriminator */
  bilirubinType: 'unconjugated' | 'conjugated' | 'mixed' | 'variable';

  /** Anatomical/physiological category */
  category: 'pre_hepatic_hemolytic' | 'hepatic_hepatocellular' | 'post_hepatic_obstructive' | 'congenital' | 'variable';

  /** Onset pattern */
  onset: 'acute' | 'subacute' | 'chronic_progressive' | 'intermittent' | 'congenital' | 'variable';

  /** Progression */
  progression: 'progressive' | 'stable' | 'intermittent' | 'fluctuating' | 'variable';

  /** Associated pain */
  painPattern: 'ruq_pain' | 'epigastric_pain' | 'colicky_ruq' | 'painless' | 'variable';

  /** Associated symptoms — highest diagnostic yield */
  associatedSymptoms: ('fever' | 'pruritus' | 'dark_urine' | 'pale_stool' | 'weight_loss' | 'anemia' | 'ascites' | 'splenomegaly' | 'gi_bleeding' | 'confusion' | 'arthralgia' | 'none')[];

  /** Risk context */
  riskContext: ('alcohol' | 'viral_hepatitis' | 'drug_induced' | 'pregnancy' | 'gallstones' | 'malignancy' | 'autoimmune' | 'hemolysis' | 'none')[];

  /** Mechanism */
  mechanism: 'hemolytic' | 'hepatocellular_injury' | 'cholestatic' | 'obstructive' | 'congenital_enzyme' | 'infiltrative' | 'vascular' | 'infectious' | 'variable';

  /** Typical description for HPI generation */
  typicalDescription: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Encounter State — accumulates in real time
// ═══════════════════════════════════════════════════════════════════════════════

export interface AnswerRecord {
  featureId: string;
  questionLabel?: string;
  value: string | boolean | string[] | number;
  polarity: AnswerPolarity;
  timestamp: number;
  source: 'socrates' | 'chief_complaint' | 'biodata' | 'inferred';
}

export interface CandidateDiseaseState {
  diseaseId: string;
  diseaseName: string;
  priorProb: number;
  currentProb: number;
  evidenceFor: string[];
  evidenceAgainst: string[];
  importantNegativesFound: string[];
  matchedStages: number[];
  scoreResults: Record<string, { score: number; interpretation: string }>;
  isRedFlagTriggered: boolean;
}

export interface EncounterState {
  patient: {
    age: number;
    sex: 'male' | 'female';
    setting: string;
    geographicRegion: string;
    knownComorbidities: string[];
    medications: string[];
    surgicalHistory: string[];
  };

  chiefComplaint: {
    text: string;
    symptomId: string;               // "abdominal_pain"
    highwayId: string;               // "abdominal_pain"
    duration?: string;
    preFiledFeatures: FeatureRecord[]; // Features already known from CC (avoid repetition)
  };

  answers: AnswerRecord[];
  questionsAsked: string[];
  redFlagsTriggered: string[];

  ddx: {
    activeCandidates: CandidateDiseaseState[];
    leadingDiagnosis: CandidateDiseaseState | null;
    convergenceState: ConvergenceState;
    lastUpdated: number;
  };

  phase: 'triage' | 'characterization' | 'confirmation' | 'risk_factor' | 'examination' | 'output';
}
