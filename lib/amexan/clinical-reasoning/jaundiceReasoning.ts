// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Jaundice Clinical Reasoning Rules
// Complete differential diagnosis by bilirubin type (unconjugated vs conjugated),
// anatomical level (pre-hepatic / hepatic / post-hepatic), and SOCRATES logic.
// Every question exists because a rule triggered it, not a template.
// ═══════════════════════════════════════════════════════════════════════════════

import type { EncounterBrainState, InformationGap, DiseaseState } from '../encounter-brain/types';
import { FEATURES } from '../knowbase/features/featureLibrary';

// ── Core type definitions ──────────────────────────────────────────────

type BilirubinType = 'unconjugated_indirect' | 'conjugated_direct' | 'mixed' | 'unknown';
type JaundiceCategory = 'pre_hepatic_hemolytic' | 'hepatic_hepatocellular' | 'hepatic_cholestatic' | 'post_hepatic_obstructive' | 'congenital' | 'infiltrative' | 'vascular' | 'unknown';
type JaundiceOnset = 'acute_hours' | 'acute_days' | 'subacute_weeks' | 'chronic_months' | 'congenital' | 'intermittent';
type UrineStoolPattern = { urine: 'normal' | 'dark' | 'very_dark'; stool: 'normal' | 'pale' | 'clay_colored' | 'normal_to_pale' };

interface JaundiceDisease {
  diseaseId: string;
  diseaseName: string;
  icdCode: string;
  bilirubinType: BilirubinType;
  category: JaundiceCategory;
  onset: JaundiceOnset;
  typicalUrineStool: UrineStoolPattern;
  ageRange: [number, number];
  agePeak: [number, number];
  sexPredilection: 'none' | 'male' | 'female';
  backgroundPrevalence: number;
  riskFactors: string[];
  redFlags: string[];
  associatedSymptoms: string[];
  painPattern: 'ruq_pain' | 'epigastric_pain' | 'colicky_ruq' | 'painless' | 'muscle_pain' | 'joint_pain' | 'variable';
  feverPattern: 'no' | 'mild' | 'high' | 'intermittent';
  pruritus: 'none' | 'mild' | 'moderate' | 'severe';
  typicalDescription: string;
}

interface JaundicePatternRule {
  id: string;
  label: string;
  description: string;
  pattern: string[];
  suggests: string[];
  rulesOut: string[];
  priorityBoost: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRE-HEPATIC (Hemolytic)
// ═══════════════════════════════════════════════════════════════════════════════

const PRE_HEPATIC: JaundiceDisease[] = [
  {
    diseaseId: 'hemolytic_anemia_hereditary', diseaseName: 'Hereditary Spherocytosis / Hemolytic Anemia', icdCode: 'D58.0',
    bilirubinType: 'unconjugated_indirect', category: 'pre_hepatic_hemolytic', onset: 'congenital',
    typicalUrineStool: { urine: 'normal', stool: 'normal' },
    ageRange: [0, 60], agePeak: [0, 20],
    sexPredilection: 'none', backgroundPrevalence: 0.002,
    riskFactors: ['family_history_hemolytic_anemia', 'northern_european_ancestry'],
    redFlags: ['aplastic_crisis', 'splenomegaly_massive'],
    associatedSymptoms: ['anemia', 'fatigue', 'splenomegaly', 'gallstones', 'leg_ulcers'],
    painPattern: 'painless', feverPattern: 'no', pruritus: 'none',
    typicalDescription: 'Mild fluctuating jaundice with anemia, gallstones, and splenomegaly. Family history often positive.',
  },
  {
    diseaseId: 'sickle_cell_disease_jaundice', diseaseName: 'Sickle Cell Disease (Hemolysis)', icdCode: 'D57.0',
    bilirubinType: 'unconjugated_indirect', category: 'pre_hepatic_hemolytic', onset: 'congenital',
    typicalUrineStool: { urine: 'normal', stool: 'normal' },
    ageRange: [0, 60], agePeak: [0, 20],
    sexPredilection: 'none', backgroundPrevalence: 0.02,
    riskFactors: ['african_ancestry', 'family_history_sickle_cell'],
    redFlags: ['acute_chest_syndrome', 'stroke', 'priapism'],
    associatedSymptoms: ['chronic_anemia', 'painful_crises', 'splenomegaly_child', 'autoinfarction_adult'],
    painPattern: 'variable', feverPattern: 'mild', pruritus: 'none',
    typicalDescription: 'Chronic mild jaundice with acute hemolytic crises (dark urine during crisis). Painful vaso-occlusive episodes. Gallstones common.',
  },
  {
    diseaseId: 'thalassemia_jaundice', diseaseName: 'Thalassemia Major/Intermedia', icdCode: 'D56.1',
    bilirubinType: 'unconjugated_indirect', category: 'pre_hepatic_hemolytic', onset: 'congenital',
    typicalUrineStool: { urine: 'normal', stool: 'normal' },
    ageRange: [0, 40], agePeak: [0, 10],
    sexPredilection: 'none', backgroundPrevalence: 0.003,
    riskFactors: ['mediterranean_ancestry', 'family_history_thalassemia'],
    redFlags: ['growth_failure', 'skeletal_deformity', 'iron_overload'],
    associatedSymptoms: ['severe_anemia', 'growth_retardation', 'splenomegaly', 'bone_pain', 'iron_overload'],
    painPattern: 'painless', feverPattern: 'no', pruritus: 'none',
    typicalDescription: 'Severe transfusion-dependent anemia with jaundice from infancy. Splenomegaly and iron overload from repeated transfusions.',
  },
  {
    diseaseId: 'autoimmune_hemolytic_anemia', diseaseName: 'Autoimmune Hemolytic Anemia (AIHA)', icdCode: 'D59.1',
    bilirubinType: 'unconjugated_indirect', category: 'pre_hepatic_hemolytic', onset: 'acute_days',
    typicalUrineStool: { urine: 'dark', stool: 'normal' },
    ageRange: [1, 80], agePeak: [30, 60],
    sexPredilection: 'female', backgroundPrevalence: 0.001,
    riskFactors: ['autoimmune_disease', 'lymphoma', 'drug_induced', 'viral_infection'],
    redFlags: ['rapid_hemoglobin_drop', 'cardiac_failure'],
    associatedSymptoms: ['fatigue', 'pallor', 'splenomegaly', 'dyspnea', 'palpitations'],
    painPattern: 'painless', feverPattern: 'mild', pruritus: 'none',
    typicalDescription: 'Acute onset of jaundice with rapidly falling hemoglobin. May have hemoglobinuria (dark urine). Often post-viral or drug-induced.',
  },
  {
    diseaseId: 'g6pd_deficiency', diseaseName: 'G6PD Deficiency — Acute Hemolytic Crisis', icdCode: 'D55.0',
    bilirubinType: 'unconjugated_indirect', category: 'pre_hepatic_hemolytic', onset: 'acute_hours',
    typicalUrineStool: { urine: 'very_dark', stool: 'normal' },
    ageRange: [0, 60], agePeak: [0, 10],
    sexPredilection: 'male', backgroundPrevalence: 0.02,
    riskFactors: ['african_ancestry', 'mediterranean_ancestry', 'fava_beans', 'oxidant_drugs', 'infection'],
    redFlags: ['acute_renal_failure', 'severe_anemia'],
    associatedSymptoms: ['dark_urine', 'pallor', 'fatigue', 'back_pain', 'hemoglobinuria'],
    painPattern: 'painless', feverPattern: 'mild', pruritus: 'none',
    typicalDescription: 'Acute hemolysis hours to days after oxidant stress (fava beans, sulfa drugs, infection). Sudden dark urine and jaundice.',
  },
  {
    diseaseId: 'malaria_jaundice', diseaseName: 'Severe Malaria (P. falciparum)', icdCode: 'B50',
    bilirubinType: 'mixed', category: 'pre_hepatic_hemolytic', onset: 'acute_days',
    typicalUrineStool: { urine: 'dark', stool: 'normal' },
    ageRange: [0, 80], agePeak: [2, 15],
    sexPredilection: 'none', backgroundPrevalence: 0.01,
    riskFactors: ['travel_endemic_area', 'no_prophylaxis', 'splenectomy'],
    redFlags: ['cerebral_malaria', 'acute_renal_failure', 'hypoglycemia'],
    associatedSymptoms: ['fever', 'chills', 'headache', 'myalgia', 'splenomegaly', 'anemia'],
    painPattern: 'muscle_pain', feverPattern: 'high', pruritus: 'none',
    typicalDescription: 'Cyclic fevers with rigors, jaundice, anemia, and splenomegaly in endemic area. Bilirubin is mixed — hemolysis + hepatic dysfunction.',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// HEPATIC (Hepatocellular)
// ═══════════════════════════════════════════════════════════════════════════════

const HEPATIC_CELLULAR: JaundiceDisease[] = [
  {
    diseaseId: 'acute_hepatitis_a', diseaseName: 'Acute Hepatitis A', icdCode: 'B15',
    bilirubinType: 'conjugated_direct', category: 'hepatic_hepatocellular', onset: 'acute_days',
    typicalUrineStool: { urine: 'dark', stool: 'normal_to_pale' },
    ageRange: [1, 60], agePeak: [5, 30],
    sexPredilection: 'none', backgroundPrevalence: 0.005,
    riskFactors: ['travel_endemic', 'poor_sanitation', 'food_borne', 'daycare'],
    redFlags: ['fulminant_hepatitis', 'coagulopathy', 'encephalopathy'],
    associatedSymptoms: ['malaise', 'anorexia', 'nausea', 'fever', 'arthralgia', 'rash'],
    painPattern: 'ruq_pain', feverPattern: 'high', pruritus: 'none',
    typicalDescription: 'Abrupt onset of fever, malaise, anorexia, followed by jaundice 1-2 weeks later. Self-limiting in most. Children often asymptomatic.',
  },
  {
    diseaseId: 'acute_hepatitis_b', diseaseName: 'Acute Hepatitis B', icdCode: 'B16',
    bilirubinType: 'conjugated_direct', category: 'hepatic_hepatocellular', onset: 'subacute_weeks',
    typicalUrineStool: { urine: 'dark', stool: 'normal_to_pale' },
    ageRange: [15, 60], agePeak: [20, 40],
    sexPredilection: 'none', backgroundPrevalence: 0.005,
    riskFactors: ['ivdu', 'unprotected_sex', 'healthcare_worker', 'needlestick', 'endemic_area', 'vertical_transmission'],
    redFlags: ['fulminant_hepatitis', 'coagulopathy', 'ascites'],
    associatedSymptoms: ['malaise', 'arthralgia', 'rash', 'myalgia', 'nausea', 'serum_sickness'],
    painPattern: 'ruq_pain', feverPattern: 'mild', pruritus: 'mild',
    typicalDescription: 'Prodrome of arthralgia and rash, then jaundice, malaise, and RUQ discomfort. May progress to chronic carrier state.',
  },
  {
    diseaseId: 'acute_hepatitis_c', diseaseName: 'Acute Hepatitis C', icdCode: 'B17.1',
    bilirubinType: 'conjugated_direct', category: 'hepatic_hepatocellular', onset: 'subacute_weeks',
    typicalUrineStool: { urine: 'dark', stool: 'normal' },
    ageRange: [15, 70], agePeak: [20, 50],
    sexPredilection: 'none', backgroundPrevalence: 0.01,
    riskFactors: ['ivdu', 'blood_transfusion_before_1992', 'hemodialysis', 'needlestick'],
    redFlags: ['chronic_liver_disease', 'cirrhosis', 'hcc'],
    associatedSymptoms: ['fatigue', 'malaise', 'anorexia', 'arthralgia'],
    painPattern: 'ruq_pain', feverPattern: 'mild', pruritus: 'none',
    typicalDescription: 'Often asymptomatic acute phase. 75-85% become chronic. Fatigue is the most common symptom. Jaundice is uncommon in acute HCV.',
  },
  {
    diseaseId: 'acute_hepatitis_e', diseaseName: 'Acute Hepatitis E', icdCode: 'B17.2',
    bilirubinType: 'conjugated_direct', category: 'hepatic_hepatocellular', onset: 'acute_days',
    typicalUrineStool: { urine: 'dark', stool: 'pale' },
    ageRange: [15, 60], agePeak: [20, 40],
    sexPredilection: 'male', backgroundPrevalence: 0.003,
    riskFactors: ['travel_endemic', 'contaminated_water', 'pregnancy'],
    redFlags: ['fulminant_hepatitis_pregnancy', 'coagulopathy'],
    associatedSymptoms: ['malaise', 'anorexia', 'nausea', 'fever', 'arthralgia'],
    painPattern: 'ruq_pain', feverPattern: 'mild', pruritus: 'mild',
    typicalDescription: 'Similar to HAV but more severe in pregnant women (20% mortality in 3rd trimester). Water-borne in endemic areas.',
  },
  {
    diseaseId: 'alcoholic_hepatitis', diseaseName: 'Alcoholic Hepatitis', icdCode: 'K70.1',
    bilirubinType: 'conjugated_direct', category: 'hepatic_hepatocellular', onset: 'acute_days',
    typicalUrineStool: { urine: 'dark', stool: 'normal_to_pale' },
    ageRange: [25, 70], agePeak: [35, 60],
    sexPredilection: 'male', backgroundPrevalence: 0.01,
    riskFactors: ['chronic_alcohol_use', 'binge_drinking', 'female_sex_risk'],
    redFlags: ['coagulopathy', 'encephalopathy', 'ascites', 'gi_bleed'],
    associatedSymptoms: ['fever', 'tachycardia', 'hepatomegaly', 'ascites', 'anorexia', 'nausea'],
    painPattern: 'ruq_pain', feverPattern: 'high', pruritus: 'none',
    typicalDescription: 'Fever, jaundice, RUQ pain in a chronic drinker after a binge. May have ascites, encephalopathy, and coagulopathy.',
  },
  {
    diseaseId: 'drug_induced_liver_injury', diseaseName: 'Drug-Induced Liver Injury (DILI)', icdCode: 'K71.0',
    bilirubinType: 'conjugated_direct', category: 'hepatic_hepatocellular', onset: 'acute_days',
    typicalUrineStool: { urine: 'dark', stool: 'normal_to_pale' },
    ageRange: [1, 80], agePeak: [20, 60],
    sexPredilection: 'female', backgroundPrevalence: 0.003,
    riskFactors: ['polypharmacy', 'anti_tb_drugs', 'paracetamol_overdose', 'herbal_remedies', 'antibiotics', 'anticonvulsants'],
    redFlags: ['fulminant_hepatitis', 'coagulopathy', 'encephalopathy'],
    associatedSymptoms: ['rash', 'fever', 'eosinophilia', 'arthralgia'],
    painPattern: 'ruq_pain', feverPattern: 'mild', pruritus: 'mild',
    typicalDescription: 'Jaundice and hepatitis following drug exposure. May have hypersensitivity features (fever, rash, eosinophilia) in allergic DILI.',
  },
  {
    diseaseId: 'paracetamol_toxicity', diseaseName: 'Paracetamol (Acetaminophen) Overdose', icdCode: 'T39.1',
    bilirubinType: 'conjugated_direct', category: 'hepatic_hepatocellular', onset: 'acute_hours',
    typicalUrineStool: { urine: 'dark', stool: 'normal' },
    ageRange: [10, 60], agePeak: [15, 35],
    sexPredilection: 'female', backgroundPrevalence: 0.002,
    riskFactors: ['depression', 'overdose_history', 'alcoholism', 'malnutrition'],
    redFlags: ['fulminant_hepatic_failure', 'coagulopathy', 'encephalopathy', 'hypoglycemia'],
    associatedSymptoms: ['nausea', 'vomiting', 'ruq_pain', 'confusion'],
    painPattern: 'ruq_pain', feverPattern: 'no', pruritus: 'none',
    typicalDescription: 'Nausea and vomiting in first 24h, then apparent improvement, then RUQ pain and jaundice at 48-72h as hepatic necrosis develops. Coagulopathy and encephalopathy in severe cases.',
  },
  {
    diseaseId: 'autoimmune_hepatitis', diseaseName: 'Autoimmune Hepatitis', icdCode: 'K75.4',
    bilirubinType: 'conjugated_direct', category: 'hepatic_hepatocellular', onset: 'subacute_weeks',
    typicalUrineStool: { urine: 'dark', stool: 'normal_to_pale' },
    ageRange: [10, 70], agePeak: [15, 40],
    sexPredilection: 'female', backgroundPrevalence: 0.002,
    riskFactors: ['autoimmune_disease', 'female_sex'],
    redFlags: ['fulminant_hepatitis', 'cirrhosis'],
    associatedSymptoms: ['fatigue', 'arthralgia', 'rash', 'amenorrhea', 'sicca'],
    painPattern: 'ruq_pain', feverPattern: 'mild', pruritus: 'mild',
    typicalDescription: 'Chronic hepatitis with exacerbations. Associated with other autoimmune diseases. Responds to steroids. ANA and anti-smooth muscle Ab positive.',
  },
  {
    diseaseId: 'acute_fatty_liver_pregnancy', diseaseName: 'Acute Fatty Liver of Pregnancy (AFLP)', icdCode: 'O26.6',
    bilirubinType: 'conjugated_direct', category: 'hepatic_hepatocellular', onset: 'acute_days',
    typicalUrineStool: { urine: 'dark', stool: 'pale' },
    ageRange: [15, 50], agePeak: [25, 40],
    sexPredilection: 'female', backgroundPrevalence: 0.0003,
    riskFactors: ['third_trimester', 'first_pregnancy', 'multiple_pregnancy', 'male_fetus'],
    redFlags: ['fulminant_liver_failure', 'coagulopathy', 'encephalopathy', 'hypoglycemia'],
    associatedSymptoms: ['nausea', 'vomiting', 'ruq_pain', 'polydipsia', 'fever'],
    painPattern: 'ruq_pain', feverPattern: 'mild', pruritus: 'none',
    typicalDescription: 'Nausea, vomiting, and RUQ pain in third trimester, rapidly progressing to jaundice and liver failure. Emergency delivery is the treatment.',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// HEPATIC (Cholestatic / Intrahepatic)
// ═══════════════════════════════════════════════════════════════════════════════

const HEPATIC_CHOLESTATIC: JaundiceDisease[] = [
  {
    diseaseId: 'primary_biliary_cholangitis', diseaseName: 'Primary Biliary Cholangitis (PBC)', icdCode: 'K74.3',
    bilirubinType: 'conjugated_direct', category: 'hepatic_cholestatic', onset: 'chronic_months',
    typicalUrineStool: { urine: 'dark', stool: 'pale' },
    ageRange: [30, 80], agePeak: [40, 60],
    sexPredilection: 'female', backgroundPrevalence: 0.002,
    riskFactors: ['female_sex', 'family_history_pbc', 'autoimmune_disease'],
    redFlags: ['cirrhosis', 'portal_hypertension', 'liver_transplant_needed'],
    associatedSymptoms: ['pruritus_severe', 'fatigue', 'xanthelasma', 'sicca', 'osteoporosis'],
    painPattern: 'ruq_pain', feverPattern: 'no', pruritus: 'severe',
    typicalDescription: 'Severe pruritus is the hallmark. Jaundice is a late feature. Fatigue, xanthelasma, and associated autoimmune conditions common.',
  },
  {
    diseaseId: 'primary_sclerosing_cholangitis', diseaseName: 'Primary Sclerosing Cholangitis (PSC)', icdCode: 'K83.0',
    bilirubinType: 'conjugated_direct', category: 'hepatic_cholestatic', onset: 'chronic_months',
    typicalUrineStool: { urine: 'dark', stool: 'pale' },
    ageRange: [20, 70], agePeak: [30, 50],
    sexPredilection: 'male', backgroundPrevalence: 0.001,
    riskFactors: ['ibd_ulcerative_colitis', 'male_sex'],
    redFlags: ['cholangitis', 'cholangiocarcinoma', 'cirrhosis'],
    associatedSymptoms: ['pruritus', 'fatigue', 'fever_cholangitis', 'ruq_pain'],
    painPattern: 'colicky_ruq', feverPattern: 'intermittent', pruritus: 'severe',
    typicalDescription: 'Bile duct strictures causing episodic jaundice, pruritus, and cholangitis. Strongly associated with UC. ERCP shows beaded ducts.',
  },
  {
    diseaseId: 'cholestasis_of_pregnancy', diseaseName: 'Intrahepatic Cholestasis of Pregnancy (ICP)', icdCode: 'O26.6',
    bilirubinType: 'conjugated_direct', category: 'hepatic_cholestatic', onset: 'subacute_weeks',
    typicalUrineStool: { urine: 'dark', stool: 'normal_to_pale' },
    ageRange: [15, 50], agePeak: [25, 40],
    sexPredilection: 'female', backgroundPrevalence: 0.005,
    riskFactors: ['third_trimester', 'multiple_pregnancy', 'family_history_icp', 'previous_icp'],
    redFlags: ['fetal_distress', 'preterm_labour', 'stillbirth'],
    associatedSymptoms: ['pruritus_severe', 'dark_urine', 'pale_stool'],
    painPattern: 'painless', feverPattern: 'no', pruritus: 'severe',
    typicalDescription: 'Severe pruritus (especially palms and soles) in third trimester with jaundice and dark urine. Resolves after delivery. Fetal risk of stillbirth.',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// POST-HEPATIC (Obstructive)
// ═══════════════════════════════════════════════════════════════════════════════

const POST_HEPATIC: JaundiceDisease[] = [
  {
    diseaseId: 'choledocholithiasis_jaundice', diseaseName: 'Choledocholithiasis (Common Bile Duct Stone)', icdCode: 'K80.5',
    bilirubinType: 'conjugated_direct', category: 'post_hepatic_obstructive', onset: 'acute_days',
    typicalUrineStool: { urine: 'very_dark', stool: 'pale' },
    ageRange: [20, 90], agePeak: [30, 70],
    sexPredilection: 'female', backgroundPrevalence: 0.03,
    riskFactors: ['gallstones', 'obesity', 'female', 'pregnancy', 'hemolytic_anemia'],
    redFlags: ['cholangitis', 'pancreatitis', 'septic_shock'],
    associatedSymptoms: ['colicky_ruq_pain', 'nausea', 'vomiting', 'fever'],
    painPattern: 'colicky_ruq', feverPattern: 'high', pruritus: 'moderate',
    typicalDescription: 'Jaundice with colicky RUQ pain radiating to back. Dark urine, pale stools. May have Charcot triad (pain, fever, jaundice) if cholangitis develops.',
  },
  {
    diseaseId: 'pancreatic_head_cancer', diseaseName: 'Pancreatic Head Adenocarcinoma', icdCode: 'C25.0',
    bilirubinType: 'conjugated_direct', category: 'post_hepatic_obstructive', onset: 'subacute_weeks',
    typicalUrineStool: { urine: 'very_dark', stool: 'clay_colored' },
    ageRange: [30, 90], agePeak: [60, 80],
    sexPredilection: 'none', backgroundPrevalence: 0.005,
    riskFactors: ['smoking', 'chronic_pancreatitis', 'family_history_pancreatic_cancer', 'diabetes', 'obesity'],
    redFlags: ['weight_loss', 'cachexia', 'thrombophlebitis', 'ascites'],
    associatedSymptoms: ['painless_jaundice', 'weight_loss', 'anorexia', 'pruritus', 'courvoisier_gallbladder'],
    painPattern: 'painless', feverPattern: 'no', pruritus: 'severe',
    typicalDescription: 'Painless progressive jaundice with palpable gallbladder (Courvoisier sign). Dark urine, clay-colored stools, pruritus, and weight loss.',
  },
  {
    diseaseId: 'cholangiocarcinoma', diseaseName: 'Cholangiocarcinoma (Klatskin Tumor)', icdCode: 'C22.1',
    bilirubinType: 'conjugated_direct', category: 'post_hepatic_obstructive', onset: 'subacute_weeks',
    typicalUrineStool: { urine: 'very_dark', stool: 'clay_colored' },
    ageRange: [30, 90], agePeak: [50, 80],
    sexPredilection: 'male', backgroundPrevalence: 0.001,
    riskFactors: ['psc', 'clonorchis_sinensis', 'liver_flukes', 'thorotrast', 'hcw'],
    redFlags: ['rapid_progression', 'ascites', 'portal_hypertension'],
    associatedSymptoms: ['painless_jaundice', 'pruritus', 'weight_loss', 'ruq_pain'],
    painPattern: 'ruq_pain', feverPattern: 'no', pruritus: 'severe',
    typicalDescription: 'Progressive jaundice with pruritus. May have RUQ pain. Biliary obstruction at the hilum (Klatskin tumor) causes intrahepatic duct dilation without gallbladder distension.',
  },
  {
    diseaseId: 'ampullary_cancer', diseaseName: 'Ampullary Carcinoma (Ampulla of Vater)', icdCode: 'C24.1',
    bilirubinType: 'conjugated_direct', category: 'post_hepatic_obstructive', onset: 'subacute_weeks',
    typicalUrineStool: { urine: 'very_dark', stool: 'clay_colored' },
    ageRange: [40, 90], agePeak: [60, 80],
    sexPredilection: 'none', backgroundPrevalence: 0.0005,
    riskFactors: ['fap', 'gardner_syndrome', 'h_n_polyposis'],
    redFlags: ['gi_bleeding', 'obstructive_jaundice'],
    associatedSymptoms: ['painless_jaundice', 'gi_bleeding_occult', 'anemia', 'weight_loss', 'pruritus'],
    painPattern: 'painless', feverPattern: 'no', pruritus: 'moderate',
    typicalDescription: 'Painless jaundice with intermittent GI bleeding and anemia. Presents earlier than pancreatic cancer due to bleeding. Courvoisier gallbladder may be palpable.',
  },
  {
    diseaseId: 'acute_cholangitis_jaundice', diseaseName: 'Acute Cholangitis', icdCode: 'K83.0',
    bilirubinType: 'conjugated_direct', category: 'post_hepatic_obstructive', onset: 'acute_hours',
    typicalUrineStool: { urine: 'very_dark', stool: 'pale' },
    ageRange: [20, 90], agePeak: [50, 80],
    sexPredilection: 'none', backgroundPrevalence: 0.005,
    riskFactors: ['gallstones', 'biliary_stricture', 'stent', 'psc', 'ascariasis'],
    redFlags: ['septic_shock', 'hypotension', 'confusion', 'organ_failure'],
    associatedSymptoms: ['fever_chills', 'ruq_pain', 'nausea', 'vomiting'],
    painPattern: 'colicky_ruq', feverPattern: 'high', pruritus: 'mild',
    typicalDescription: 'Charcot triad: RUQ pain + fever + jaundice. Reynolds pentad adds hypotension and confusion (severe sepsis). EMERGENCY — needs biliary drainage.',
  },
  {
    diseaseId: 'biliary_stricture_benign', diseaseName: 'Benign Biliary Stricture', icdCode: 'K83.1',
    bilirubinType: 'conjugated_direct', category: 'post_hepatic_obstructive', onset: 'subacute_weeks',
    typicalUrineStool: { urine: 'dark', stool: 'pale' },
    ageRange: [20, 80], agePeak: [30, 60],
    sexPredilection: 'none', backgroundPrevalence: 0.001,
    riskFactors: ['prior_gallbladder_surgery', 'prior_ercp', 'chronic_pancreatitis', 'trauma'],
    redFlags: ['cholangitis', 'secondary_biliary_cirrhosis'],
    associatedSymptoms: ['ruq_pain', 'pruritus', 'recurrent_cholangitis'],
    painPattern: 'ruq_pain', feverPattern: 'intermittent', pruritus: 'moderate',
    typicalDescription: 'Post-cholecystectomy or post-inflammatory stricture causing episodic jaundice and cholangitis. Presents weeks to years after initial insult.',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// CONGENITAL / INFILTRATIVE / VASCULAR
// ═══════════════════════════════════════════════════════════════════════════════

const OTHER_JAUNDICE: JaundiceDisease[] = [
  {
    diseaseId: 'gilbert_syndrome', diseaseName: 'Gilbert Syndrome', icdCode: 'E80.4',
    bilirubinType: 'unconjugated_indirect', category: 'congenital', onset: 'congenital',
    typicalUrineStool: { urine: 'normal', stool: 'normal' },
    ageRange: [1, 70], agePeak: [10, 40],
    sexPredilection: 'male', backgroundPrevalence: 0.06,
    riskFactors: ['family_history_gilbert'],
    redFlags: [],
    associatedSymptoms: ['none', 'fatigue'],
    painPattern: 'painless', feverPattern: 'no', pruritus: 'none',
    typicalDescription: 'Mild unconjugated hyperbilirubinemia that increases with fasting, stress, or illness. Completely benign. No dark urine or pale stools.',
  },
  {
    diseaseId: 'crigler_najjar', diseaseName: 'Crigler-Najjar Syndrome', icdCode: 'E80.5',
    bilirubinType: 'unconjugated_indirect', category: 'congenital', onset: 'congenital',
    typicalUrineStool: { urine: 'normal', stool: 'normal' },
    ageRange: [0, 30], agePeak: [0, 1],
    sexPredilection: 'none', backgroundPrevalence: 0.00005,
    riskFactors: ['family_history_crigler_najjar', 'consanguinity'],
    redFlags: ['kernicterus', 'bilirubin_encephalopathy'],
    associatedSymptoms: ['severe_jaundice_neonatal', 'neurological_deficits'],
    painPattern: 'painless', feverPattern: 'no', pruritus: 'none',
    typicalDescription: 'Severe unconjugated hyperbilirubinemia from birth. Type 1 is fatal without liver transplant. Type 2 responds to phenobarbital.',
  },
  {
    diseaseId: 'dubin_johnson', diseaseName: 'Dubin-Johnson Syndrome', icdCode: 'E80.6',
    bilirubinType: 'conjugated_direct', category: 'congenital', onset: 'congenital',
    typicalUrineStool: { urine: 'dark', stool: 'normal' },
    ageRange: [1, 60], agePeak: [10, 40],
    sexPredilection: 'none', backgroundPrevalence: 0.001,
    riskFactors: ['family_history_dubin_johnson'],
    redFlags: [],
    associatedSymptoms: ['none', 'fatigue'],
    painPattern: 'painless', feverPattern: 'no', pruritus: 'none',
    typicalDescription: 'Mild conjugated hyperbilirubinemia with dark urine but no pruritus. Liver is black due to pigment deposition. Benign course.',
  },
  {
    diseaseId: 'rotor_syndrome', diseaseName: 'Rotor Syndrome', icdCode: 'E80.6',
    bilirubinType: 'mixed', category: 'congenital', onset: 'congenital',
    typicalUrineStool: { urine: 'dark', stool: 'normal' },
    ageRange: [1, 60], agePeak: [10, 40],
    sexPredilection: 'none', backgroundPrevalence: 0.0005,
    riskFactors: ['family_history_rotor'],
    redFlags: [],
    associatedSymptoms: ['none'],
    painPattern: 'painless', feverPattern: 'no', pruritus: 'none',
    typicalDescription: 'Mixed hyperbilirubinemia with dark urine. Similar to Dubin-Johnson but without black liver. Benign. No treatment needed.',
  },
  {
    diseaseId: 'budd_chiari_syndrome', diseaseName: 'Budd-Chiari Syndrome (Hepatic Vein Thrombosis)', icdCode: 'I82.0',
    bilirubinType: 'conjugated_direct', category: 'vascular', onset: 'acute_days',
    typicalUrineStool: { urine: 'dark', stool: 'normal' },
    ageRange: [20, 60], agePeak: [30, 50],
    sexPredilection: 'female', backgroundPrevalence: 0.0005,
    riskFactors: ['hypercoagulable_state', 'pregnancy', 'oral_contraceptives', 'myeloproliferative_disease', 'pnh'],
    redFlags: ['fulminant_liver_failure', 'ascites_tension', 'gi_bleeding'],
    associatedSymptoms: ['ascites', 'ruq_pain', 'hepatomegaly', 'splenomegaly', 'lower_edema'],
    painPattern: 'ruq_pain', feverPattern: 'mild', pruritus: 'none',
    typicalDescription: 'Acute RUQ pain, tender hepatomegaly, and rapid-onset ascites. Jaundice is mild. Hepatic vein outflow obstruction. Doppler confirms diagnosis.',
  },
  {
    diseaseId: 'veno_occlusive_disease', diseaseName: 'Veno-Occlusive Disease (SOS)', icdCode: 'K76.5',
    bilirubinType: 'conjugated_direct', category: 'vascular', onset: 'acute_days',
    typicalUrineStool: { urine: 'dark', stool: 'normal' },
    ageRange: [1, 60], agePeak: [20, 50],
    sexPredilection: 'none', backgroundPrevalence: 0.0005,
    riskFactors: ['stem_cell_transplant', 'chemotherapy', 'radiation_hepatic', 'senecio_alkaloids'],
    redFlags: ['fulminant_liver_failure', 'hepato_renal_syndrome'],
    associatedSymptoms: ['weight_gain_fluid', 'ascites', 'ruq_pain', 'hepatomegaly'],
    painPattern: 'ruq_pain', feverPattern: 'mild', pruritus: 'none',
    typicalDescription: 'Post-chemotherapy or post-transplant with tender hepatomegaly, ascites, weight gain, and jaundice. Hepatic sinusoid obstruction.',
  },
  {
    diseaseId: 'metastatic_liver_disease', diseaseName: 'Massive Hepatic Metastases (Infiltrative)', icdCode: 'C78.7',
    bilirubinType: 'conjugated_direct', category: 'infiltrative', onset: 'subacute_weeks',
    typicalUrineStool: { urine: 'dark', stool: 'pale' },
    ageRange: [30, 90], agePeak: [50, 80],
    sexPredilection: 'none', backgroundPrevalence: 0.005,
    riskFactors: ['known_primary_cancer', 'breast_cancer', 'lung_cancer', 'colon_cancer', 'melanoma'],
    redFlags: ['hepatic_encephalopathy', 'coagulopathy'],
    associatedSymptoms: ['weight_loss', 'anorexia', 'hepatomegaly_nodular', 'ruq_pain', 'ascites'],
    painPattern: 'ruq_pain', feverPattern: 'mild', pruritus: 'moderate',
    typicalDescription: 'Known primary cancer with progressive jaundice, weight loss, and nodular hepatomegaly. Liver functions show obstructive pattern.',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern Recognition Rules for Jaundice
// ═══════════════════════════════════════════════════════════════════════════════

const JAUNDICE_PATTERNS: JaundicePatternRule[] = [
  {
    id: 'painless_obstructive_jaundice', label: 'Painless Obstructive Jaundice',
    description: 'Painless progressive jaundice + palpable gallbladder = pancreatic head malignancy until proven',
    pattern: ['jaundice', 'abdominal_pain', 'weight_loss'],
    suggests: ['pancreatic_head_cancer', 'cholangiocarcinoma', 'ampullary_cancer'],
    rulesOut: ['acute_hepatitis', 'choledocholithiasis_jaundice', 'hemolytic_anemia'],
    priorityBoost: 30,
  },
  {
    id: 'charcot_triad', label: 'Charcot Triad (RUQ Pain + Fever + Jaundice)',
    description: 'Classic cholangitis triad — requires urgent biliary drainage',
    pattern: ['jaundice', 'fever', 'pain_location_now'],
    suggests: ['acute_cholangitis_jaundice', 'choledocholithiasis_jaundice'],
    rulesOut: ['pancreatic_head_cancer', 'acute_hepatitis', 'hemolytic_jaundice'],
    priorityBoost: 30,
  },
  {
    id: 'pre_hepatic_pattern', label: 'Pre-Hepatic (Hemolytic) Pattern',
    description: 'Unconjugated jaundice + anemia + normal urine + normal stool = hemolysis',
    pattern: ['jaundice', 'fatigue', 'dark_urine'],
    suggests: ['hemolytic_anemia_hereditary', 'sickle_cell_disease_jaundice', 'g6pd_deficiency', 'autoimmune_hemolytic_anemia'],
    rulesOut: ['obstructive_jaundice', 'hepatocellular_jaundice'],
    priorityBoost: 20,
  },
  {
    id: 'hepatocellular_pattern', label: 'Hepatocellular Pattern',
    description: 'Jaundice + prodromal symptoms + RUQ discomfort + dark urine = hepatitis',
    pattern: ['jaundice', 'dark_urine', 'nausea', 'pain_location_now'],
    suggests: ['acute_hepatitis_a', 'acute_hepatitis_b', 'alcoholic_hepatitis', 'drug_induced_liver_injury', 'autoimmune_hepatitis'],
    rulesOut: ['pre_hepatic_hemolytic', 'post_hepatic_obstructive'],
    priorityBoost: 20,
  },
  {
    id: 'acute_alcohol_hepatitis', label: 'Acute Alcoholic Hepatitis',
    description: 'Jaundice + fever + RUQ pain + tachycardia + heavy drinker = alcoholic hepatitis',
    pattern: ['alcohol_use', 'jaundice', 'fever', 'pain_location_now'],
    suggests: ['alcoholic_hepatitis'],
    rulesOut: ['acute_hepatitis_a', 'acute_cholangitis_jaundice', 'drug_induced_liver_injury'],
    priorityBoost: 20,
  },
  {
    id: 'severe_pruritus_jaundice', label: 'Jaundice with Severe Pruritus',
    description: 'Severe pruritus + jaundice = cholestatic pattern (PBC, PSC, or obstruction)',
    pattern: ['jaundice', 'pruritus'],
    suggests: ['primary_biliary_cholangitis', 'primary_sclerosing_cholangitis', 'cholestasis_of_pregnancy', 'pancreatic_head_cancer'],
    rulesOut: ['acute_hepatitis', 'hemolytic_jaundice', 'gilbert_syndrome'],
    priorityBoost: 20,
  },
  {
    id: 'third_trimester_jaundice', label: 'Third Trimester Jaundice + Pruritus',
    description: 'Pregnant patient in third trimester with pruritus and jaundice = ICP or AFLP',
    pattern: ['pregnancy_gestational_age', 'jaundice', 'pruritus'],
    suggests: ['cholestasis_of_pregnancy', 'acute_fatty_liver_pregnancy'],
    rulesOut: ['pancreatic_head_cancer', 'choledocholithiasis_jaundice', 'acute_hepatitis'],
    priorityBoost: 25,
  },
  {
    id: 'drug_exposure_jaundice', label: 'Jaundice Following Drug Exposure',
    description: 'Jaundice within days to weeks of starting new medication = DILI',
    pattern: ['jaundice', 'nausea'],
    suggests: ['drug_induced_liver_injury', 'paracetamol_toxicity'],
    rulesOut: ['acute_hepatitis_a', 'acute_hepatitis_b', 'obstructive_jaundice'],
    priorityBoost: 20,
  },
  {
    id: 'g6pd_crisis_jaundice', label: 'Acute Hemolysis with Dark Urine',
    description: 'Sudden jaundice + dark urine + known oxidant exposure = G6PD deficiency',
    pattern: ['jaundice', 'dark_urine', 'pain_location_now'],
    suggests: ['g6pd_deficiency', 'autoimmune_hemolytic_anemia'],
    rulesOut: ['acute_hepatitis', 'choledocholithiasis_jaundice'],
    priorityBoost: 25,
  },
  {
    id: 'congenital_benign_jaundice', label: 'Asymptomatic Hyperbilirubinemia',
    description: 'Incidental finding of elevated bilirubin in otherwise well patient = Gilbert or Dubin-Johnson',
    pattern: ['jaundice'],
    suggests: ['gilbert_syndrome', 'dubin_johnson', 'rotor_syndrome'],
    rulesOut: ['obstructive_jaundice', 'acute_hepatitis', 'hemolytic_anemia'],
    priorityBoost: 10,
  },
  {
    id: 'gi_bleed_in_jaundice', label: 'GI Bleed in Jaundiced Patient',
    description: 'Hematemesis/melena + jaundice = variceal hemorrhage (portal hypertension)',
    pattern: ['jaundice', 'hematemesis', 'melena'],
    suggests: ['esophageal_varices', 'portal_hypertensive_gastropathy'],
    rulesOut: ['peptic_ulcer_bleeding', 'mallory_weiss_syndrome'],
    priorityBoost: 30,
  },
  {
    id: 'weight_loss_obstructive', label: 'Progressive Jaundice + Weight Loss',
    description: 'Progressive jaundice + weight loss + pruritus = malignant biliary obstruction',
    pattern: ['weight_loss', 'jaundice', 'pruritus'],
    suggests: ['pancreatic_head_cancer', 'cholangiocarcinoma', 'metastatic_liver_disease'],
    rulesOut: ['choledocholithiasis_jaundice', 'acute_hepatitis', 'gilbert_syndrome'],
    priorityBoost: 25,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Bilirubin classification helper
// ═══════════════════════════════════════════════════════════════════════════════

export function classifyBilirubinType(
  urineColor: string,
  stoolColor: string,
  pruritus: string,
  anemia: boolean,
  fever: boolean,
): { bilirubinType: BilirubinType; category: JaundiceCategory; confidence: 'high' | 'moderate' | 'low' } {
  if (urineColor === 'normal' && stoolColor === 'normal' && !pruritus && anemia) {
    return { bilirubinType: 'unconjugated_indirect', category: 'pre_hepatic_hemolytic', confidence: 'high' };
  }
  if (urineColor === 'normal' && stoolColor === 'normal' && !pruritus && !anemia) {
    return { bilirubinType: 'unconjugated_indirect', category: 'congenital', confidence: 'moderate' };
  }
  if (urineColor === 'dark' && stoolColor === 'normal' && fever) {
    return { bilirubinType: 'conjugated_direct', category: 'hepatic_hepatocellular', confidence: 'moderate' };
  }
  if (urineColor === 'dark' && stoolColor === 'normal' && !fever) {
    return { bilirubinType: 'conjugated_direct', category: 'hepatic_hepatocellular', confidence: 'low' };
  }
  if (urineColor === 'dark' && stoolColor === 'pale') {
    return { bilirubinType: 'conjugated_direct', category: 'post_hepatic_obstructive', confidence: 'high' };
  }
  if (urineColor === 'very_dark' && stoolColor === 'clay_colored') {
    return { bilirubinType: 'conjugated_direct', category: 'post_hepatic_obstructive', confidence: 'high' };
  }
  if (urineColor === 'very_dark' && stoolColor === 'normal') {
    return { bilirubinType: 'unconjugated_indirect', category: 'pre_hepatic_hemolytic', confidence: 'moderate' };
  }
  return { bilirubinType: 'unknown', category: 'unknown', confidence: 'low' };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════════════════════════════════

export function getAllJaundiceDiseases(): JaundiceDisease[] {
  return [...PRE_HEPATIC, ...HEPATIC_CELLULAR, ...HEPATIC_CHOLESTATIC, ...POST_HEPATIC, ...OTHER_JAUNDICE];
}

export function getJaundiceDiseasesByCategory(category: JaundiceCategory): JaundiceDisease[] {
  return getAllJaundiceDiseases().filter(d => d.category === category);
}

export function getPreHepatic(): JaundiceDisease[] { return PRE_HEPATIC; }
export function getHepaticCellular(): JaundiceDisease[] { return HEPATIC_CELLULAR; }
export function getHepaticCholestatic(): JaundiceDisease[] { return HEPATIC_CHOLESTATIC; }
export function getPostHepatic(): JaundiceDisease[] { return POST_HEPATIC; }
export function getOtherJaundice(): JaundiceDisease[] { return OTHER_JAUNDICE; }

export function getJaundicePatterns(): JaundicePatternRule[] { return JAUNDICE_PATTERNS; }

export function getJaundiceGaps(
  state: EncounterBrainState,
  answeredFeatureIds: string[],
): InformationGap[] {
  const gaps: InformationGap[] = [];
  const answered = new Set(answeredFeatureIds);

  const JAUNDICE_GAP_DEFS: { id: string; label: string; features: string[]; priority: number; rationale: string; category: InformationGap['category'] }[] = [
    { id: 'jaundice_presence', label: 'Jaundice Recognition', features: ['jaundice'], priority: 100, rationale: 'Confirm visible jaundice or sclerral icterus — the foundational question.', category: 'life_threatening' },
    { id: 'urine_stool', label: 'Urine and Stool Color', features: ['dark_urine', 'pale_stool', 'clay_colored_stool'], priority: 95, rationale: 'Urine/stool color is the single most important discriminator between pre-hepatic, hepatic, and post-hepatic jaundice.', category: 'life_threatening' },
    { id: 'pruritus', label: 'Pruritus (Itching)', features: ['pruritus', 'pruritus_severity'], priority: 85, rationale: 'Severe pruritus suggests cholestatic or obstructive jaundice. Absent in hemolytic and most hepatocellular causes.', category: 'diagnostic' },
    { id: 'pain_pattern', label: 'Pain Pattern', features: ['pain_initial_location', 'pain_character', 'pain_radiation'], priority: 80, rationale: 'Painless jaundice = malignant obstruction. Colicky RUQ pain = stone. RUQ discomfort = hepatitis.', category: 'diagnostic' },
    { id: 'fever_chills', label: 'Fever and Rigors', features: ['fever', 'fever_chills'], priority: 85, rationale: 'High fever with jaundice = cholangitis or hepatitis. Intermittent fever = cholangitis.', category: 'life_threatening' },
    { id: 'weight_loss', label: 'Weight Loss', features: ['weight_loss', 'anorexia'], priority: 75, rationale: 'Weight loss with jaundice = malignancy or chronic liver disease.', category: 'diagnostic' },
    { id: 'anemia_symptoms', label: 'Anemia Symptoms', features: ['fatigue', 'pallor', 'dyspnea_exertion'], priority: 70, rationale: 'Pallor + jaundice = hemolytic anemia. Fatigue is common in all causes.', category: 'diagnostic' },
    { id: 'alcohol_drug', label: 'Alcohol and Drug History', features: ['alcohol_use', 'drug_history', 'paracetamol_overdose', 'herbal_remedies'], priority: 75, rationale: 'Critical context: alcohol, paracetamol, and drug-induced liver injury are common and reversible.', category: 'management' },
    { id: 'hepatitis_risk', label: 'Hepatitis Risk Factors', features: ['ivdu', 'blood_transfusion', 'travel', 'unprotected_sex'], priority: 70, rationale: 'Risk factor assessment for viral hepatitis guides testing and public health measures.', category: 'risk_factor' },
    { id: 'family_history', label: 'Family History of Jaundice', features: ['family_history_jaundice', 'family_history_hemolytic_anemia', 'family_history_gilbert'], priority: 60, rationale: 'Family history of jaundice suggests congenital or hereditary causes.', category: 'risk_factor' },
    { id: 'surgery_instruments', label: 'Prior Biliary Surgery/Instruments', features: ['prior_abdominal_surgery', 'prior_cholecystectomy', 'prior_ercp'], priority: 65, rationale: 'Prior biliary surgery or ERCP = biliary stricture or retained stone.', category: 'management' },
    { id: 'ascites_edema', label: 'Ascites and Edema', features: ['ascites', 'leg_swelling', 'abdominal_distension'], priority: 80, rationale: 'Ascites with jaundice = cirrhosis, Budd-Chiari, or metastatic disease.', category: 'diagnostic' },
    { id: 'encephalopathy', label: 'Encephalopathy / Confusion', features: ['confusion', 'behavioral_change', 'asterixis'], priority: 100, rationale: 'Encephalopathy + jaundice = fulminant hepatic failure — ICU-level emergency.', category: 'life_threatening' },
    { id: 'coagulopathy', label: 'Bleeding / Coagulopathy', features: ['easy_bruising', 'hematemesis', 'melena', 'epistaxis'], priority: 95, rationale: 'Coagulopathy + jaundice = severe liver synthetic dysfunction.', category: 'life_threatening' },
  ];

  for (const def of JAUNDICE_GAP_DEFS) {
    const answeredCount = def.features.filter(f => answered.has(f)).length;
    if (answeredCount === 0) {
      const firstFeature = def.features[0];
      const feature = FEATURES[firstFeature];
      if (feature) {
        gaps.push({
          featureId: firstFeature,
          label: feature.label,
          category: def.category,
          priorityScore: def.priority,
          reasonEssential: def.rationale,
          type: feature.type,
          options: feature.options,
          clinicalGuide: feature.clinicalGuide,
          groupLabel: 'Jaundice Assessment',
        });
      }
    } else if (answeredCount < def.features.length && def.features.length > 1) {
      const unanswered = def.features.find(f => !answered.has(f));
      if (unanswered) {
        const feature = FEATURES[unanswered];
        if (feature) {
          gaps.push({
            featureId: unanswered,
            label: feature.label,
            category: def.category,
            priorityScore: def.priority - 10,
            reasonEssential: def.rationale,
            type: feature.type,
            options: feature.options,
            clinicalGuide: feature.clinicalGuide,
            groupLabel: 'Jaundice Assessment',
          });
        }
      }
    }
  }

  return gaps.sort((a, b) => b.priorityScore - a.priorityScore);
}

export function getJaundicePatternGaps(
  state: EncounterBrainState,
  answeredFeatureIds: string[],
  activeDiseaseStates: Record<string, DiseaseState>,
): InformationGap[] {
  const gaps: InformationGap[] = [];
  const answered = new Set(answeredFeatureIds);

  for (const pattern of JAUNDICE_PATTERNS) {
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
          reasonEssential: `Jaundice pattern "${pattern.label}" partially matched (${patternAnswered.length}/${pattern.pattern.length}). ${pattern.description}`,
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
