export type Sex = 'male' | 'female' | 'unknown';
export type SymptomId = string;
export type DiseaseId = string;
export type OccupationType = 'farmer' | 'miner' | 'healthcare' | 'teacher' | 'driver' | 'office' | 'student' | 'retired' | 'unemployed' | 'other';
export type Reliability = '' | 'reliable' | 'partially_reliable' | 'poor_historian' | 'obtained_from_relative' | 'obtained_from_caregiver' | 'unavailable';
export type Informant = '' | 'patient' | 'spouse' | 'parent' | 'child' | 'sibling' | 'friend' | 'caregiver' | 'ems' | 'other';
export type PatientProfile = 'adult' | 'pediatric' | 'newborn' | 'obstetric' | 'gynecologic';

export interface ObstetricBiodata {
  gravida: number;
  para: number;
  liveChildren: number;
  abortions: number;
  lnmp: string; // ISO date string for LNMP
  edd: string; // auto-calculated from LNMP via Naegele
  gestationalAgeWeeks: number;
  gestationalAgeDays: number;
  isPregnant: boolean;
  numberOfFetuses: number;
}

export interface PediatricBiodata {
  birthWeight: number;
  currentWeight: number;
  birthHeight: number;
  currentHeight: number;
  headCircumference: number;
  gestationalAgeAtBirth: string; // 'full_term' | 'preterm' | 'post_term'
}

export interface NewbornBiodata {
  birthWeight: number;
  birthLength: number;
  headCircumference: number;
  gestationalAgeWeeks: number;
  apgar1: number;
  apgar5: number;
  feeding: 'exclusive_breastfeeding' | 'mixed' | 'formula' | 'iv';
  resuscitation: string;
}

export interface Biodata {
  name: string;
  age: number;
  sex: Sex;
  occupation: string;
  occupationType?: OccupationType;
  residence: string;
  informant?: Informant;
  reliability?: Reliability;
  profile: PatientProfile;
  obstetric?: ObstetricBiodata;
  pediatric?: PediatricBiodata;
  newborn?: NewbornBiodata;
}

export interface ChiefComplaint {
  id: string;
  symptomId: SymptomId;
  label: string;
  duration: string;
  durationDays: number;
  isPrimary: boolean;
  associatedSymptomIds?: string[];
}

export interface TimelineEvent {
  id: string;
  date: string;
  relativeTime: string;
  description: string;
  symptomId?: SymptomId;
}

export interface SocratesAnswer {
  questionId: string;
  question: string;
  answer: string | boolean | string[];
  field?: string;
  weight: number;
}

export interface FeatureEntry {
  id: string;
  present: boolean | null;
  weight: number;
  diseaseWeights: Record<string, number>;
  negativeDiseaseWeights: Record<string, number>;
  source?: 'history' | 'exam' | 'vital' | 'lab' | 'imaging' | 'score';
  modifier?: {
    key: string;
    value: string | number | boolean;
    weightBoost?: number;
  };
}

export interface FeatureRegistry {
  [featureId: string]: FeatureEntry;
}

export interface HpiEntry {
  symptomId: SymptomId;
  label: string;
  socrates: SocratesAnswer[];
  positives: string[];
  negatives: string[];
  flow?: 'worsening' | 'improving' | 'static' | 'fluctuating';
  onsetAcute?: boolean;
  seenByAnyone?: string;
  treatmentReceived?: string;
  responseToTreatment?: string;
  parentSymptomId?: string;
}

export interface PastAdmission {
  year: number;
  reason: string;
  hospital: string;
  treatment: string;
}

export interface Surgery {
  year: number;
  procedure: string;
  hospital: string;
}

export interface BloodTransfusion {
  year: number;
  indication: string;
  hospital: string;
}

export interface ChronicDisease {
  condition: string;
  yearDiagnosed: number;
  hospital: string;
  drugs: string;
  followUp: string;
  compliant: boolean | null;
}

export interface PastHistory {
  admissions: PastAdmission[];
  surgeries: Surgery[];
  transfusions: BloodTransfusion[];
  chronicDiseases: ChronicDisease[];
  allergies: string[];
  longTermMeds: string[];
  tbHistory: '' | 'none' | 'treated' | 'on_treatment' | 'defaulted';
  foodAllergies: string[];
  drugAllergies: string[];
}

export interface FamilySocial {
  maritalStatus: '' | 'single' | 'married' | 'divorced' | 'widowed' | 'separated';
  numberOfSpouses?: number;
  education: '' | 'none' | 'primary' | 'secondary' | 'tertiary' | 'postgraduate';
  incomeLevel: '' | 'low' | 'middle' | 'high';
  housing: '' | 'owned' | 'rented' | 'informal' | 'homeless';
  water: '' | 'piped' | 'well' | 'river' | 'bottled';
  sanitation: '' | 'flush' | 'pit' | 'ventilated_pit' | 'none';
  smoking: '' | 'never' | 'former' | 'current';
  smokingPackYears?: number;
  alcohol: '' | 'never' | 'occasional' | 'moderate' | 'heavy' | 'former';
  alcoholAmount?: string;
  substanceUse: string[];
  familyHistory: string[];
  familyDiseases: string[];
  occupationExposure: string[];
  travelHistory: string[];
  transportAccess: '' | 'private' | 'public' | 'walking' | 'none';
  healthInsurance: boolean | null;
}

export interface RosSystem {
  id: string;
  label: string;
  priority: number;
  symptoms: RosSymptom[];
}

export interface RosSymptom {
  id: string;
  label: string;
  present: boolean | null;
  details: string;
}

export type RosFindings = RosSystem[];

export interface ImpactOnLife {
  work: '' | 'no_impact' | 'reduced' | 'unable';
  walking: '' | 'no_impact' | 'reduced' | 'unable';
  eating: '' | 'no_impact' | 'reduced' | 'unable';
  sleeping: '' | 'no_impact' | 'disturbed' | 'severely_disturbed';
  adl: '' | 'independent' | 'needs_assistance' | 'dependent';
  description: string;
}

export interface RedFlag {
  id: string;
  rule: string;
  severity: 'critical' | 'high' | 'moderate';
  message: string;
  diseases: string[];
  triggered: boolean;
}

export interface DdxSnapshot {
  timestamp: number;
  probabilities: { diseaseId: string; diseaseName: string; probability: number }[];
}

export interface ClinicalReasoningTrace {
  diseaseId: string;
  diseaseName: string;
  supporting: string[];
  against: string[];
  keyFindings: string[];
}

export interface DdxResult {
  probabilities: { diseaseId: string; diseaseName: string; probability: number }[];
  snapshots: DdxSnapshot[];
  traces: ClinicalReasoningTrace[];
}

export interface GeneratedDocuments {
  chiefComplaintText: string;
  hpiNarrative: string;
  pastHistoryNarrative: string;
  birthHistoryNarrative: string;
  immunizationNarrative: string;
  growthDevNarrative: string;
  nutritionNarrative: string;
  obstetricHistoryNarrative: string;
  gynecologyHistoryNarrative: string;
  familySocialNarrative: string;
  rosNarrative: string;
  impactOnLifeNarrative: string;
  generalExaminationNarrative: string;
  systemExaminationNarrative: string;
  localExaminationNarrative: string;
  obstetricExamNarrative: string;
  newbornExamNarrative: string;
  clinicalReasoningNarrative: string;
  clinicalImpressionNarrative: string;
  differentialNarrative: string;
  investigationPlanNarrative: string;
  investigationInterpretationNarrative: string;
  treatmentPlanNarrative: string;
  monitoringPlanNarrative: string;
  summaryNarrative: string;
  fullDocumentation: string;
}

// ═══════════════════════════════════════════════════════════════
// EXAMINATION — 8-Step General Examination Framework
// ═══════════════════════════════════════════════════════════════

export interface Vitals {
  temperature: number | null;
  heartRate: number | null;
  bloodPressureSystolic: number | null;
  bloodPressureDiastolic: number | null;
  respiratoryRate: number | null;
  oxygenSaturation: number | null;
  bloodSugar: number | null;
  weight: number | null;
  height: number | null;
  bmi: number | null;
  painScore: number | null;
}

// STEP A — Overall Appearance
export interface OverallAppearance {
  appearance: string;
}

// STEP B — Vitals (above)
// STEP C — Anthropometry (weight/height/BMI above)

// STEP D — Hydration
export interface HydrationStatus {
  status: '' | 'normal' | 'mild_dehydration' | 'moderate_dehydration' | 'severe_dehydration';
  dryMucosa: boolean;
  sunkenEyes: boolean;
  reducedSkinTurgor: boolean;
}

// STEP E — Nutrition
export interface NutritionalStatus {
  status: '' | 'normal' | 'underweight' | 'wasted' | 'obese';
}

// STEP F — Consciousness
export interface ConsciousnessLevel {
  level: '' | 'alert' | 'drowsy' | 'confused' | 'unresponsive';
  gcs: number | null;
}

// STEP G — Distress Assessment
export interface DistressAssessment {
  pain: boolean;
  respiratory: boolean;
  cardiovascular: boolean;
  neurological: boolean;
  painScore: number | null;
}

// STEP H — Adaptive General Signs
export interface GeneralSign {
  id: string;
  label: string;
  present: boolean;
  details: string;
}

export interface GeneralExamination {
  vitals: Vitals;
  appearance: OverallAppearance;
  hydration: HydrationStatus;
  nutrition: NutritionalStatus;
  consciousness: ConsciousnessLevel;
  distress: DistressAssessment;
  generalSigns: GeneralSign[];
  notes: string;
}

// ── SYSTEMIC EXAMINATION (adaptive — systems selected by DDX) ──
export interface SystemExaminationFinding {
  id: string;
  label: string;
  finding: 'normal' | 'abnormal' | 'not_examined';
  description: string;
}

export interface SystemExamination {
  systemId: string;
  systemName: string;
  findings: SystemExaminationFinding[];
  summary: string;
}

export type SystemExaminations = SystemExamination[];

// ── LOCAL EXAMINATION (surgery/ortho: swelling, ulcer, wound, etc.) ──
export type LocalExamType = 'swelling' | 'ulcer' | 'wound' | 'mass' | 'deformity' | 'fracture' | 'burn' | 'abscess' | 'sinus' | 'fistula' | 'scar';

export interface SwellingExamination {
  site: string;
  size: string;
  shape: string;
  surface: string;
  edge: string;
  tenderness: 'present' | 'absent';
  consistency: 'soft' | 'firm' | 'hard' | 'cystic' | 'fluctuant';
  fluctuant: boolean;
  transilluminable: boolean;
  reducible: boolean;
  pulsatile: boolean;
  compressible: boolean;
  temperature: 'normal' | 'warm' | 'hot';
  fixity: 'mobile' | 'fixed_to_skin' | 'fixed_to_deep';
  lymphNodes: string;
  overlyingSkin: string;
}

export interface UlcerExamination {
  site: string;
  size: string;
  shape: string;
  edge: 'sloping' | 'punched_out' | 'undermined' | 'rolled' | 'everted';
  base: string;
  floor: string;
  discharge: string;
  odor: string;
  surroundingSkin: string;
  tenderness: 'present' | 'absent';
  bleeding: boolean;
  lymphNodes: string;
  relations: string;
}

export interface LocalExamination {
  type: LocalExamType;
  anatomicalSite: string;
  swelling?: SwellingExamination;
  ulcer?: UlcerExamination;
  description: string;
  relevantExamination: string;
}

// ═══════════════════════════════════════════════════════════════
// LOCAL EXAMINATION SURGICAL/ORTHOPEDIC
// ═══════════════════════════════════════════════════════════════

export interface LocalExaminationEntry {
  id: string;
  type: LocalExamType;
  anatomicalSite: string;
  label: string;
  findings: Record<string, string>;
  description: string;
  interpretation: string;
}

export type LocalExaminations = LocalExaminationEntry[];

// ═══════════════════════════════════════════════════════════════
// DIAGNOSIS — Clinical Reasoning combining History + Exam
// ═══════════════════════════════════════════════════════════════

export interface DiagnosisReasoning {
  fromHistory: string[];
  fromExamination: string[];
}

export interface ProvisionalDiagnosis {
  diagnosis: string;
  diagnosisId: string;
  probability: number;
  reasoning: DiagnosisReasoning;
}

export interface DifferentialWithReasoning {
  diseaseId: string;
  diseaseName: string;
  probability: number;
  reasonsFor: string[];
  reasonsAgainst: string[];
}

export interface ClinicalReasoningEntry {
  diseaseId: string;
  diseaseName: string;
  probability: number;
  supportingFromHistory: string[];
  supportingFromExamination: string[];
  opposing: string[];
  keyFindings: string[];
  overallAssessment: string;
}

export type ClinicalReasoningArray = ClinicalReasoningEntry[];

// ═══════════════════════════════════════════════════════════════
// INVESTIGATIONS
// ═══════════════════════════════════════════════════════════════

export interface InvestigationItem {
  id: string;
  name: string;
  category: 'lab' | 'imaging' | 'procedure' | 'bedside';
  rationale: string;
  expectedFinding: string;
  priority: 'essential' | 'supportive' | 'optional';
  recommendedFor: string[];
}

export interface InvestigationPlan {
  investigations: InvestigationItem[];
  notes: string;
}

// ── INVESTIGATION INTERPRETATION ──
export interface InvestigationInterpretationItem {
  investigationId: string;
  investigationName: string;
  result: string;
  isAbnormal: boolean;
  interpretation: string;
  supportsDiseaseIds: string[];
}

export interface InvestigationInterpretation {
  items: InvestigationInterpretationItem[];
  overallInterpretation: string;
}

// ═══════════════════════════════════════════════════════════════
// TREATMENT
// ═══════════════════════════════════════════════════════════════

export interface TreatmentItem {
  intervention: string;
  category: 'supportive' | 'definitive' | 'complication_management';
  forCondition: string;
  dosage?: string;
  duration?: string;
  rationale: string;
}

export interface TreatmentPlan {
  items: TreatmentItem[];
  followUp: string;
  disposition: '' | 'home' | 'admit_ward' | 'admit_icu' | 'refer' | 'emergency';
  dispositionRationale: string;
}

// ═══════════════════════════════════════════════════════════════
// MONITORING PLAN
// ═══════════════════════════════════════════════════════════════

export interface MonitoringParameter {
  id: string;
  parameter: string;
  frequency: string;
  target: string;
  rationale: string;
}

export interface ComplicationPrevention {
  id: string;
  measure: string;
  rationale: string;
}

export interface MonitoringPlan {
  vitalMonitoring: MonitoringParameter[];
  labMonitoring: MonitoringParameter[];
  complicationPrevention: ComplicationPrevention[];
  escalationCriteria: string;
  reviewPlan: string;
}

export interface GlobalAnswers {
  flow?: 'worsening' | 'improving' | 'static' | 'fluctuating';
  seenByAnyone?: string;
  treatmentTaken?: string;
  treatmentResponse?: string;
  functionalImpact?: string;
}

// ═══════════════════════════════════════════════════════════════
// FOLLOW-UP
// ═══════════════════════════════════════════════════════════════

export interface FollowUpEntry {
  id: string;
  encounterId: string;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
  type: 'clinical_review' | 'lab_repeat' | 'imaging_repeat' | 'specialist_referral' | 'procedure' | 'other';
  notes: string;
  findings: string;
  outcome: string;
  nextFollowUp: string;
}

// ═══════════════════════════════════════════════════════════════
// BIRTH HISTORY (Pediatrics 28d-12yr & Newborn 0-28d)
// ═══════════════════════════════════════════════════════════════

export interface AntenatalHistory {
  antenatalCare: '' | 'yes' | 'no' | 'unknown';
  ancVisits: number;
  placeOfDelivery: string;
  maternalIllness: string[]; // hypertension, diabetes, infections, etc.
  medications: string[];
  ultrasounds: string;
  complications: string[];
  tetanusToxoid: boolean;
  hivStatus: '' | 'positive' | 'negative' | 'unknown';
  syphilisScreen: boolean;
  malariaProphylaxis: boolean;
}

export interface NatalHistory {
  placeOfDelivery: string;
  deliveryType: '' | 'svd' | 'assisted_breach' | 'vacuum' | 'forceps' | 'c_section_elective' | 'c_section_emergency';
  presentation: '' | 'cephalic' | 'breech' | 'transverse' | 'other';
  cordProlapse: boolean;
  birthWeight: number;
  gestationalAgeWeeks: number;
  resuscitation: string;
  cry: '' | 'immediate' | 'delayed' | 'none';
  color: '' | 'pink' | 'blue' | 'pale';
}

export interface PostnatalHistory {
  immediateFeeding: '' | 'breastfeeding' | 'formula' | 'mixed' | 'none';
  vitaminK: boolean;
  bcgGiven: boolean;
  opvGiven: boolean;
  neonatalJaundice: boolean;
  phototherapy: boolean;
  neonatalSepsis: boolean;
  nicuAdmission: boolean;
  nicuDays: number;
  meconiumPassed: '' | 'within_24h' | 'after_24h' | 'unknown';
  urinePassed: '' | 'within_24h' | 'after_24h' | 'unknown';
}

export interface BirthHistory {
  antenatal: AntenatalHistory;
  natal: NatalHistory;
  postnatal: PostnatalHistory;
}

// ═══════════════════════════════════════════════════════════════
// IMMUNIZATION HISTORY (Pediatrics)
// ═══════════════════════════════════════════════════════════════

export interface VaccineDose {
  vaccine: string;
  dose: string;
  ageGiven: string;
  dateGiven: string;
  given: boolean;
  notes: string;
}

export interface ImmunizationHistory {
  bcg: VaccineDose;
  opv0: VaccineDose;
  opv1: VaccineDose;
  opv2: VaccineDose;
  opv3: VaccineDose;
  ipv: VaccineDose;
  penta1: VaccineDose;
  penta2: VaccineDose;
  penta3: VaccineDose;
  pcv1: VaccineDose;
  pcv2: VaccineDose;
  pcv3: VaccineDose;
  rota1: VaccineDose;
  rota2: VaccineDose;
  measles1: VaccineDose;
  measles2: VaccineDose;
  yellowFever: VaccineDose;
  hpv: VaccineDose;
  tetanus: VaccineDose;
  covid: VaccineDose;
  other: VaccineDose[];
  upToDate: boolean;
}

// ═══════════════════════════════════════════════════════════════
// GROWTH & DEVELOPMENT (Pediatrics)
// ═══════════════════════════════════════════════════════════════

export interface GrowthParameter {
  age: string;
  weight: number;
  height: number;
  headCircumference: number;
  percentile: string;
}

export interface DevelopmentalMilestones {
  socialSmile: 'achieved' | 'not_achieved' | 'unknown';
  headControl: 'achieved' | 'not_achieved' | 'unknown';
  sitting: 'achieved' | 'not_achieved' | 'unknown';
  crawling: 'achieved' | 'not_achieved' | 'unknown';
  standing: 'achieved' | 'not_achieved' | 'unknown';
  walking: 'achieved' | 'not_achieved' | 'unknown';
  firstWords: 'achieved' | 'not_achieved' | 'unknown';
  sentences: 'achieved' | 'not_achieved' | 'unknown';
  toiletTraining: 'achieved' | 'not_achieved' | 'unknown';
  concerns: string;
}

export interface GrowthDevelopment {
  growthParams: GrowthParameter[];
  milestones: DevelopmentalMilestones;
  concerns: string;
}

// ═══════════════════════════════════════════════════════════════
// NUTRITION HISTORY (Pediatrics)
// ═══════════════════════════════════════════════════════════════

export interface NutritionHistory {
  currentFeeding: '' | 'exclusive_breastfeeding' | 'mixed' | 'formula' | 'complementary' | 'family_diet';
  breastfeedingDuration: string;
  formulaType: string;
  complementaryFoodsStarted: string;
  mealsPerDay: number;
  foodGroups: string[];
  supplements: string[];
  appetite: '' | 'good' | 'fair' | 'poor';
  feedingDifficulty: string;
  pica: boolean;
}

// ═══════════════════════════════════════════════════════════════
// OBSTETRIC HISTORY (OB/GYN)
// ═══════════════════════════════════════════════════════════════

export interface ObstetricHistoryEntry {
  year: number;
  outcome: 'live_birth' | 'stillbirth' | 'miscarriage' | 'ectopic' | 'termination';
  gestationalAgeWeeks: number;
  deliveryType: '' | 'svd' | 'c_section' | 'vacuum' | 'forceps' | 'assisted_breech';
  placeOfDelivery: string;
  complications: string[];
  babyWeight: number;
  babySex: Sex;
  breastfeeding: string;
}

export interface ObstetricHistory {
  totalPregnancies: number;
  totalDeliveries: number;
  liveChildren: number;
  stillbirths: number;
  miscarriages: number;
  ectopics: number;
  cesareanSections: number;
  pregnancies: ObstetricHistoryEntry[];
  currentPregnancy: {
    trimester: '' | 'first' | 'second' | 'third';
    weeksGestation: number;
    antenatalCare: string;
    fetalMovements: '' | 'present' | 'absent' | 'reduced';
    complications: string[];
  };
}

// ═══════════════════════════════════════════════════════════════
// GYNECOLOGY HISTORY
// ═══════════════════════════════════════════════════════════════

export interface MenstrualHistory {
  menarche: number; // age
  cycleLength: number; // days
  duration: number; // days
  regularity: '' | 'regular' | 'irregular' | 'amenorrhea';
  flow: '' | 'light' | 'moderate' | 'heavy';
  dysmenorrhea: '' | 'none' | 'mild' | 'moderate' | 'severe';
  intermenstrualBleeding: boolean;
  postcoitalBleeding: boolean;
  postmenopausalBleeding: boolean;
  menopauseAge: number | null;
  lmp: string; // last menstrual period date
}

export interface ContraceptionHistory {
  currentMethod: string;
  previousMethods: string[];
  duration: string;
  compliance: '' | 'good' | 'fair' | 'poor';
  sideEffects: string;
}

export interface GynecologicHistory {
  menstrual: MenstrualHistory;
  contraception: ContraceptionHistory;
  papSmears: string;
  stdHistory: string[];
  gynecologicSurgery: string[];
  fertilityConcerns: string;
  breastSymptoms: string;
}

// ═══════════════════════════════════════════════════════════════
// NEWBORN EXAMINATION (head-to-toe for 0-28d)
// ═══════════════════════════════════════════════════════════════

export interface NewbornVitals {
  temperature: number | null;
  heartRate: number | null;
  respiratoryRate: number | null;
  oxygenSaturation: number | null;
  bloodSugar: number | null;
}

export interface HeadToToeExam {
  // Head & Neck
  headCircumference: number | null;
  fontanelles: 'normal' | 'sunken' | 'bulging' | 'tense';
  sutures: 'normal' | 'overlapping' | 'widely_separated';
  caput: boolean;
  cephalhematoma: boolean;
  eyes: string;
  ears: string;
  nose: string;
  mouth: string;
  palate: 'intact' | 'cleft';
  neck: string;

  // Chest
  chestShape: string;
  breastEngorgement: boolean;
  chestAuscultation: string;

  // Abdomen
  abdomen: string;
  umbilicalCord: 'normal' | 'infected' | 'bleeding' | 'hernia';
  liverPalpable: boolean;
  spleenPalpable: boolean;
  anus: 'normal' | 'imperforate' | 'stenosis';

  // Genitalia
  genitalia: string;
  testesDescended: boolean;
  labia: string;

  // Limbs & Spine
  spine: string;
  hips: 'normal' | 'dysplasia' | 'dislocated';
  limbs: string;
  digits: string;
  palmarCreases: string;

  // Skin
  skinColor: 'pink' | 'jaundiced' | 'pale' | 'cyanosed' | 'mottled';
  rash: string;
  birthMarks: string;
  vernix: boolean;
  lanugo: boolean;

  // Neurological
  tone: 'normal' | 'hypertonic' | 'hypotonic' | 'floppy';
  reflexes: {
    moro: 'present' | 'absent' | 'asymmetric';
    rooting: 'present' | 'absent';
    sucking: 'present' | 'absent';
    grasping: 'present' | 'absent';
    stepping: 'present' | 'absent';
    babinski: 'present' | 'absent';
  };
  cry: 'normal' | 'weak' | 'high_pitched' | 'absent';
  activity: 'active' | 'lethargic' | 'irritable';
}

export interface NewbornExamination {
  vitals: NewbornVitals;
  headToToe: HeadToToeExam;
  gestationalAgeAssessment: string; // Ballard score / Dubowitz
  overallAssessment: string;
}

// ═══════════════════════════════════════════════════════════════
// LEOPOLD'S MANEUVERS (Pregnant abdominal exam)
// ═══════════════════════════════════════════════════════════════

export interface LeopoldManeuver {
  firstManeuver: string; // Fundal grip — what is in the fundus
  secondManeuver: string; // Lateral grip — position of fetal back
  thirdManeuver: string; // Pawlick grip — presenting part, engagement
  fourthManeuver: string; // Pelvic grip — descent, flexion
  fetalLie: 'longitudinal' | 'transverse' | 'oblique' | 'unstable';
  presentation: 'cephalic' | 'breech' | 'shoulder' | 'face' | 'compound';
  position: string;
  engagement: 'engaged' | 'not_engaged' | 'fixed';
  fetalHeartRate: number;
  contractions: string;
  amnioticFluid: string;
}

export interface ObstetricExamination {
  leopold: LeopoldManeuver;
  fundalHeight: number; // cm
  abdominalGirth: number; // cm
  scarInspection: string;
  uterineActivity: string;
  pelvicExamination: string;
}

export interface HistoryState {
  encounterId: string;
  biodata: Biodata;
  chiefComplaints: ChiefComplaint[];
  timeline: TimelineEvent[];
  hpi: Record<SymptomId, HpiEntry>;
  featureRegistry: FeatureRegistry;
  pastHistory: PastHistory;
  birthHistory: BirthHistory;
  immunizationHistory: ImmunizationHistory;
  growthDevelopment: GrowthDevelopment;
  nutritionHistory: NutritionHistory;
  familySocial: FamilySocial;
  obstetricHistory: ObstetricHistory;
  gynecologicHistory: GynecologicHistory;
  ros: RosFindings;
  impactOnLife: ImpactOnLife;
  redFlags: RedFlag[];
  ddx: DdxResult;
  generalExamination: GeneralExamination;
  obstetricExamination: ObstetricExamination | null;
  newbornExamination: NewbornExamination | null;
  systemExaminations: SystemExaminations;
  localExaminations: LocalExaminations;
  clinicalReasoning: ClinicalReasoningArray;
  provisionalDiagnosis: ProvisionalDiagnosis | null;
  differentialWithReasoning: DifferentialWithReasoning[];
  investigationPlan: InvestigationPlan;
  investigationInterpretation: InvestigationInterpretation;
  treatmentPlan: TreatmentPlan;
  monitoringPlan: MonitoringPlan;
  documents: GeneratedDocuments;
  activeSection: string;
  completedSections: string[];
  confirmedSymptoms: string[];
  globalAnswers: GlobalAnswers;
}
