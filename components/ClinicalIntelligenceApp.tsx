'use client';

import { useState, useMemo, useCallback, useRef, useEffect, memo } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1: THEME CSS
// ═══════════════════════════════════════════════════════════════════════════════

const THEME_STYLES = `
:root {
  --bg-page: #eff6ff;
  --bg-card: #ffffff;
  --bg-card-hover: #f8fafc;
  --bg-sidebar: #ffffff;
  --bg-sidebar-item: #f1f5f9;
  --bg-sidebar-item-active: #2563eb;
  --bg-sidebar-item-hover: #e2e8f0;
  --bg-input: #ffffff;
  --bg-input-disabled: #f1f5f9;
  --bg-badge: #eff6ff;
  --bg-danger: #fef2f2;
  --bg-success: #f0fdf4;
  --bg-warning: #fffbeb;
  --bg-info: #eff6ff;
  --border-card: #e2e8f0;
  --border-input: #cbd5e1;
  --border-focus: #3b82f6;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-tertiary: #94a3b8;
  --text-inverse: #ffffff;
  --text-accent: #2563eb;
  --text-danger: #dc2626;
  --text-success: #16a34a;
  --text-warning: #d97706;
  --shadow-card: 0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04);
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 18px;
  --accent: #2563eb;
  --accent-light: #dbeafe;
  --accent-dark: #1d4ed8;
  --scrollbar-track: #f1f5f9;
  --scrollbar-thumb: #94a3b8;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
.dark {
  --bg-page: #0f172a;
  --bg-card: #1e293b;
  --bg-card-hover: #334155;
  --bg-sidebar: #1e293b;
  --bg-sidebar-item: #334155;
  --bg-sidebar-item-active: #3b82f6;
  --bg-sidebar-item-hover: #475569;
  --bg-input: #334155;
  --bg-input-disabled: #1e293b;
  --bg-badge: #1e3a5f;
  --bg-danger: #450a0a;
  --bg-success: #052e16;
  --bg-warning: #451a03;
  --bg-info: #172554;
  --border-card: #334155;
  --border-input: #475569;
  --border-focus: #60a5fa;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-tertiary: #64748b;
  --text-inverse: #0f172a;
  --text-accent: #60a5fa;
  --text-danger: #fca5a5;
  --text-success: #86efac;
  --text-warning: #fcd34d;
  --shadow-card: 0 1px 3px 0 rgba(0,0,0,0.3);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.4);
  --accent: #3b82f6;
  --accent-light: #1e3a5f;
  --accent-dark: #60a5fa;
  --scrollbar-track: #1e293b;
  --scrollbar-thumb: #475569;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg-page);color:var(--text-primary);-webkit-font-smoothing:antialiased}
::-webkit-scrollbar{width:6px;height:6px}
::-webkit-scrollbar-track{background:var(--scrollbar-track)}
::-webkit-scrollbar-thumb{background:var(--scrollbar-thumb);border-radius:3px}
::selection{background:var(--accent-light);color:var(--text-primary)}
`;

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2: TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface HpiData {
  onsetType: string; progression: string; severity: string;
  site: string; character: string; radiation: string; associated: string; timeCourse: string; exacerbating: string; relieving: string;
  coughChar: string; coughDuration: string; nocturnalCough: boolean; exerciseTriggered: boolean; allergenTrigger: boolean;
  feverPattern: string; highFever: boolean; feverDuration: string; feverOnset: string;
  wheeze: boolean; wheezePattern: string; unilateralWheeze: boolean;
  stridor: boolean; stridorType: string;
  chestIndrawing: boolean; grunting: boolean; nasalFlaring: boolean; headBobbing: boolean; feedingDiff: boolean;
  nightSweats: boolean; weightLoss: boolean; tbContact: boolean; sickContact: boolean; sickContactDetail: string;
  suddenOnset: boolean; drooling: boolean; tripodPosition: boolean; hepatomegalyReported: boolean;
  prevTx: string; txResponse: string;
  exposureCovid: boolean; exposureCovidDetail: string;
  urineOutput: string; seizureHPI: boolean; vomitingHPI: boolean; diarrheaHPI: boolean; rashHPI: string;
  pertussisContact: boolean; postTussiveVomiting: boolean; cyanoticEpisodes: boolean;
  allergenExposure: boolean; urticaria: boolean; angioedema: boolean;
  feedingCough: boolean; heartburnRegurg: boolean;
  sweatingFeeds: boolean; orthopnea: boolean; pnd: boolean;
  hoarseness: boolean; pleuriticPain: boolean;
  recentURTI: boolean; coryzaProdrome: boolean;
}

interface PmhData {
  prevAdmissions: boolean; prevAdmDetail: string; chronicIllnesses: string[];
  allergies: string; medications: string; prevSurgeries: boolean; surgeryDetail: string;
  prevWheeze: boolean; asthmaDx: boolean; recurrentChest: boolean; cardiacDisease: boolean;
  hiv: boolean; sickleCellDisease: boolean; epilepsyDx: boolean; immunodeficiencyDx: boolean;
  cysticFibrosisDx: boolean; diabetesDx: boolean; downSyndromeDx: boolean;
}

interface BirthData {
  birthPlace: string; gestAge: string; gestAgeWeeks: string; deliveryMode: string;
  birthWeight: string; apgar: string; neonatalComplications: string[]; neonatalDetail: string;
  nicuAdmission: boolean; nicuDuration: string;
}

interface DevelopmentData {
  grossMotor: string; grossMotorDetail: string;
  fineMotor: string; fineMotorDetail: string;
  speech: string; speechDetail: string;
  social: string; socialDetail: string;
  concerns: string;
}

interface ImmunizationData {
  status: string; missedVaccines: string[]; adverseReactions: boolean; adverseDetail: string;
}

interface NutritionData {
  breastfed: string; bfDuration: string; exclusiveDuration: string;
  complementaryAge: string; dietaryDiversity: string;
  appetite: string; muac: string; weightCentile: string; heightCentile: string;
  malnutritionSigns: string[];
}

interface AncData {
  ancVisits: string; ancMonth: string; placeDelivery: string; ttStatus: string;
  hivTesting: boolean; hivResult: string; pmtct: boolean;
  syphilisTest: boolean; syphilisResult: string;
  malariaProphylaxis: boolean; spDoses: string; ironFolate: boolean; deworming: boolean;
  preEclampsia: boolean; gestationalDM: boolean; antepartumHaemorrhage: boolean; hptnPregnancy: boolean;
  rhesusStatus: string; spinaBifidaRx: boolean;
  fetalMovements: string; presentation: string; liquorVolume: string;
  cordProlapse: boolean; prolongedLabour: boolean; maternalFever: boolean; meconiumStained: boolean;
  maternalComplications: string;
}

interface FamilyData {
  tbHousehold: boolean; asthmaFamily: boolean; atopyFamily: boolean; sickleCellFamily: boolean;
  epilepsyFamily: boolean; geneticDiseases: string; similarIllnessSiblings: boolean;
  housingConditions: string; housingDetail: string;
  waterSource: string; sanitation: string;
  parentOccupation: string; smokingExposure: boolean; smokeDetail: string;
  schoolAttendance: string; schoolLevel: string;
}

interface RosData {
  seizures: boolean; headache: boolean; lethargyRos: boolean; consciousness: string;
  dizziness: boolean; syncope: boolean;
  cyanosisRos: boolean; peripheralEdema: boolean; fatigue: boolean; palpitations: boolean;
  vomiting: boolean; diarrhea: boolean; abdominalPain: boolean; hepatomegaly: boolean; constipation: boolean;
  reducedUrine: boolean; dysuria: boolean; hematuria: boolean;
  rash: boolean; rashType: string; jaundice: boolean; pallor: boolean; clubbing: boolean; bruising: boolean; petechiae: boolean;
  earPain: boolean; earDischarge: boolean; soreThroatRos: boolean; nasalDischargeRos: boolean; hearingLoss: boolean;
}

interface VitalsData {
  temp: string; hr: string; rr: string; spo2: string; bp: string; bpSystolic: string; bpDiastolic: string;
  weight: string; height: string; muac: string; hc: string;
  hydration: string; generalCondition: string; avpu: string;
  lymphNodes: string; lymphNodeSite: string;
  pallorExam: boolean; jaundiceExam: boolean; cyanosisExam: boolean; clubbingExam: boolean; edemaExam: boolean;
  examIndrawing: boolean; examNasalFlaring: boolean; examGrunting: boolean; examStridor: boolean;
  examWheeze: boolean; examCrackles: boolean; examReducedBS: boolean; examBronchial: boolean;
  examDullness: boolean; examHyperResonance: boolean; examTrachealDeviation: boolean;
}

interface ExamRespData {
  inspection: string; trachea: string; expansion: string; percussion: string; auscultation: string;
  addedSounds: string; bronchialBreathing: boolean; pleuralRub: boolean; vocalResonance: string;
}

interface ExamCVSData {
  inspection: string; palpation: string; apexBeat: string; thrills: boolean; auscultation: string;
  murmur: string; murmurGrade: string; gallop: boolean; pericardialRub: boolean; peripheralPulses: string;
  capillaryRefill: string; jvp: string; hepatomegaly: boolean;
}

interface ExamAbdData {
  inspection: string; palpation: string; tenderness: string; guarding: boolean; mass: boolean; massDetail: string;
  liver: string; spleen: string; ascites: boolean; shiftingDullness: boolean; bowelSounds: string;
}

interface ExamCNSData {
  mentalState: string; gcs: string; pupils: string; cranialNerves: string; motorPower: string;
  tone: string; reflexes: string; sensation: string; cerebellar: string; meningism: boolean;
  fundoscopy: string;
}

interface SummaryData {
  clinicalSummary: string; mostLikelyDx: string; ddxList: string[]; ddxDiscussion: string;
  severityAssessment: string; triagePriority: string;
}

interface ManagementData {
  investigations: string[]; invNotes: string; diagnosisConfirmed: string;
  medications: { drug: string; dose: string; route: string; freq: string; duration: string }[];
  managementNotes: string; monitoring: string; healthEducation: string;
  dischargePlan: string; followUp: string; referral: string;
}

interface DiseaseScoreItem {
  id: string; name: string; abbr: string; score: number; pct: number; color: string;
}

interface DrugDose {
  drug: string; route: string; dose: (wt: number, ageMo: number) => string; freq: string; note: string;
}

interface DdxRule {
  disease: string; supports: string[]; rulesOut: string[]; keyInvestigation: string[];
}

interface PhaseConfig {
  id: string; label: string; icon: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3: REFERENCE DATA
// ═══════════════════════════════════════════════════════════════════════════════

const AGE_BANDS = [
  { label:'Newborn (0-28d)',     min:0,  max:0.9,   hrMin:100, hrMax:160, rrMin:30, rrMax:60,  sbpMin:60, sbpMax:90,  dbpMin:30, dbpMax:60,  hcP50:35,  wtP50:3.3,  htP50:50  },
  { label:'Infant (1-12mo)',     min:1,  max:11.9,  hrMin:100, hrMax:150, rrMin:30, rrMax:50,  sbpMin:80, sbpMax:100, dbpMin:50, dbpMax:65,  hcP50:46,  wtP50:9,    htP50:75  },
  { label:'Toddler (1-3yr)',     min:12, max:35.9,  hrMin:90,  hrMax:140, rrMin:24, rrMax:40,  sbpMin:90, sbpMax:105, dbpMin:55, dbpMax:70,  hcP50:49,  wtP50:13,   htP50:87  },
  { label:'Preschool (3-5yr)',   min:36, max:59.9,  hrMin:80,  hrMax:120, rrMin:22, rrMax:34,  sbpMin:90, sbpMax:110, dbpMin:60, dbpMax:75,  hcP50:50,  wtP50:17,   htP50:108 },
  { label:'School (6-12yr)',     min:72, max:143.9, hrMin:70,  hrMax:110, rrMin:18, rrMax:30,  sbpMin:95, sbpMax:120, dbpMin:60, dbpMax:75,  hcP50:54,  wtP50:30,   htP50:140 },
  { label:'Adolescent (13-18yr)',min:144,max:215.9, hrMin:60,  hrMax:100, rrMin:12, rrMax:20,  sbpMin:110,sbpMax:135, dbpMin:65, dbpMax:85,  hcP50:56,  wtP50:55,   htP50:165 },
];

const MILESTONES = [
  { age:'6 wk',    label:'Social smile, follows moving person' },
  { age:'4 mo',    label:'Head control, laughs, reaches for objects' },
  { age:'5 mo',    label:'Sits with support, rolls over' },
  { age:'6 mo',    label:'Teeth begin to erupt, transfers objects' },
  { age:'7 mo',    label:'Sits without support' },
  { age:'9-10 mo', label:'Crawls, pulls to stand, babbles' },
  { age:'10-12 mo',label:'Stands unsupported, pincer grasp, says mama/dada specific' },
  { age:'13 mo',   label:'Walks independently' },
  { age:'15 mo',   label:'Scribbles, 3-6 words' },
  { age:'18 mo',   label:'Runs stiffly, 10-20 words, follows commands' },
  { age:'2 yr',    label:'2-word phrases, climbs stairs, toilet training begins' },
  { age:'2.5 yr',  label:'Toilet training complete, knows name/age' },
  { age:'3 yr',    label:'3-4 word sentences, rides tricycle, draws circle' },
  { age:'4 yr',    label:'Hops on one foot, draws person, cooperative play' },
  { age:'5 yr',    label:'Hops, counts 1-10, dresses independently, speaks clearly' },
];

const DISEASES = [
  { id: 'pneumonia',       name: 'Pneumonia',              abbr: 'PNA'  },
  { id: 'asthma',          name: 'Asthma',                 abbr: 'AST'  },
  { id: 'bronchiolitis',   name: 'Bronchiolitis',          abbr: 'BRL'  },
  { id: 'tuberculosis',    name: 'Tuberculosis',           abbr: 'TB'   },
  { id: 'urti',            name: 'Viral URTI',             abbr: 'URI'  },
  { id: 'croup',           name: 'Croup',                  abbr: 'CRP'  },
  { id: 'foreign_body',    name: 'Foreign Body Aspiration',abbr: 'FBA'  },
  { id: 'pleural_effusion',name: 'Pleural Effusion',       abbr: 'PLE'  },
  { id: 'chf',             name: 'CHF / Cardiac',          abbr: 'CHF'  },
  { id: 'epiglottitis',    name: 'Epiglottitis',           abbr: 'EPI'  },
  { id: 'bronchiectasis',  name: 'Bronchiectasis',         abbr: 'BNX'  },
  { id: 'empyema',         name: 'Empyema',                abbr: 'EMP'  },
  { id: 'anaphylaxis',     name: 'Anaphylaxis',            abbr: 'ANA'  },
  { id: 'retropharyngeal', name: 'Retropharyngeal Abscess',abbr: 'RPA'  },
  { id: 'allergic_rhinitis',name: 'Allergic Rhinitis',     abbr: 'ALR'  },
  { id: 'sinusitis',       name: 'Acute Sinusitis',        abbr: 'SIN'  },
  { id: 'pneumothorax',    name: 'Pneumothorax',           abbr: 'PTX'  },
];

const DC = ['#ef4444','#3b82f6','#10b981','#f59e0b','#6b7280','#ec4899','#8b5cf6','#14b8a6','#f97316','#dc2626','#84cc11','#a855f7','#e11d48','#0ea5e9','#6366f1','#d946ef','#059669'];
