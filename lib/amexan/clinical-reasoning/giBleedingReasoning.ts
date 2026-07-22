// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN GI Bleeding Clinical Reasoning Rules
// Comprehensive differential diagnosis based on SOCRATES logic, biodata,
// bleeding site classification, and hemodynamic assessment.
// Hemetemesis/Melena/Hematochezia → Source localization + severity triage.
// ═══════════════════════════════════════════════════════════════════════════════

import type { EncounterBrainState, InformationGap, DiseaseState } from '../encounter-brain/types';
import { FEATURES } from '../knowbase/features/featureLibrary';

// ── Bleeding type classification ───────────────────────────────────────

type BleedingType = 'hematemesis' | 'melena' | 'hematochezia' | 'occult' | 'mixed';
type BleedingSource = 'upper_gi' | 'small_bowel' | 'colonic' | 'rectal' | 'unknown';

interface GiBleedingDisease {
  diseaseId: string;
  diseaseName: string;
  icdCode: string;
  bleedingTypes: BleedingType[];
  source: BleedingSource;
  typicalOnset: 'acute_massive' | 'acute_self_limited' | 'chronic_occult' | 'intermittent';
  hemodynamicInstability: 'common' | 'occasional' | 'rare';
  ageRange: [number, number];
  agePeak: [number, number];
  sexPredilection: 'none' | 'male' | 'female';
  backgroundPrevalence: number;
  riskFactors: string[];
  redFlags: string[];
  painPattern: 'painless' | 'epigastric_pain' | 'abdominal_pain' | 'dysphagia' | 'colicky_pain' | 'rectal_pain';
  associatedSymptoms: string[];
}

interface SocratesBleedingProfile {
  color: string[];
  volume: string[];
  timing: string[];
  relation_to_pain: string[];
  relation_to_food: string[];
  relation_to_nsaid: string[];
  associated_symptoms: string[];
  risk_context: string[];
}

interface BleedingPatternRule {
  id: string;
  label: string;
  description: string;
  pattern: string[];
  suggests: string[];
  rulesOut: string[];
  priorityBoost: number;
}

// ── Comprehensive GI bleeding differentials ────────────────────────────

const GI_BLEEDING_DDX: GiBleedingDisease[] = [
  // ── Upper GI Source ──────────────────────────────────────────────────

  // Esophageal
  {
    diseaseId: 'esophageal_varices', diseaseName: 'Esophageal Variceal Hemorrhage', icdCode: 'I85.0',
    bleedingTypes: ['hematemesis', 'melena', 'mixed'],
    source: 'upper_gi',
    typicalOnset: 'acute_massive',
    hemodynamicInstability: 'common',
    ageRange: [20, 80], agePeak: [40, 65],
    sexPredilection: 'male', backgroundPrevalence: 0.005,
    riskFactors: ['portal_hypertension', 'chronic_liver_disease', 'alcohol', 'cirrhosis', 'hepatitis_c'],
    redFlags: ['hypotension', 'hematemesis_massive', 'confusion'],
    painPattern: 'painless',
    associatedSymptoms: ['ascites', 'jaundice', 'splenomegaly', 'palmar_erythema', 'spider_naevi'],
  },
  {
    diseaseId: 'mallory_weiss_syndrome', diseaseName: 'Mallory-Weiss Syndrome', icdCode: 'K22.6',
    bleedingTypes: ['hematemesis'],
    source: 'upper_gi',
    typicalOnset: 'acute_self_limited',
    hemodynamicInstability: 'rare',
    ageRange: [20, 70], agePeak: [30, 50],
    sexPredilection: 'male', backgroundPrevalence: 0.003,
    riskFactors: ['alcohol', 'vomiting', 'retching', 'violent_coughing'],
    redFlags: ['hematemesis', 'syncope'],
    painPattern: 'epigastric_pain',
    associatedSymptoms: ['vomiting', 'retching', 'epigastric_discomfort'],
  },
  {
    diseaseId: 'esophagitis_erosive', diseaseName: 'Erosive Esophagitis', icdCode: 'K21.0',
    bleedingTypes: ['hematemesis', 'occult'],
    source: 'upper_gi',
    typicalOnset: 'chronic_occult',
    hemodynamicInstability: 'rare',
    ageRange: [20, 80], agePeak: [30, 60],
    sexPredilection: 'none', backgroundPrevalence: 0.02,
    riskFactors: ['gerd', 'hiatal_hernia', 'obesity', 'pregnancy'],
    redFlags: ['dysphagia', 'hematemesis', 'weight_loss'],
    painPattern: 'epigastric_pain',
    associatedSymptoms: ['heartburn', 'regurgitation', 'dysphagia', 'odynophagia'],
  },

  // Gastric
  {
    diseaseId: 'gastric_ulcer_bleeding', diseaseName: 'Bleeding Gastric Ulcer', icdCode: 'K25.4',
    bleedingTypes: ['hematemesis', 'melena', 'mixed'],
    source: 'upper_gi',
    typicalOnset: 'acute_self_limited',
    hemodynamicInstability: 'occasional',
    ageRange: [20, 90], agePeak: [40, 70],
    sexPredilection: 'none', backgroundPrevalence: 0.02,
    riskFactors: ['nsaid', 'h_pylori', 'smoking', 'alcohol', 'steroid_use', 'anticoagulant'],
    redFlags: ['hematemesis', 'melena', 'syncope'],
    painPattern: 'epigastric_pain',
    associatedSymptoms: ['epigastric_pain', 'nausea', 'anorexia', 'weight_loss'],
  },
  {
    diseaseId: 'duodenal_ulcer_bleeding', diseaseName: 'Bleeding Duodenal Ulcer', icdCode: 'K26.4',
    bleedingTypes: ['melena', 'hematochezia', 'mixed'],
    source: 'upper_gi',
    typicalOnset: 'acute_self_limited',
    hemodynamicInstability: 'occasional',
    ageRange: [20, 80], agePeak: [30, 60],
    sexPredilection: 'male', backgroundPrevalence: 0.02,
    riskFactors: ['h_pylori', 'nsaid', 'smoking', 'alcohol'],
    redFlags: ['melena', 'hematochezia', 'syncope'],
    painPattern: 'epigastric_pain',
    associatedSymptoms: ['epigastric_pain', 'relieved_by_eating', 'nocturnal_pain'],
  },
  {
    diseaseId: 'acute_hemorrhagic_gastritis', diseaseName: 'Acute Hemorrhagic Gastritis', icdCode: 'K29.0',
    bleedingTypes: ['hematemesis', 'melena', 'mixed'],
    source: 'upper_gi',
    typicalOnset: 'acute_self_limited',
    hemodynamicInstability: 'occasional',
    ageRange: [20, 80], agePeak: [30, 70],
    sexPredilection: 'none', backgroundPrevalence: 0.01,
    riskFactors: ['nsaid', 'alcohol', 'steroid_use', 'stress', 'critical_illness'],
    redFlags: ['hematemesis', 'melena', 'hypotension'],
    painPattern: 'epigastric_pain',
    associatedSymptoms: ['nausea', 'epigastric_pain', 'anorexia'],
  },
  {
    diseaseId: 'gastric_cancer_bleeding', diseaseName: 'Gastric Cancer (Bleeding)', icdCode: 'C16',
    bleedingTypes: ['hematemesis', 'melena', 'occult'],
    source: 'upper_gi',
    typicalOnset: 'chronic_occult',
    hemodynamicInstability: 'rare',
    ageRange: [30, 90], agePeak: [50, 80],
    sexPredilection: 'male', backgroundPrevalence: 0.005,
    riskFactors: ['h_pylori', 'smoking', 'family_history_gastric_cancer', 'pernicious_anemia', 'dietary'],
    redFlags: ['weight_loss', 'dysphagia', 'hematemesis'],
    painPattern: 'epigastric_pain',
    associatedSymptoms: ['weight_loss', 'anorexia', 'early_satiety', 'dysphagia', 'nausea'],
  },
  {
    diseaseId: 'dieulafoy_lesion', diseaseName: 'Dieulafoy\'s Lesion', icdCode: 'K31.8',
    bleedingTypes: ['hematemesis', 'melena'],
    source: 'upper_gi',
    typicalOnset: 'acute_massive',
    hemodynamicInstability: 'common',
    ageRange: [40, 90], agePeak: [50, 75],
    sexPredilection: 'male', backgroundPrevalence: 0.001,
    riskFactors: ['none'],
    redFlags: ['hematemesis_massive', 'hypotension', 'syncope'],
    painPattern: 'painless',
    associatedSymptoms: ['none'],
  },

  // Duodenal
  {
    diseaseId: 'duodenal_diverticulum', diseaseName: 'Bleeding Duodenal Diverticulum', icdCode: 'K57.0',
    bleedingTypes: ['melena', 'hematochezia'],
    source: 'upper_gi',
    typicalOnset: 'acute_self_limited',
    hemodynamicInstability: 'occasional',
    ageRange: [40, 80], agePeak: [50, 70],
    sexPredilection: 'none', backgroundPrevalence: 0.001,
    riskFactors: ['diverticulosis'],
    redFlags: ['melena', 'hematochezia'],
    painPattern: 'abdominal_pain',
    associatedSymptoms: ['epigastric_discomfort', 'bloating'],
  },

  // ── Small Bowel Source ──────────────────────────────────────────────
  {
    diseaseId: 'small_bowel_angiodysplasia', diseaseName: 'Small Bowel Angiodysplasia', icdCode: 'K55.2',
    bleedingTypes: ['melena', 'hematochezia', 'occult'],
    source: 'small_bowel',
    typicalOnset: 'intermittent',
    hemodynamicInstability: 'occasional',
    ageRange: [40, 90], agePeak: [60, 85],
    sexPredilection: 'none',   backgroundPrevalence: 0.005,
    riskFactors: ['age', 'renal_failure', 'von_willebrand', 'aortic_stenosis'],
    redFlags: ['hematochezia_massive', 'hypotension'],
    painPattern: 'painless',
    associatedSymptoms: ['anemia', 'fatigue'],
  },
  {
    diseaseId: 'meckel_diverticulum_bleed', diseaseName: 'Bleeding Meckel Diverticulum', icdCode: 'Q43.0',
    bleedingTypes: ['hematochezia', 'melena'],
    source: 'small_bowel',
    typicalOnset: 'acute_self_limited',
    hemodynamicInstability: 'occasional',
    ageRange: [0, 30], agePeak: [2, 10],
    sexPredilection: 'male', backgroundPrevalence: 0.002,
    riskFactors: ['male_sex', 'age'],
    redFlags: ['hematochezia', 'melena', 'hypotension'],
    painPattern: 'painless',
    associatedSymptoms: ['abdominal_pain'],
  },
  {
    diseaseId: 'crohn_disease_bleeding', diseaseName: 'Crohn Disease (Bleeding)', icdCode: 'K50.0',
    bleedingTypes: ['hematochezia', 'occult'],
    source: 'small_bowel',
    typicalOnset: 'intermittent',
    hemodynamicInstability: 'rare',
    ageRange: [10, 50], agePeak: [15, 35],
    sexPredilection: 'none', backgroundPrevalence: 0.003,
    riskFactors: ['family_history_ibd', 'smoking', 'jewish_ancestry'],
    redFlags: ['hematochezia', 'weight_loss', 'abdominal_pain'],
    painPattern: 'abdominal_pain',
    associatedSymptoms: ['diarrhea', 'weight_loss', 'abdominal_pain', 'fever', 'perianal_fistula'],
  },
  {
    diseaseId: 'small_bowel_tumor', diseaseName: 'Small Bowel Tumor (GIST, Carcinoid, Adenocarcinoma, Lymphoma)', icdCode: 'C17',
    bleedingTypes: ['melena', 'occult', 'hematochezia'],
    source: 'small_bowel',
    typicalOnset: 'chronic_occult',
    hemodynamicInstability: 'rare',
    ageRange: [20, 80], agePeak: [40, 70],
    sexPredilection: 'none', backgroundPrevalence: 0.001,
    riskFactors: ['family_history', 'celiac_disease', 'neurofibromatosis'],
    redFlags: ['weight_loss', 'obstruction', 'hematochezia'],
    painPattern: 'abdominal_pain',
    associatedSymptoms: ['weight_loss', 'abdominal_pain', 'nausea', 'anorexia'],
  },
  {
    diseaseId: 'aortoenteric_fistula', diseaseName: 'Aortoenteric Fistula', icdCode: 'I78.0',
    bleedingTypes: ['hematemesis', 'melena', 'hematochezia'],
    source: 'small_bowel',
    typicalOnset: 'acute_massive',
    hemodynamicInstability: 'common',
    ageRange: [40, 90], agePeak: [50, 80],
    sexPredilection: 'male', backgroundPrevalence: 0.0005,
    riskFactors: ['prior_aaa_repair', 'vascular_graft', 'aaa'],
    redFlags: ['hematemesis_massive', 'hypotension', 'syncope'],
    painPattern: 'abdominal_pain',
    associatedSymptoms: ['herald_bleed', 'abdominal_pain', 'back_pain'],
  },

  // ── Colonic Source ──────────────────────────────────────────────────
  {
    diseaseId: 'colonic_angiodysplasia', diseaseName: 'Colonic Angiodysplasia', icdCode: 'K55.2',
    bleedingTypes: ['hematochezia', 'occult'],
    source: 'colonic',
    typicalOnset: 'intermittent',
    hemodynamicInstability: 'occasional',
    ageRange: [40, 90], agePeak: [60, 85],
    sexPredilection: 'none', backgroundPrevalence: 0.01,
    riskFactors: ['age', 'renal_failure', 'aortic_stenosis'],
    redFlags: ['hematochezia_massive', 'hypotension'],
    painPattern: 'painless',
    associatedSymptoms: ['none'],
  },
  {
    diseaseId: 'diverticular_bleeding', diseaseName: 'Diverticular Hemorrhage', icdCode: 'K57.3',
    bleedingTypes: ['hematochezia'],
    source: 'colonic',
    typicalOnset: 'acute_self_limited',
    hemodynamicInstability: 'occasional',
    ageRange: [40, 90], agePeak: [50, 80],
    sexPredilection: 'none', backgroundPrevalence: 0.015,
    riskFactors: ['diverticulosis', 'nsaid', 'anticoagulant', 'low_fiber_diet'],
    redFlags: ['hematochezia_massive', 'hypotension'],
    painPattern: 'painless',
    associatedSymptoms: ['abdominal_discomfort'],
  },
  {
    diseaseId: 'ischemic_colitis', diseaseName: 'Ischemic Colitis', icdCode: 'K55.0',
    bleedingTypes: ['hematochezia'],
    source: 'colonic',
    typicalOnset: 'acute_self_limited',
    hemodynamicInstability: 'rare',
    ageRange: [40, 90], agePeak: [60, 85],
    sexPredilection: 'none', backgroundPrevalence: 0.005,
    riskFactors: ['age', 'hypertension', 'diabetes', 'hypotension', 'aortic_surgery'],
    redFlags: ['hematochezia', 'peritonism', 'fever'],
    painPattern: 'abdominal_pain',
    associatedSymptoms: ['cramping_pain', 'diarrhea', 'urgency'],
  },
  {
    diseaseId: 'ulcerative_colitis_bleeding', diseaseName: 'Ulcerative Colitis (Bleeding Flare)', icdCode: 'K51.0',
    bleedingTypes: ['hematochezia'],
    source: 'colonic',
    typicalOnset: 'intermittent',
    hemodynamicInstability: 'rare',
    ageRange: [15, 60], agePeak: [20, 40],
    sexPredilection: 'none', backgroundPrevalence: 0.003,
    riskFactors: ['family_history_ibd', 'non_smoker'],
    redFlags: ['hematochezia', 'fever', 'weight_loss', 'toxic_megacolon'],
    painPattern: 'colicky_pain',
    associatedSymptoms: ['diarrhea', 'mucus', 'tenesmus', 'urgency', 'abdominal_pain'],
  },
  {
    diseaseId: 'infectious_colitis_bleeding', diseaseName: 'Infectious Colitis (EHEC, Shigella, Campylobacter, C. diff)', icdCode: 'A09',
    bleedingTypes: ['hematochezia'],
    source: 'colonic',
    typicalOnset: 'acute_self_limited',
    hemodynamicInstability: 'rare',
    ageRange: [1, 80], agePeak: [1, 40],
    sexPredilection: 'none', backgroundPrevalence: 0.01,
    riskFactors: ['recent_travel', 'antibiotic_use', 'food_poisoning', 'daycare', 'hiv'],
    redFlags: ['hematochezia', 'fever_chills', 'dehydration'],
    painPattern: 'colicky_pain',
    associatedSymptoms: ['diarrhea', 'fever', 'vomiting', 'tenesmus'],
  },
  {
    diseaseId: 'colon_cancer_bleeding', diseaseName: 'Colorectal Cancer (Bleeding)', icdCode: 'C18-C20',
    bleedingTypes: ['hematochezia', 'occult', 'melena'],
    source: 'colonic',
    typicalOnset: 'chronic_occult',
    hemodynamicInstability: 'rare',
    ageRange: [30, 90], agePeak: [50, 80],
    sexPredilection: 'none', backgroundPrevalence: 0.01,
    riskFactors: ['age', 'family_history_colon_cancer', 'ibd', 'smoking', 'dietary', 'obesity'],
    redFlags: ['weight_loss', 'hematochezia', 'obstruction', 'anemia'],
    painPattern: 'abdominal_pain',
    associatedSymptoms: ['weight_loss', 'change_bowel_habit', 'abdominal_pain', 'anemia', 'tenesmus'],
  },
  {
    diseaseId: 'rectal_varices', diseaseName: 'Rectal Varices', icdCode: 'I84.8',
    bleedingTypes: ['hematochezia'],
    source: 'rectal',
    typicalOnset: 'intermittent',
    hemodynamicInstability: 'rare',
    ageRange: [30, 80], agePeak: [40, 70],
    sexPredilection: 'none', backgroundPrevalence: 0.002,
    riskFactors: ['portal_hypertension', 'chronic_liver_disease'],
    redFlags: ['hematochezia_massive'],
    painPattern: 'painless',
    associatedSymptoms: ['hemorrhoids'],
  },

  // ── Rectal/Anal Source ──────────────────────────────────────────────
  {
    diseaseId: 'hemorrhoidal_bleeding', diseaseName: 'Hemorrhoidal Bleeding', icdCode: 'K64',
    bleedingTypes: ['hematochezia'],
    source: 'rectal',
    typicalOnset: 'intermittent',
    hemodynamicInstability: 'rare',
    ageRange: [15, 80], agePeak: [30, 60],
    sexPredilection: 'none', backgroundPrevalence: 0.08,
    riskFactors: ['constipation', 'straining', 'pregnancy', 'obesity', 'prolonged_sitting'],
    redFlags: [],
    painPattern: 'painless',
    associatedSymptoms: ['rectal_discomfort', 'pruritus_ani', 'prolapse'],
  },
  {
    diseaseId: 'anal_fissure', diseaseName: 'Anal Fissure', icdCode: 'K60.0',
    bleedingTypes: ['hematochezia'],
    source: 'rectal',
    typicalOnset: 'intermittent',
    hemodynamicInstability: 'rare',
    ageRange: [1, 80], agePeak: [20, 50],
    sexPredilection: 'none', backgroundPrevalence: 0.02,
    riskFactors: ['constipation', 'hard_stool', 'straining', 'childbirth'],
    redFlags: [],
    painPattern: 'rectal_pain',
    associatedSymptoms: ['sharp_rectal_pain_with_defecation', 'constipation'],
  },
  {
    diseaseId: 'proctitis_radiation', diseaseName: 'Radiation Proctitis', icdCode: 'K62.7',
    bleedingTypes: ['hematochezia'],
    source: 'rectal',
    typicalOnset: 'intermittent',
    hemodynamicInstability: 'rare',
    ageRange: [30, 90], agePeak: [50, 80],
    sexPredilection: 'none', backgroundPrevalence: 0.003,
    riskFactors: ['pelvic_radiation', 'prostate_cancer_treatment', 'cervical_cancer_treatment'],
    redFlags: ['hematochezia', 'stricture'],
    painPattern: 'rectal_pain',
    associatedSymptoms: ['tenesmus', 'rectal_pain', 'diarrhea', 'urgency'],
  },
];

// ── SOCRATES profiles for bleeding characterization ────────────────────

const SOCRATES_BLEEDING_PROFILES: Record<string, SocratesBleedingProfile> = {
  esophageal_varices: {
    color: ['Bright red hematemesis', 'Coffee ground', 'Dark blood'],
    volume: ['Massive — filling a basin/bowl'],
    timing: ['Sudden, while at rest or with minimal effort'],
    relation_to_pain: ['Painless'],
    relation_to_food: ['Unrelated to meals'],
    relation_to_nsaid: ['No'],
    associated_symptoms: ['No nausea or epigastric pain preceding'],
    risk_context: ['Known liver disease', 'Alcohol use', 'Hepatitis'],
  },
  mallory_weiss: {
    color: ['Bright red — after initial non-bloody vomit'],
    volume: ['Variable, usually self-limited'],
    timing: ['Immediately after forceful vomiting/retching'],
    relation_to_pain: ['Preceded by non-bloody vomiting or retching'],
    relation_to_food: ['Often after heavy meal or alcohol binge'],
    relation_to_nsaid: ['No'],
    associated_symptoms: ['Forceful retching first', 'Epigastric discomfort'],
    risk_context: ['Alcohol binge', 'Bulimia'],
  },
  peptic_ulcer: {
    color: ['Coffee ground hematemesis', 'Melena (black, tarry, sticky)'],
    volume: ['Variable — may be large if arterial bleed'],
    timing: ['May follow NSAID use or occur spontaneously'],
    relation_to_pain: ['Often epigastric pain precedes or accompanies'],
    relation_to_food: ['May worsen or improve with eating'],
    relation_to_nsaid: ['Often positive'],
    associated_symptoms: ['Epigastric pain', 'Nausea', 'Bloating'],
    risk_context: ['NSAIDs', 'Smoking', 'Stress'],
  },
  diverticular_bleeding: {
    color: ['Bright red or maroon — painless, massive'],
    volume: ['Large volume, often sudden'],
    timing: ['Sudden onset, often self-limited (80% stop spontaneously)'],
    relation_to_pain: ['Painless — the classic "painless massive hematochezia"'],
    relation_to_food: ['Unrelated'],
    relation_to_nsaid: ['May be associated'],
    associated_symptoms: ['Minimal or no abdominal pain'],
    risk_context: ['Age > 60', 'Diverticulosis', 'NSAIDs', 'Anticoagulants'],
  },
  ischemic_colitis: {
    color: ['Dark red or maroon — mixed with stool'],
    volume: ['Small to moderate — not massive'],
    timing: ['Acute onset with cramping abdominal pain'],
    relation_to_pain: ['Pain PRECEDES bleeding — important clue'],
    relation_to_food: ['Unrelated'],
    relation_to_nsaid: ['No'],
    associated_symptoms: ['Cramping left-sided pain', 'Diarrhea', 'Urgency'],
    risk_context: ['Age > 60', 'Hypertension', 'Diabetes', 'Hypotensive episode'],
  },
  colon_cancer: {
    color: ['Dark red, mixed with stool', 'Occult'],
    volume: ['Small volume, persistent'],
    timing: ['Chronic/intermittent — not acute massive'],
    relation_to_pain: ['May have dull ache or be painless'],
    relation_to_food: ['Unrelated'],
    relation_to_nsaid: ['No'],
    associated_symptoms: ['Change in bowel habit', 'Weight loss', 'Fatigue', 'Anemia'],
    risk_context: ['Age > 50', 'Family history', 'IBD'],
  },
  hemorrhoidal: {
    color: ['Bright red — ON toilet paper or dripping after BM'],
    volume: ['Small — streaks or drops'],
    timing: ['With or immediately after bowel movement'],
    relation_to_pain: ['Painless unless thrombosed'],
    relation_to_food: ['Unrelated'],
    relation_to_nsaid: ['No'],
    associated_symptoms: ['Constipation', 'Straining', 'Prolapse'],
    risk_context: ['Chronic constipation', 'Pregnancy', 'Obesity'],
  },
};

// ── Clinical pattern rules for GI bleeding ─────────────────────────────

const GI_BLEEDING_PATTERNS: BleedingPatternRule[] = [
  {
    id: 'hematemesis_melena_upper', label: 'Hematemesis + Melena = Upper GI Source',
    description: 'Hematemesis with melena = UGIB until proven otherwise (90%+ are upper GI)',
    pattern: ['hematemesis', 'melena'],
    suggests: ['esophageal_varices', 'peptic_ulcer_bleeding', 'acute_hemorrhagic_gastritis'],
    rulesOut: ['hemorrhoidal_bleeding', 'diverticular_bleeding', 'colonic_bleeding'],
    priorityBoost: 30,
  },
  {
    id: 'massive_hematochezia_upper', label: 'Massive Hematochezia with Hypotension',
    description: 'Massive bright red hematochezia + hypotension = severe UGIB (or diverticular) until proven',
    pattern: ['hematochezia', 'hypotension', 'fever'],
    suggests: ['diverticular_bleeding', 'esophageal_varices', 'aortoenteric_fistula'],
    rulesOut: ['hemorrhoidal_bleeding', 'anal_fissure'],
    priorityBoost: 30,
  },
  {
    id: 'painless_hematochezia', label: 'Painless Hematochezia',
    description: 'Painless passage of bright red blood = diverticular bleed or angiodysplasia (age > 60)',
    pattern: ['hematochezia'],
    suggests: ['diverticular_bleeding', 'colonic_angiodysplasia'],
    rulesOut: ['ischemic_colitis', 'infectious_colitis_bleeding'],
    priorityBoost: 20,
  },
  {
    id: 'cramping_then_bleeding', label: 'Cramping Abdominal Pain PRECEDES Hematochezia',
    description: 'Pain BEFORE bleeding = ischemic colitis (pain AFTER = diverticular)',
    pattern: ['hematochezia', 'abdominal_pain_cramping'],
    suggests: ['ischemic_colitis'],
    rulesOut: ['diverticular_bleeding', 'hemorrhoidal_bleeding'],
    priorityBoost: 25,
  },
  {
    id: 'retching_then_hematemesis', label: 'Retching/Vomiting THEN Hematemesis',
    description: 'Violent retching followed by hematemesis = Mallory-Weiss (vs varices which is painless massive)',
    pattern: ['vomiting', 'hematemesis'],
    suggests: ['mallory_weiss_syndrome'],
    rulesOut: ['esophageal_varices', 'dieulafoy_lesion'],
    priorityBoost: 20,
  },
  {
    id: 'chronic_occult_weight_loss', label: 'Chronic Occult Bleeding + Weight Loss',
    description: 'Chronic anemia + weight loss + age > 50 = GI malignancy until proven otherwise',
    pattern: ['weight_loss', 'fatigue', 'hematochezia'],
    suggests: ['colon_cancer_bleeding', 'gastric_cancer_bleeding', 'small_bowel_tumor'],
    rulesOut: ['hemorrhoidal_bleeding', 'anal_fissure'],
    priorityBoost: 25,
  },
  {
    id: 'change_bowel_habit_bleeding', label: 'Change in Bowel Habit + Rectal Bleeding',
    description: 'Change in bowel habit + PR bleeding = colorectal cancer until proven',
    pattern: ['hematochezia', 'bowel_habits'],
    suggests: ['colon_cancer_bleeding', 'ulcerative_colitis_bleeding'],
    rulesOut: ['hemorrhoidal_bleeding', 'ischemic_colitis'],
    priorityBoost: 20,
  },
  {
    id: 'known_liver_disease_bleed', label: 'Known Liver Disease + GI Bleed',
    description: 'Known cirrhosis/CLD + any GI bleed = variceal hemorrhage until proven otherwise',
    pattern: ['hematemesis', 'melena', 'alcohol_use'],
    suggests: ['esophageal_varices', 'gastric_varices', 'portal_hypertensive_gastropathy'],
    rulesOut: ['peptic_ulcer_bleeding', 'mallory_weiss_syndrome'],
    priorityBoost: 25,
  },
  {
    id: 'anticoagulant_bleeding', label: 'On Anticoagulation + GI Bleed',
    description: 'Anticoagulated patient with GI bleed = higher severity, need reversal',
    pattern: ['anticoagulant_use', 'hematochezia'],
    suggests: ['diverticular_bleeding', 'peptic_ulcer_bleeding', 'colonic_angiodysplasia'],
    rulesOut: [],
    priorityBoost: 25,
  },
  {
    id: 'tenesmus_urgency_bleeding', label: 'Tenesmus + Urgency + Rectal Bleeding',
    description: 'Tenesmus and urgency with bloody diarrhea = proctitis or IBD flare',
    pattern: ['hematochezia', 'diarrhea', 'abdominal_pain'],
    suggests: ['ulcerative_colitis_bleeding', 'infectious_colitis_bleeding', 'proctitis_radiation'],
    rulesOut: ['diverticular_bleeding', 'hemorrhoidal_bleeding'],
    priorityBoost: 20,
  },
  {
    id: 'prior_aaa_graft_bleed', label: 'Prior AAA Repair + GI Bleed',
    description: 'Prior AAA graft + GI bleed = aortoenteric fistula (herald bleed may precede massive)',
    pattern: ['hematochezia', 'hematemesis', 'prior_abdominal_surgery'],
    suggests: ['aortoenteric_fistula'],
    rulesOut: [],
    priorityBoost: 35,
  },
  {
    id: 'pediatric_painless_hematochezia', label: 'Child with Painless Hematochezia',
    description: 'Child with sudden painless hematochezia = Meckel diverticulum',
    pattern: ['hematochezia'],
    suggests: ['meckel_diverticulum_bleed'],
    rulesOut: ['hemorrhoidal_bleeding', 'colon_cancer_bleeding'],
    priorityBoost: 30,
  },
];

// ── Bleeding source localization logic ─────────────────────────────────

export function localizeBleedingSource(
  hematemesis: boolean,
  melena: boolean,
  hematochezia: boolean,
  colorDescription?: string,
  volumeDescription?: string,
  painPattern?: string,
): { likelySource: BleedingSource; confidence: 'high' | 'moderate' | 'low'; rationale: string } {
  if (hematemesis && melena) {
    return { likelySource: 'upper_gi', confidence: 'high', rationale: 'Hematemesis + melena = UGIB (85%+ are upper GI source)' };
  }
  if (hematemesis && !melena && !hematochezia) {
    return { likelySource: 'upper_gi', confidence: 'high', rationale: 'Hematemesis alone = UGIB (esophageal/gastric/duodenal)' };
  }
  if (melena && !hematemesis) {
    return { likelySource: 'upper_gi', confidence: 'moderate', rationale: 'Melena alone = UGIB until proven. 50-100mL blood needed for melena. Source can be as distal as cecum.' };
  }
  if (hematochezia && volumeDescription?.toLowerCase().includes('massive')) {
    return { likelySource: 'upper_gi', confidence: 'moderate', rationale: 'Massive hematochezia can be from rapid UGIB (esp. varices). Also consider diverticular bleed.' };
  }
  if (hematochezia && painPattern?.toLowerCase().includes('cramp') && !painPattern?.toLowerCase().includes('painless')) {
    return { likelySource: 'colonic', confidence: 'moderate', rationale: 'Cramping pain preceding hematochezia = ischemic colitis. Pain with hematochezia = colonic source.' };
  }
  if (hematochezia && painPattern?.toLowerCase().includes('painless')) {
    return { likelySource: 'colonic', confidence: 'moderate', rationale: 'Painless hematochezia = diverticular bleed, angiodysplasia, or hemorrhoidal.' };
  }
  if (colorDescription?.toLowerCase().includes('bright red on paper') || colorDescription?.toLowerCase().includes('dripping after')) {
    return { likelySource: 'rectal', confidence: 'high', rationale: 'Bright red blood on paper or dripping after BM = hemorrhoidal or anal fissure.' };
  }
  if (colorDescription?.toLowerCase().includes('dark') || colorDescription?.toLowerCase().includes('maroon')) {
    return { likelySource: 'colonic', confidence: 'moderate', rationale: 'Dark/maroon blood = left-sided colonic source or slow UGIB.' };
  }
  return { likelySource: 'unknown', confidence: 'low', rationale: 'Insufficient data to localize source. Upper GI source most likely statistically.' };
}

// ── Hemodynamic severity triage ────────────────────────────────────────

export function assessBleedingSeverity(
  heartRate?: number,
  systolicBP?: number,
  syncope?: boolean,
  hematemesisVolume?: string,
): { severity: 'massive' | 'moderate' | 'mild'; blatchfordScore: number; action: string } {
  let score = 0;

  if (syncope) score += 4;
  if (heartRate && heartRate >= 100) score += 3;
  if (systolicBP && systolicBP < 100) score += 3;
  if (hematemesisVolume?.toLowerCase().includes('massive') || hematemesisVolume?.toLowerCase().includes('basin')) score += 4;

  if (score >= 8) {
    return { severity: 'massive', blatchfordScore: score, action: 'EMERGENCY: Resuscitate, cross-match, urgent endoscopy/embolization' };
  }
  if (score >= 4) {
    return { severity: 'moderate', blatchfordScore: score, action: 'URGENT: Monitor vitals, IV access, cross-match, endoscopy within 6-12h' };
  }
  return { severity: 'mild', blatchfordScore: score, action: 'Routine: Outpatient endoscopy or colonoscopy as indicated' };
}

// ── Public API ─────────────────────────────────────────────────────────

export function getGiBleedingDdx(): GiBleedingDisease[] {
  return GI_BLEEDING_DDX;
}

export function getGiBleedingPatterns(): BleedingPatternRule[] {
  return GI_BLEEDING_PATTERNS;
}

export function getBleedingSocratesProfile(diseaseId: string): SocratesBleedingProfile | null {
  return SOCRATES_BLEEDING_PROFILES[diseaseId] || null;
}

export function getBiodataAdjustedBleedingPriors(
  state: EncounterBrainState,
): Record<string, { diseaseId: string; diseaseName: string; priorShift: number; rationale: string }> {
  const result: Record<string, { diseaseId: string; diseaseName: string; priorShift: number; rationale: string }> = {};
  const age = state.patient.ageYears;
  const sex = state.patient.sex;

  for (const ddx of GI_BLEEDING_DDX) {
    let shift = 0;
    const reasons: string[] = [];

    if (age >= ddx.ageRange[0] && age <= ddx.ageRange[1]) {
      shift += 0.02;
      if (age >= ddx.agePeak[0] && age <= ddx.agePeak[1]) {
        shift += 0.05;
        reasons.push(`peak age ${ddx.agePeak[0]}-${ddx.agePeak[1]}`);
      }
    } else {
      shift -= 0.03;
    }

    if (ddx.sexPredilection === 'male' && sex === 'male') {
      shift += 0.03;
      reasons.push('male predominance');
    } else if (ddx.sexPredilection === 'female' && sex === 'female') {
      shift += 0.03;
      reasons.push('female predominance');
    }

    result[ddx.diseaseId] = {
      diseaseId: ddx.diseaseId,
      diseaseName: ddx.diseaseName,
      priorShift: Math.max(-0.03, Math.min(0.15, shift)),
      rationale: reasons.length > 0 ? reasons.join('; ') : 'no specific biodata adjustment',
    };
  }

  return result;
}

export function getGiBleedingGaps(
  state: EncounterBrainState,
  answeredFeatureIds: string[],
): InformationGap[] {
  const gaps: InformationGap[] = [];
  const answered = new Set(answeredFeatureIds);

  const BLEEDING_GAP_DEFS: { id: string; label: string; features: string[]; priority: number; rationale: string }[] = [
    { id: 'bleed_type', label: 'Bleeding Type', features: ['hematemesis', 'melena', 'hematochezia'], priority: 95, rationale: 'Classifying the type of GI bleed is the first step in source localization.' },
    { id: 'bleed_volume', label: 'Bleeding Volume', features: ['hematemesis_volume', 'bleeding_volume_estimation'], priority: 90, rationale: 'Volume determines hemodynamic severity and urgency of intervention.' },
    { id: 'bleed_color', label: 'Bleeding Color', features: ['hematemesis_description', 'stool_blood_color'], priority: 85, rationale: 'Color helps localize source (bright red vs dark vs melena vs occult).' },
    { id: 'bleed_timing', label: 'Bleeding Timing', features: ['bleeding_duration_hours', 'bleeding_onset_sudden'], priority: 80, rationale: 'Timing distinguishes acute massive from chronic occult bleeding.' },
    { id: 'bleed_syncope', label: 'Syncope / Near-Syncope', features: ['syncope', 'lightheadedness'], priority: 95, rationale: 'Syncope with GI bleed = massive hemorrhage until proven otherwise.' },
    { id: 'bleed_pain', label: 'Pain Association', features: ['pain_character', 'pain_initial_location', 'abdominal_pain_cramping'], priority: 75, rationale: 'Pain-before-bleed vs pain-after-bleed vs painless — key diagnostic discriminator.' },
    { id: 'bleed_retching', label: 'Prior Retching', features: ['vomiting', 'vomiting_description', 'retching'], priority: 70, rationale: 'Retching before hematemesis suggests Mallory-Weiss.' },
    { id: 'bleed_liver_disease', label: 'Liver Disease Context', features: ['alcohol_use', 'known_liver_disease', 'ascites'], priority: 75, rationale: 'Known liver disease + GI bleed = varices until proven.' },
    { id: 'bleed_nsaids', label: 'NSAID/Anticoagulant Use', features: ['nsaid_use', 'anticoagulant_use', 'steroid_use'], priority: 70, rationale: 'NSAIDs and anticoagulants increase risk and severity of GI bleeding.' },
    { id: 'bleed_symptoms', label: 'Associated Symptoms', features: ['diarrhea', 'weight_loss', 'fever', 'abdominal_pain', 'tenesmus'], priority: 65, rationale: 'Associated symptoms help distinguish IBD, infectious, ischemic, and malignant causes.' },
    { id: 'bleed_history', label: 'Prior Bleeding History', features: ['prior_gi_bleed', 'prior_diagnosis_ulcer', 'prior_diverticulitis'], priority: 60, rationale: 'Prior GI bleed is strongest risk factor for recurrent GI bleed.' },
    { id: 'bleed_risk', label: 'Risk Factors', features: ['smoking', 'alcohol_use', 'family_history_gi_cancer', 'prior_abdominal_surgery', 'aaa_history'], priority: 55, rationale: 'Risk factor assessment completes the bleeding history.' },
  ];

  for (const def of BLEEDING_GAP_DEFS) {
    const answeredCount = def.features.filter(f => answered.has(f)).length;
    if (answeredCount === 0) {
      const firstFeature = def.features[0];
      const feature = FEATURES[firstFeature];
      if (feature) {
        gaps.push({
          featureId: firstFeature,
          label: feature.label,
          category: 'life_threatening',
          priorityScore: def.priority,
          reasonEssential: def.rationale,
          type: feature.type,
          options: feature.options,
          clinicalGuide: feature.clinicalGuide,
          groupLabel: 'GI Bleeding Assessment',
        });
      }
    } else if (answeredCount < def.features.length) {
      const unanswered = def.features.find(f => !answered.has(f));
      if (unanswered) {
        const feature = FEATURES[unanswered];
        if (feature) {
          gaps.push({
            featureId: unanswered,
            label: feature.label,
            category: 'life_threatening',
            priorityScore: def.priority - 10,
            reasonEssential: `Partial assessment: ${def.label} incomplete. ${def.rationale}`,
            type: feature.type,
            options: feature.options,
            clinicalGuide: feature.clinicalGuide,
            groupLabel: 'GI Bleeding Assessment',
          });
        }
      }
    }
  }

  return gaps.sort((a, b) => b.priorityScore - a.priorityScore);
}

export function getGiBleedingPatternGaps(
  state: EncounterBrainState,
  answeredFeatureIds: string[],
  activeDiseaseStates: Record<string, DiseaseState>,
): InformationGap[] {
  const gaps: InformationGap[] = [];
  const answered = new Set(answeredFeatureIds);

  for (const pattern of GI_BLEEDING_PATTERNS) {
    const patternAnswered = pattern.pattern.filter(f => answered.has(f));
    const patternUnanswered = pattern.pattern.filter(f => !answered.has(f));

    if (patternAnswered.length >= 2 && patternUnanswered.length > 0) {
      for (const featureId of patternUnanswered) {
        const feature = FEATURES[featureId];
        if (!feature) continue;

        const matchingDiseases = pattern.suggests.filter(d => activeDiseaseStates[d]?.currentProb > 0.01).length;
        const boost = matchingDiseases > 0 ? pattern.priorityBoost + 10 : pattern.priorityBoost;

        gaps.push({
          featureId,
          label: feature.label,
          category: 'diagnostic',
          priorityScore: Math.min(100, 60 + boost),
          reasonEssential: `Pattern "${pattern.label}" partially recognized (${patternAnswered.length}/${pattern.pattern.length}). ${pattern.description}`,
          type: feature.type,
          options: feature.options,
          clinicalGuide: feature.clinicalGuide,
          groupLabel: `Pattern: ${pattern.label}`,
        });
      }
    }
  }

  return gaps.sort((a, b) => b.priorityScore - a.priorityScore);
}
