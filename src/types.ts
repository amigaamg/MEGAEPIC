export interface Biodata {
  patientName: string;
  ageMonths: string;
  sex: string;
  dob: string;
  residence: string;
  informant: string;
  informantRelation: string;
  histReliability: string;
  dateOfAdmission: string;
  sourceOfReferral: string;
}

export interface ComplaintDuration {
  [complaintId: string]: string;
}

export interface HPI {
  onsetType: string;
  progression: string;
  severity: string;
  site: string;
  character: string;
  radiation: string;
  associated: string;
  timeCourse: string;
  exacerbating: string;
  relieving: string;
  coughChar: string;
  coughDuration: string;
  nocturnalCough: boolean | undefined;
  exerciseTriggered: boolean | undefined;
  allergenTrigger: boolean | undefined;
  feverPattern: string;
  highFever: boolean;
  feverDuration: string;
  wheeze: boolean;
  wheezePattern: string;
  unilateralWheeze: boolean;
  stridor: boolean;
  stridorType: string;
  chestIndrawing: boolean;
  grunting: boolean;
  nasalFlaring: boolean;
  headBobbing: boolean;
  feedingDiff: boolean | undefined;
  nightSweats: boolean | undefined;
  weightLoss: boolean | undefined;
  tbContact: boolean | undefined;
  sickContact: boolean;
  sickContactDetail: string;
  suddenOnset: boolean | undefined;
  drooling: boolean | undefined;
  tripodPosition: boolean | undefined;
  hepatomegalyReported: boolean;
  prevTx: string;
  txResponse: string;
  seizureHPI: boolean;
  irritability: boolean;
  vomitingHPI: boolean;
  diarrheaHPI: boolean;
  pertussisContact: boolean;
  postTussiveVomiting: boolean | undefined;
  cyanoticEpisodes: boolean | undefined;
  allergenExposure: boolean;
  urticaria: boolean;
  angioedema: boolean;
  feedingCough: boolean;
  heartburnRegurg: boolean;
  sweatingFeeds: boolean | undefined;
  orthopnea: boolean;
  pnd: boolean;
  hoarseness: boolean;
  pleuriticPain: boolean;
  recentURTI: boolean;
  impactNote: string;

  // ── Per-symptom free-text (dedicated, avoid sickContactDetail conflicts) ──
  sputumDetail: string;        // Cough card — sputum description
  hemoptysisDetail: string;    // Hemoptysis card — bleeding description
  noisyBreathingDetail: string; // Noisy Breathing card — sound description
  rashDetail: string;          // Rash card — description
  sweatDetail: string;         // Night Sweats card — description
  weightLossDetail: string;    // Weight Loss card — description
  lethargyDetail: string;      // Lethargy card — activity change description
  feedingDetail: string;       // Reduced Feeding card — description

  // ── Expanded SOCRATES fields ────────────────────────────────────
  diurnalVariation: string;       // 'morning' | 'night' | 'constant' | ''
  symptomPattern: string;         // 'constant' | 'intermittent' | 'episodic' | 'paroxysmal' | ''
  symptomSeverity: string;        // 'mild' | 'moderate' | 'severe' | ''
  feverMeasuredTemp: string;      // free text measured temperature
  feverProgression: string;       // 'worsening' | 'improving' | 'fluctuating' | ''
  coughSeverity: string;          // 'mild' | 'moderate' | 'severe' | ''
  dyspneaPattern: string;         // 'constant' | 'episodic' | 'progressive' | ''
  wheezeSeverity: string;         // 'mild' | 'moderate' | 'severe' | ''
  wheezeDiurnal: string;          // 'morning' | 'night' | 'constant' | ''
  chestPainSeverity: string;      // 'mild' | 'moderate' | 'severe' | ''
  stridorSeverity: string;        // 'mild' | 'moderate' | 'severe' | ''
  nasalDischargeColor: string;    // 'clear' | 'purulent' | 'bloody' | ''
  cyanosisContext: string;        // 'crying' | 'feeding' | 'coughing' | 'rest' | ''
  cyanosisLocation: string;       // 'perioral' | 'acral' | 'generalised' | ''
  lethargyDegree: string;         // 'mild' | 'moderate' | 'severe' | ''
  abdominalPainSeverity: string;  // 'mild' | 'moderate' | 'severe' | ''
  earPainSeverity: string;        // 'mild' | 'moderate' | 'severe' | ''
}

export interface PMH {
  prevAdmissions: boolean;
  prevAdmDetail: string;
  chronicIllnesses: string[];
  allergies: string;
  medications: string;
  prevSurgeries: boolean;
  surgeryDetail: string;
  prevWheeze: boolean;
  asthmaDx: boolean;
  recurrentChest: boolean;
  cardiacDisease: boolean;
  hiv: boolean;
  sickleCellDisease: boolean;
  immunodeficiencyDx: boolean;
  cysticFibrosisDx: boolean;
  diabetesDx: boolean;
}

export interface Birth {
  birthPlace: string;
  gestAge: string;
  gestAgeWeeks: string;
  deliveryMode: string;
  birthWeight: string;
  apgar: string;
  neonatalComplications: string[];
  neonatalDetail: string;
  nicuAdmission: boolean;
  nicuDuration: string;
}

export interface Development {
  grossMotor: string;
  fineMotor: string;
  speech: string;
  social: string;
  concerns: string;
}

export interface Immunization {
  status: string;
  missedVaccines: string[];
  adverseReactions: boolean;
  adverseDetail: string;
}

export interface Nutrition {
  breastfed: string;
  bfDuration: string;
  complementaryAge: string;
  dietaryDiversity: string;
  appetite: string;
  muac: string;
  malnutritionSigns: string[];
}

export interface ANC {
  ancVisits: string;
  hivTesting: boolean;
  hivResult: string;
  pmtct: boolean;
  malariaProphylaxis: boolean;
  ironFolate: boolean;
  preEclampsia: boolean;
  gestationalDM: boolean;
  antepartumHaemorrhage: boolean;
  cordProlapse: boolean;
  prolongedLabour: boolean;
  maternalFever: boolean;
  meconiumStained: boolean;
}

export interface Family {
  tbHousehold: boolean;
  asthmaFamily: boolean;
  atopyFamily: boolean;
  sickleCellFamily: boolean;
  geneticDiseases: string;
  similarIllnessSiblings: boolean;
  housingConditions: string;
  waterSource: string;
  sanitation: string;
  parentOccupation: string;
  smokingExposure: boolean;
  smokeDetail: string;
  schoolAttendance: string;
}

export interface ROS {
  seizures: boolean;
  headache: boolean;
  lethargyRos: boolean;
  dizziness: boolean;
  syncope: boolean;
  cyanosisRos: boolean;
  peripheralEdema: boolean;
  fatigue: boolean;
  palpitations: boolean;
  vomiting: boolean;
  diarrhea: boolean;
  abdominalPain: boolean;
  hepatomegaly: boolean;
  constipation: boolean;
  reducedUrine: boolean;
  dysuria: boolean;
  hematuria: boolean;
  rash: boolean;
  rashType: string;
  jaundice: boolean;
  pallor: boolean;
  clubbing: boolean;
  bruising: boolean;
  petechiae: boolean;
  earPain: boolean;
  earDischarge: boolean;
  soreThroatRos: boolean;
  nasalDischargeRos: boolean;
  hearingLoss: boolean;
}

export interface Vitals {
  temp: string;
  hr: string;
  rr: string;
  spo2: string;
  bp: string;
  bpSystolic: string;
  bpDiastolic: string;
  weight: string;
  height: string;
  muac: string;
  hc: string;
  hydration: string;
  generalCondition: string;
  avpu: string;
  lymphNodes: string;
  lymphNodeSite: string;
  pallorExam: boolean;
  jaundiceExam: boolean;
  cyanosisExam: boolean;
  clubbingExam: boolean;
  edemaExam: boolean;
  examIndrawing: boolean;
  examNasalFlaring: boolean;
  examGrunting: boolean;
  examStridor: boolean;
  examWheeze: boolean;
  examCrackles: boolean;
  examReducedBS: boolean;
  examBronchial: boolean;
  examDullness: boolean;
  examHyperResonance: boolean;
  examTrachealDeviation: boolean;
  examHeartSounds: string;
  examMurmur: string;
  examMurmurGrade: string;
  examAbdDistension: boolean;
  examHepatomegaly: boolean;
  examSplenomegaly: boolean;
  examTenderness: string;
  examCnsTone: string;
  examCnsReflexes: string;
  examFontanelle: string;
  examNeckStiffness: boolean;
  examJointSwelling: boolean;
  examMuscleWasting: boolean;
  examSkinRash: string;
  examSkinBruising: boolean;
  examSkinPetechiae: boolean;
  chestShape: string;
  airEntry: string;
  capRefill: string;
  examConsciousLevel: string;
}

export interface Summary {
  ddxNotes: string;
  workingDx: string;
}

export interface Management {
  investigations: string[];
  admission: string;
  respSupport: string;
  ivFluids: boolean;
  antipyretics: boolean;
  nutritionSupport: boolean;
  antibiotics: boolean;
  inhalers: boolean;
  steroids: boolean;
  antivirals: boolean;
  admissionCriteria: string;
  reviewInterval: string;
  otherTests: string;
  medDetail: string;
  monitoring: string;
  followUp: string;
  healthEd: string;
}

export type Symptom =
  | 'cough' | 'fever' | 'wheeze' | 'difficulty_breathing'
  | 'hemoptysis' | 'cyanosis' | 'stridor' | 'chest_pain'
  | 'noisy_breathing' | 'reduced_feeding' | 'lethargy';

export type DiseaseId =
  | 'pneumonia' | 'asthma' | 'bronchiolitis' | 'tb'
  | 'urti' | 'croup' | 'pleural_effusion' | 'pneumothorax' | 'foreign_body_aspiration';

export type Severity = 'mild' | 'moderate' | 'severe' | 'critical';

export interface DiseaseScore {
  diseaseId: DiseaseId;
  name: string;
  score: number;
  confidence: 'low' | 'medium' | 'high';
}

export interface SeverityResult {
  level: Severity;
  redFlags: string[];
  action: string;
}

export interface ClinicalNote {
  hpi: string;
  differentials: DiseaseScore[];
  severity: SeverityResult;
  investigations: string[];
  management: string[];
  summary: string;
  timestamp: Date;
}

export interface DiseaseProfile {
  id: DiseaseId;
  name: string;
  supportingSymptoms: Symptom[];
  againstSymptoms: Symptom[];
  redFlags: string[];
  investigations: string[];
  differentials: DiseaseId[];
}

export interface SymptomWeight {
  diseaseId: DiseaseId;
  symptomKey: string;
  weight: number;
}

export interface ConsultationContext {
  patientName?: string;
  age?: number;
  sex?: 'male' | 'female';
  symptoms: Symptom[];
  answers: Record<string, string | string[] | boolean>;
  askedQuestions: string[];
  vitals: {
    spo2?: number;
    rr?: number;
    hr?: number;
    temp?: number;
    weight?: number;
  };
}

export interface InvestigationRule {
  diseaseId: DiseaseId;
  investigations: {
    name: string;
    rationale: string;
    priority: 'urgent' | 'routine' | 'if_uncertain';
  }[];
}

export interface TreatmentRule {
  diseaseId: DiseaseId;
  severity: Severity | 'all';
  interventions: {
    name: string;
    detail: string;
    condition?: string;
  }[];
}

export interface QuestionNode {
  id: string;
  text: string;
  type: 'single' | 'multi' | 'number' | 'boolean';
  options?: string[];
  triggerSymptoms?: Symptom[];
  next?: Record<string, string>;
}

export interface PatientForm {
  biodata: Biodata;
  complaints: string[];
  complaintDurations: Record<string, string>;
  hpi: HPI;
  pmh: PMH;
  birth: Birth;
  development: Development;
  immunization: Immunization;
  nutrition: Nutrition;
  anc: ANC;
  family: Family;
  ros: ROS;
  vitals: Vitals;
  summary: { ddxNotes: string; workingDx: string };
  management: Management;
}

export interface Prescription {
  drugName: string;
  doseComputed: string;       // e.g. "450 mg"
  doseRaw: string;            // e.g. "40-45 mg/kg/dose"
  route: string;
  frequency: string;
  duration: string;
  indication: string;
  notes: string;
  drugClass?: string;
  weightUsed?: number;        // patient weight used for calculation
  maxCapped?: boolean;        // true if max-dose cap was applied
  maxCappedDetail?: string;   // e.g. "capped at 2000 mg (adult max)"
}

export interface ManagementPlan {
  diagnosisSpecific: {
    diseaseName: string;
    severity?: string;
    steps: string[];
    prescriptions?: Prescription[];
  }[];
  investigations: string[];
  supportiveCare: string[];
  monitoring: string;
  followUp: string;
  safetyNetting: string;
  healthEducation: string;
}

export const INIT_FORM: PatientForm = {
  biodata:{
    patientName:"", ageMonths:"", sex:"", dob:"", residence:"",
    informant:"", informantRelation:"", histReliability:"", dateOfAdmission:"", sourceOfReferral:"",
  },
  complaints:[], complaintDurations:{},
  hpi:{
    onsetType:"", progression:"", severity:"", site:"", character:"", radiation:"",
    associated:"", timeCourse:"", exacerbating:"", relieving:"",
    coughChar:"", coughDuration:"", nocturnalCough:undefined, exerciseTriggered:undefined, allergenTrigger:undefined,
    feverPattern:"", highFever:false, feverDuration:"",
    wheeze:false, wheezePattern:"", unilateralWheeze:false,
    stridor:false, stridorType:"",
    chestIndrawing:false, grunting:false, nasalFlaring:false, headBobbing:false, feedingDiff:undefined,
    nightSweats:undefined, weightLoss:undefined, tbContact:undefined, sickContact:false, sickContactDetail:"",
    suddenOnset:undefined, drooling:undefined, tripodPosition:undefined, hepatomegalyReported:false,
    prevTx:"", txResponse:"",
    seizureHPI:false, irritability:false, vomitingHPI:false, diarrheaHPI:false,
    pertussisContact:false, postTussiveVomiting:undefined, cyanoticEpisodes:undefined,
    allergenExposure:false, urticaria:false, angioedema:false,
    feedingCough:false, heartburnRegurg:false,
    sweatingFeeds:undefined, orthopnea:false, pnd:false,
    hoarseness:false, pleuriticPain:false, recentURTI:false, impactNote:"",

    // Per-symptom free-text defaults
    sputumDetail:"", hemoptysisDetail:"", noisyBreathingDetail:"", rashDetail:"",
    sweatDetail:"", weightLossDetail:"", lethargyDetail:"", feedingDetail:"",

    // Expanded SOCRATES defaults
    diurnalVariation:"", symptomPattern:"", symptomSeverity:"",
    feverMeasuredTemp:"", feverProgression:"",
    coughSeverity:"", dyspneaPattern:"",
    wheezeSeverity:"", wheezeDiurnal:"",
    chestPainSeverity:"", stridorSeverity:"",
    nasalDischargeColor:"", cyanosisContext:"", cyanosisLocation:"",
    lethargyDegree:"", abdominalPainSeverity:"", earPainSeverity:"",
  },
  pmh:{
    prevAdmissions:false, prevAdmDetail:"", chronicIllnesses:[], allergies:"", medications:"",
    prevSurgeries:false, surgeryDetail:"", prevWheeze:false, asthmaDx:false,
    recurrentChest:false, cardiacDisease:false, hiv:false, sickleCellDisease:false,
    immunodeficiencyDx:false, cysticFibrosisDx:false, diabetesDx:false,
  },
  birth:{
    birthPlace:"", gestAge:"", gestAgeWeeks:"", deliveryMode:"", birthWeight:"",
    apgar:"", neonatalComplications:[], neonatalDetail:"", nicuAdmission:false, nicuDuration:"",
  },
  development:{ grossMotor:"", fineMotor:"", speech:"", social:"", concerns:"" },
  immunization:{ status:"", missedVaccines:[], adverseReactions:false, adverseDetail:"" },
  nutrition:{
    breastfed:"", bfDuration:"", complementaryAge:"", dietaryDiversity:"", appetite:"",
    muac:"", malnutritionSigns:[],
  },
  anc:{
    ancVisits:"", hivTesting:false, hivResult:"", pmtct:false,
    malariaProphylaxis:false, ironFolate:false, preEclampsia:false,
    gestationalDM:false, antepartumHaemorrhage:false, cordProlapse:false,
    prolongedLabour:false, maternalFever:false, meconiumStained:false,
  },
  family:{
    tbHousehold:false, asthmaFamily:false, atopyFamily:false, sickleCellFamily:false,
    geneticDiseases:"", similarIllnessSiblings:false,
    housingConditions:"", waterSource:"", sanitation:"", parentOccupation:"",
    smokingExposure:false, smokeDetail:"", schoolAttendance:"",
  },
  ros:{
    seizures:false, headache:false, lethargyRos:false, dizziness:false, syncope:false,
    cyanosisRos:false, peripheralEdema:false, fatigue:false, palpitations:false,
    vomiting:false, diarrhea:false, abdominalPain:false, hepatomegaly:false, constipation:false,
    reducedUrine:false, dysuria:false, hematuria:false,
    rash:false, rashType:"", jaundice:false, pallor:false, clubbing:false, bruising:false, petechiae:false,
    earPain:false, earDischarge:false, soreThroatRos:false, nasalDischargeRos:false, hearingLoss:false,
  },
  vitals:{
    temp:"", hr:"", rr:"", spo2:"", bp:"", bpSystolic:"", bpDiastolic:"",
    weight:"", height:"", muac:"", hc:"", hydration:"", generalCondition:"", avpu:"",
    lymphNodes:"", lymphNodeSite:"",
    pallorExam:false, jaundiceExam:false, cyanosisExam:false, clubbingExam:false, edemaExam:false,
    examIndrawing:false, examNasalFlaring:false, examGrunting:false, examStridor:false,
    examWheeze:false, examCrackles:false, examReducedBS:false, examBronchial:false,
    examDullness:false, examHyperResonance:false, examTrachealDeviation:false,
    examHeartSounds:"", examMurmur:"", examMurmurGrade:"",
    examAbdDistension:false, examHepatomegaly:false, examSplenomegaly:false, examTenderness:"",
    examCnsTone:"", examCnsReflexes:"", examFontanelle:"", examNeckStiffness:false,
    examJointSwelling:false, examMuscleWasting:false,
    chestShape:"", airEntry:"", capRefill:"", examConsciousLevel:"",
    examSkinRash:"", examSkinBruising:false, examSkinPetechiae:false,
  },
  summary:{ ddxNotes:"", workingDx:"" },
  management:{
    investigations:[], admission:"", respSupport:"", ivFluids:false,
    antipyretics:false, nutritionSupport:false, antibiotics:false, inhalers:false,
    steroids:false, antivirals:false, admissionCriteria:"", reviewInterval:"",
    otherTests:"", medDetail:"", monitoring:"", followUp:"", healthEd:"",
  },
};
