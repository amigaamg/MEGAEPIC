// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Universal Examination Engine — Core Type Hierarchy
// ═══════════════════════════════════════════════════════════════════════════════
// Every examination module — General, System, Local, Specialty — uses these types.
// No module invents its own type system.
// ═══════════════════════════════════════════════════════════════════════════════

// ── Anatomical Framework ───────────────────────────────────────────────────────

export type BodyRegion =
  | 'general'
  | 'head'
  | 'neck'
  | 'chest'
  | 'abdomen'
  | 'pelvis'
  | 'upper_limb'
  | 'lower_limb'
  | 'back'
  | 'perineum';

export type Laterality = 'left' | 'right' | 'bilateral' | 'midline' | 'not_applicable';

export interface AnatomicalLocation {
  region: BodyRegion;
  side?: Laterality;
  quadrant?: string;
  landmark?: string;
  description?: string;
}

// ── Measurement ────────────────────────────────────────────────────────────────

export interface Measurement {
  value: number;
  unit: string;
  expected?: number;
  lowNormal?: number;
  highNormal?: number;
  zScore?: number;
  percentile?: number;
  interpretation?: string;
  severity?: 'normal' | 'borderline' | 'abnormal' | 'critical';
}

export interface GrowthMeasurement extends Measurement {
  ageMonths?: number;
  sex?: 'male' | 'female';
  referenceStandard?: 'who' | 'cdc' | 'local';
}

// ── Clinical Finding ───────────────────────────────────────────────────────────

export type FindingSeverity = 'mild' | 'moderate' | 'severe' | 'critical';
export type FindingTrend = 'stable' | 'improving' | 'worsening' | 'resolved' | 'new';
export type FindingCertainty = 'confirmed' | 'suspected' | 'rule_out';

export interface ClinicalFinding {
  id: string;
  present: boolean;
  label: string;
  severity?: FindingSeverity;
  location?: AnatomicalLocation;
  measurements?: Record<string, Measurement>;
  certainty?: FindingCertainty;
  trend?: FindingTrend;
  description?: string;
  examinedAt: number;
  examinedBy?: string;
  note?: string;
}

// ── Vital Sign ─────────────────────────────────────────────────────────────────

export interface VitalSignMeasurement {
  value: number;
  unit: string;
  lowNormal: number;
  highNormal: number;
  severity: 'normal' | 'elevated' | 'low' | 'critical_high' | 'critical_low';
  interpretation: string;
  trend?: FindingTrend;
  previousValue?: number;
}

export interface IntelligentVitals {
  temperature?: VitalSignMeasurement & { method?: 'axillary' | 'oral' | 'rectal' | 'tympanic' | 'temporal' };
  heartRate?: VitalSignMeasurement & { rhythm?: 'regular' | 'irregular' | 'regularly_irregular' | 'irregularly_irregular' };
  respiratoryRate?: VitalSignMeasurement & { pattern?: 'regular' | 'kussmaul' | 'cheyne_stokes' | 'biot' | 'apneustic' };
  bloodPressure?: {
    systolic: VitalSignMeasurement;
    diastolic: VitalSignMeasurement;
    map?: number;
    cuffSize?: 'adult' | 'child' | 'infant' | 'thigh';
    position?: 'sitting' | 'lying' | 'standing';
  };
  spo2?: VitalSignMeasurement & { fio2?: number; onOxygen?: boolean };
  painScore?: { value: number; max: number; scale: 'nrs' | 'wong_baker' | 'flacc' | 'cries' | 'comfort'; interpretation: string };
  bloodGlucose?: VitalSignMeasurement & { fasting?: boolean; timeSinceMeal?: number };
  capillaryRefill?: { value: number; unit: 'seconds'; normal: boolean; site?: 'finger' | 'toe' | 'sternum' };
  avpu?: 'alert' | 'voice' | 'pain' | 'unresponsive';
  gcs?: { eye: number; verbal: number; motor: number; total: number; interpretation: string };
  urineOutput?: VitalSignMeasurement & { periodHours: number };
}

// ── Anthropometry ──────────────────────────────────────────────────────────────

export interface Anthropometry {
  weight?: GrowthMeasurement;
  length?: GrowthMeasurement;
  height?: GrowthMeasurement;
  headCircumference?: GrowthMeasurement;
  chestCircumference?: GrowthMeasurement;
  muac?: GrowthMeasurement;
  bmi?: GrowthMeasurement;
  armSpan?: Measurement;
  waistCircumference?: Measurement;
  hipCircumference?: Measurement;
  abdominalCircumference?: Measurement;
  skinfoldThickness?: Measurement;
}

// ── Constitutional Sign — each is a ClinicalFinding with expanded detail ──────

export type ConstitutionalSignId =
  | 'pallor'
  | 'jaundice'
  | 'cyanosis'
  | 'clubbing'
  | 'lymphadenopathy'
  | 'peripheral_oedema'
  | 'dehydration'
  | 'cachexia'
  | 'obesity'
  | 'pigmentation'
  | 'rash'
  | 'petechiae'
  | 'purpura'
  | 'ecchymosis'
  | 'spider_naevi'
  | 'palmar_erythema'
  | 'xanthelasma'
  | 'scratch_marks'
  | 'muscle_wasting'
  | 'tremor'
  | 'asterixis'
  | 'nail_changes'
  | 'finger_changes'
  | 'hair_changes'
  | 'goitre';

export interface PallorFinding extends ClinicalFinding {
  id: 'pallor';
  site?: 'conjunctiva' | 'palm' | 'nail_bed' | 'tongue' | 'generalized';
}

export interface JaundiceFinding extends ClinicalFinding {
  id: 'jaundice';
  site?: 'sclerae' | 'skin' | 'mucosa';
  bilirubin?: number;
}

export interface CyanosisFinding extends ClinicalFinding {
  id: 'cyanosis';
  type?: 'central' | 'peripheral';
  site?: 'lips' | 'tongue' | 'nail_bed' | 'extremities';
  oxygenSaturation?: number;
}

export interface ClubbingFinding extends ClinicalFinding {
  id: 'clubbing';
  grade?: 1 | 2 | 3 | 4;
  schamrothSign?: boolean;
  drumstickAppearance?: boolean;
  hypertrophicPulmonaryOsteoarthropathy?: boolean;
}

export interface LymphadenopathyFinding extends ClinicalFinding {
  id: 'lymphadenopathy';
  site?: 'cervical' | 'axillary' | 'inguinal' | 'supraclavicular' | 'epitrochlear' | 'generalized';
  size?: number;
  consistency?: 'soft' | 'firm' | 'hard' | 'rubbery';
  matted?: boolean;
  tenderness?: boolean;
  mobile?: boolean;
}

export interface OedemaFinding extends ClinicalFinding {
  id: 'peripheral_oedema';
  site?: 'pedal' | 'ankle' | 'leg' | 'sacral' | 'facial' | 'generalized';
  pitting?: boolean;
  grade?: 1 | 2 | 3 | 4;
}

export interface DehydrationFinding extends ClinicalFinding {
  id: 'dehydration';
  skinTurgor?: 'normal' | 'reduced' | 'very_reduced';
  sunkenEyes?: boolean;
  dryMucosa?: boolean;
  capillaryRefill?: number;
  thirst?: boolean;
  urineOutput?: string;
}

export interface LymphNode {
  site: string;
  size: number;
  consistency: 'soft' | 'firm' | 'hard' | 'rubbery';
  matted: boolean;
  tender: boolean;
  mobile: boolean;
  surface: 'smooth' | 'irregular';
  overlyingSkin: 'normal' | 'inflamed' | 'fixed' | 'sinus';
}

export interface LymphNodeExamination {
  examined: boolean;
  regionalNodes: LymphNode[];
  generalized: boolean;
  comment?: string;
}

export type ConstitutionalSign =
  | PallorFinding
  | JaundiceFinding
  | CyanosisFinding
  | ClubbingFinding
  | LymphadenopathyFinding
  | OedemaFinding
  | DehydrationFinding
  | ClinicalFinding;

// ── General Appearance ─────────────────────────────────────────────────────────

export interface GeneralAppearance {
  overall: 'well' | 'ill' | 'toxic' | 'distressed' | 'cachectic' | 'obese' | 'comfortable' | 'anxious' | 'agitated';
  consciousness: 'alert' | 'drowsy' | 'obtunded' | 'stuporous' | 'unresponsive';
  orientation?: { time: boolean; place: boolean; person: boolean };
  mobility?: 'independent' | 'aided' | 'wheelchair' | 'bedridden' | 'unable_to_assess';
  position?: 'supine' | 'prone' | 'sitting' | 'tripod' | 'left_lateral' | 'right_lateral' | 'knee_chest' | 'unable_to_lie_flat' | 'antalgic';
  nutritionalState: 'normal' | 'thin' | 'cachectic' | 'obese' | 'morbid_obesity' | 'malnourished' | 'sam' | 'mam';
  hydration: 'well_hydrated' | 'mild_dehydration' | 'moderate_dehydration' | 'severe_dehydration';
  hygiene?: 'good' | 'fair' | 'poor';
  odour?: 'normal' | 'alcohol' | 'ketotic' | 'uraemic' | 'foul' | 'hepatic' | 'other';
  distress?: 'none' | 'mild' | 'moderate' | 'severe';
  speech?: 'normal' | 'slurred' | 'dysarthric' | 'aphasic' | 'hoarse';
  cooperation?: 'cooperative' | 'reluctant' | 'uncooperative';
  breathingPattern?: 'normal' | 'laboured' | 'kussmaul' | 'cheyne_stokes' | 'biot';
}

// ── Preparation ────────────────────────────────────────────────────────────────

export interface ExaminationPreparation {
  identityConfirmed: boolean;
  consentObtained: boolean;
  chaperoneRequired: boolean;
  chaperonePresent?: boolean;
  lightingAdequate: boolean;
  patientComfortable: boolean;
  exposureAdequate: boolean;
  privacyMaintained: boolean;
  handHygienePerformed: boolean;
  ppeUsed: boolean;
  position?: string;
  notes?: string;
}

// ── Universal General Examination — aggregate type ────────────────────────────

export interface UniversalGeneralExamination {
  preparation: ExaminationPreparation;
  generalAppearance: GeneralAppearance;
  vitalSigns: IntelligentVitals;
  anthropometry: Anthropometry;
  constitutionalSigns: Partial<Record<ConstitutionalSignId, ConstitutionalSign>>;
  lymphNodeExamination: LymphNodeExamination;
  notes?: string;
  examinedAt: number;
  examinedBy?: string;
}

// ── Activation Rules ───────────────────────────────────────────────────────────

export type ActivationTriggerType =
  | 'age'
  | 'sex'
  | 'physiological_state'
  | 'specialty'
  | 'chief_complaint'
  | 'symptom'
  | 'finding'
  | 'constitutional_sign';

export interface ActivationRule {
  triggerType: ActivationTriggerType;
  condition: string;
  activates: string[];
  priority: number;
}
