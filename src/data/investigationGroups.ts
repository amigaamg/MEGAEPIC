export interface InvestigationGroup {
  id: string;
  label: string;
  icon: string;
  description: string;
  tests: string[];
}

export interface InvestigationWorkspace {
  id: string;
  label: string;
  icon: string;
  color: string;
  description: string;
  groups: InvestigationGroup[];
}

export const INVESTIGATION_WORKSPACES: InvestigationWorkspace[] = [
  {
    id: 'respiratory',
    label: 'Respiratory',
    icon: '🫁',
    color: '#dd6b20',
    description: 'Pneumonia, TB, COPD, asthma, COVID-19 workup',
    groups: [
      { id: 'resp-blood', label: 'Blood & Serology', icon: '🩸', description: 'Infection markers, blood gases', tests: ['Full Blood Count (FBC)', 'C-Reactive Protein (CRP)', 'Arterial Blood Gas (ABG)', 'Procalcitonin', 'Blood Culture', 'D-Dimer'] },
      { id: 'resp-micro', label: 'Microbiology', icon: '🦠', description: 'Sputum, cultures, PCR', tests: ['Sputum MCS', 'Sputum AFB (TB)', 'GeneXpert MTB/RIF', 'SARS-CoV-2 PCR', 'Influenza PCR', 'Respiratory Viral Panel'] },
      { id: 'resp-imaging', label: 'Imaging', icon: '🩻', description: 'Chest imaging', tests: ['Chest X-Ray (PA/AP)', 'CT Thorax', 'CT Pulmonary Angiogram (CTPA)', 'Chest Ultrasound'] },
      { id: 'resp-pft', label: 'Pulmonary Function', icon: '💨', description: 'Lung function tests', tests: ['Pulse Oximetry', 'Peak Flow', 'Spirometry (PFTs)', '6-Minute Walk Test'] },
    ],
  },
  {
    id: 'cardiac',
    label: 'Cardiac',
    icon: '❤️',
    color: '#e53e3e',
    description: 'Heart disease, hypertension, arrhythmia, heart failure workup',
    groups: [
      { id: 'cardiac-blood', label: 'Cardiac Biomarkers', icon: '🩸', description: 'Cardiac enzymes, BNP', tests: ['High-Sensitivity Troponin', 'CK-MB', 'BNP / NT-proBNP', 'Lipid Profile', 'D-Dimer'] },
      { id: 'cardiac-ecg', label: 'ECG & Monitoring', icon: '📈', description: 'Rhythm, ischaemia assessment', tests: ['12-Lead ECG', '24h Holter Monitor', 'Exercise Stress Test (EST)'] },
      { id: 'cardiac-imaging', label: 'Cardiac Imaging', icon: '🩻', description: 'Structural & functional imaging', tests: ['2D Echocardiogram', 'Stress Echocardiogram', 'Transesophageal Echo (TEE)', 'CT Coronary Angiogram', 'MRI Cardiac'] },
      { id: 'cardiac-coag', label: 'Coagulation', icon: '💧', description: 'Coagulation status', tests: ['PT/INR', 'APTT', 'Fibrinogen', 'D-Dimer'] },
    ],
  },
  {
    id: 'renal',
    label: 'Renal & Electrolytes',
    icon: '🫘',
    color: '#5a67d8',
    description: 'AKI, CKD, electrolyte disorders, acid-base workup',
    groups: [
      { id: 'renal-blood', label: 'Renal Function', icon: '🩸', description: 'GFR, creatinine, urea', tests: ['Urea & Electrolytes', 'Creatinine / eGFR', 'Serum Albumin', 'Calcium & Phosphate', 'Uric Acid', 'Magnesium'] },
      { id: 'renal-urine', label: 'Urinalysis', icon: '💧', description: 'Urine studies', tests: ['Urinalysis + Microscopy', 'Urine Protein:Creatinine Ratio', '24h Urine Protein', 'Urine Albumin:Creatinine (UACR)', 'Urine Electrolytes'] },
      { id: 'renal-acidbase', label: 'Acid-Base', icon: '⚗️', description: 'Blood gas & acid-base', tests: ['Arterial Blood Gas (ABG)', 'Venous Blood Gas (VBG)', 'Lactate', 'Bicarbonate'] },
      { id: 'renal-imaging', label: 'Renal Imaging', icon: '🩻', description: 'Kidney structure imaging', tests: ['Renal Ultrasound', 'CT Abdomen & Pelvis', 'CT Urogram', 'Renal Doppler'] },
    ],
  },
  {
    id: 'hepatic',
    label: 'Hepatic & GI',
    icon: '🧬',
    color: '#38a169',
    description: 'Liver disease, hepatitis, pancreatitis, GI bleeding workup',
    groups: [
      { id: 'hepatic-blood', label: 'Liver Function', icon: '🩸', description: 'LFTs, enzymes, bilirubin', tests: ['Liver Function Tests (LFTs)', 'Serum Albumin', 'Amylase / Lipase', 'INR', 'Ammonia'] },
      { id: 'hepatic-viral', label: 'Viral Hepatitis', icon: '🦠', description: 'Hepatitis serology', tests: ['HBsAg (Hepatitis B)', 'Anti-HBs', 'Anti-HBc', 'Anti-HCV (Hepatitis C)', 'Anti-HAV IgM'] },
      { id: 'hepatic-imaging', label: 'Abdominal Imaging', icon: '🩻', description: 'Liver, biliary, pancreas imaging', tests: ['Abdominal Ultrasound', 'CT Abdomen & Pelvis', 'MRI Abdomen', 'MRCP'] },
    ],
  },
  {
    id: 'endocrine',
    label: 'Endocrine & Metabolic',
    icon: '🔬',
    color: '#d69e2e',
    description: 'Diabetes, thyroid, adrenal, pituitary workup',
    groups: [
      { id: 'endocrine-diabetes', label: 'Diabetes Assessment', icon: '🍬', description: 'Glucose control', tests: ['Fasting Glucose', 'HbA1c', 'Oral Glucose Tolerance Test (OGTT)', 'Urinalysis + Microscopy'] },
      { id: 'endocrine-lipid', label: 'Lipid Profile', icon: '🧈', description: 'Cholesterol & triglycerides', tests: ['Lipid Profile', 'Fasting Glucose'] },
      { id: 'endocrine-thyroid', label: 'Thyroid Function', icon: '🦋', description: 'Thyroid axis', tests: ['TSH', 'Free T3/T4', 'Anti-TPO Antibodies'] },
      { id: 'endocrine-hormones', label: 'Hormones', icon: '⚡', description: 'Adrenal, pituitary, gonadal', tests: ['Cortisol (AM/Random)', 'Prolactin', 'LH/FSH', 'Testosterone', 'IGF-1', 'PTH', 'Insulin Level'] },
    ],
  },
  {
    id: 'haematology',
    label: 'Haematology',
    icon: '🩸',
    color: '#805ad5',
    description: 'Anaemia, coagulation, malignancy, transfusion workup',
    groups: [
      { id: 'haem-fbc', label: 'Full Blood Count', icon: '🩸', description: 'CBC & differential', tests: ['Full Blood Count (FBC)', 'Blood Film', 'ESR', 'Reticulocyte Count', 'Peripheral Blood Smear'] },
      { id: 'haem-coag', label: 'Coagulation', icon: '💧', description: 'Bleeding & clotting', tests: ['PT/INR', 'APTT', 'Fibrinogen', 'D-Dimer', 'Thrombin Time'] },
      { id: 'haem-nutrition', label: 'Nutritional Anaemia', icon: '🥩', description: 'Iron, B12, folate', tests: ['Serum Ferritin', 'Vitamin B12', 'Folate', 'Iron Studies', 'Transferrin Saturation'] },
      { id: 'haem-tumour', label: 'Tumour Markers', icon: '🧬', description: 'Oncology markers', tests: ['PSA (Total & Free)', 'CA-125', 'CA 19-9', 'CEA', 'AFP', 'Beta-hCG', 'LDH'] },
    ],
  },
  {
    id: 'infectious',
    label: 'Infectious Disease',
    icon: '🦠',
    color: '#dd6b20',
    description: 'HIV, TB, tropical infections, sepsis workup',
    groups: [
      { id: 'infect-hiv', label: 'HIV & STIs', icon: '🧬', description: 'HIV, syphilis, hepatitis', tests: ['HIV Combo (Ag/Ab)', 'HIV Viral Load', 'CD4 Count', 'HBsAg (Hepatitis B)', 'Anti-HCV', 'VDRL/RPR (Syphilis)'] },
      { id: 'infect-tb', label: 'TB Workup', icon: '🦠', description: 'TB diagnostics', tests: ['Sputum AFB (TB)', 'GeneXpert MTB/RIF', 'TB Culture', 'IGRA (T-SPOT / Quantiferon)'] },
      { id: 'infect-tropical', label: 'Tropical Infections', icon: '🦟', description: 'Malaria, dengue, brucella, typhoid', tests: ['Malaria RDT / Film', 'Dengue NS1/IgM', 'Brucella Ab', 'Typhoid (Widal)', 'Leptospira IgM'] },
      { id: 'infect-sepsis', label: 'Sepsis Panel', icon: '⚠️', description: 'Sepsis biomarkers & cultures', tests: ['Blood Culture', 'CRP', 'Procalcitonin', 'Lactate', 'Full Blood Count (FBC)'] },
    ],
  },
  {
    id: 'general',
    label: 'General & Screening',
    icon: '📋',
    color: '#64748b',
    description: 'Routine health screening, pre-op assessment',
    groups: [
      { id: 'gen-preop', label: 'Pre-Operative', icon: '📋', description: 'Pre-surgery workup', tests: ['Full Blood Count (FBC)', 'Urea & Electrolytes', 'PT/INR', 'APTT', 'ECG', 'Chest X-Ray', 'Blood Group & Crossmatch'] },
      { id: 'gen-wellness', label: 'Wellness Screening', icon: '❤️', description: 'Annual health checks', tests: ['Lipid Profile', 'Fasting Glucose', 'HbA1c', 'Urinalysis', 'HIV Combo', 'HBsAg'] },
      { id: 'gen-pregnancy', label: 'Obstetric', icon: '🤰', description: 'Pregnancy-related tests', tests: ['Beta-hCG', 'Urinalysis', 'Blood Group & Rh', 'HIV Combo', 'OGTT', 'Ultrasound Obstetric'] },
    ],
  },
];

/* ═══ ENRICHED PANEL DEFINITIONS ═══ */
export interface PanelAnalyte { name: string; unit: string; refRange: string; lowLabel?: string; highLabel?: string; criticalLow?: number; criticalHigh?: number; }
export interface PanelSection { label: string; icon: string; analytes: PanelAnalyte[]; }
export interface PanelDefinition { name: string; purpose: string; sections: PanelSection[]; interpretationQuestions: string[]; }

export const PANEL_DEFINITIONS: Record<string, PanelDefinition> = {
  'Full Blood Count (FBC)': {
    name: 'Full Blood Count (FBC)',
    purpose: 'Baseline haematologic assessment: anaemia, infection, clotting, marrow function',
    sections: [
      { label: 'Red Cell Parameters', icon: '🔴', analytes: [
        { name: 'Hb', unit: 'g/dL', refRange: '13-17', lowLabel: 'Anaemia', highLabel: 'Polycythaemia', criticalLow: 5, criticalHigh: 20 },
        { name: 'RBC Count', unit: 'x10^12/L', refRange: '4.5-5.5', lowLabel: 'Anaemia', highLabel: 'Polycythaemia' },
        { name: 'Hct', unit: '%', refRange: '40-50', lowLabel: 'Anaemia/haemodilution', highLabel: 'Haemoconcentration' },
        { name: 'MCV', unit: 'fL', refRange: '80-100', lowLabel: 'Microcytic (IDA/thalassaemia)', highLabel: 'Macrocytic (B12/folate)' },
        { name: 'MCH', unit: 'pg', refRange: '27-32', lowLabel: 'Hypochromic', highLabel: 'Macrocytic' },
        { name: 'MCHC', unit: 'g/dL', refRange: '32-36', lowLabel: 'Hypochromic', highLabel: 'Spherocytosis' },
        { name: 'RDW', unit: '%', refRange: '11.5-14.5', lowLabel: '—', highLabel: 'Anisocytosis (IDA/B12/folate)' },
      ]},
      { label: 'White Cell Parameters', icon: '⚪', analytes: [
        { name: 'WBC Count', unit: 'x10^9/L', refRange: '4-11', lowLabel: 'Leukopenia (sepsis/marrow)', highLabel: 'Leukocytosis (infection/inflammation)', criticalHigh: 50 },
        { name: 'Neutrophils', unit: '%', refRange: '40-70', lowLabel: 'Neutropenia (viral/drug/marrow)', highLabel: 'Neutrophilia (bacterial/steroid)' },
        { name: 'Lymphocytes', unit: '%', refRange: '20-40', lowLabel: 'Lymphopenia (HIV/steroid)', highLabel: 'Lymphocytosis (viral/CLL)' },
        { name: 'Monocytes', unit: '%', refRange: '2-8', lowLabel: '—', highLabel: 'Monocytosis (TB/recovery)' },
        { name: 'Eosinophils', unit: '%', refRange: '1-4', lowLabel: '—', highLabel: 'Eosinophilia (allergy/parasite)' },
        { name: 'Basophils', unit: '%', refRange: '0-1', lowLabel: '—', highLabel: 'Basophilia (CML/mycloproliferative)' },
      ]},
      { label: 'Platelet Parameters', icon: '🩸', analytes: [
        { name: 'Platelet Count', unit: 'x10^9/L', refRange: '150-400', lowLabel: 'Thrombocytopenia (bleeding/ITP/marrow)', highLabel: 'Thrombocytosis (reactive/myeloproliferative)', criticalLow: 20, criticalHigh: 1000 },
        { name: 'MPV', unit: 'fL', refRange: '7-12', lowLabel: '—', highLabel: 'Large platelets (turnover/immune)' },
      ]},
      { label: 'Inflammatory Markers', icon: '🔥', analytes: [
        { name: 'ESR', unit: 'mm/hr', refRange: '0-20', lowLabel: '—', highLabel: 'Inflammation/infection/malignancy' },
      ]},
    ],
    interpretationQuestions: [
      'Anaemia pattern? (normocytic/microcytic/macrocytic)',
      'White cell abnormality? (neutrophilia/lymphocytosis/eosinophilia)',
      'Thrombocytopenia or thrombocytosis?',
      'Blasts or immature cells seen?',
      'Likely aetiology?',
    ],
  },
  'Liver Function Tests (LFTs)': {
    name: 'Liver Function Tests (LFTs)',
    purpose: 'Hepatocellular injury, cholestasis, synthetic function, biliary obstruction',
    sections: [
      { label: 'Hepatocellular Injury', icon: '🧬', analytes: [
        { name: 'ALT', unit: 'U/L', refRange: '5-40', lowLabel: '—', highLabel: 'Hepatocellular injury (viral/drug/NASH)' },
        { name: 'AST', unit: 'U/L', refRange: '5-40', lowLabel: '—', highLabel: 'Hepatocellular injury (alcohol/NASH/viral)' },
      ]},
      { label: 'Cholestatic Enzymes', icon: '🟢', analytes: [
        { name: 'ALP', unit: 'U/L', refRange: '40-130', lowLabel: '—', highLabel: 'Cholestasis (biliary obstruction/infiltrative)' },
        { name: 'GGT', unit: 'U/L', refRange: '5-40', lowLabel: '—', highLabel: 'Biliary/hepatic (alcohol/drug)' },
      ]},
      { label: 'Bilirubin Fractions', icon: '🟡', analytes: [
        { name: 'Total Bilirubin', unit: 'mg/dL', refRange: '0.1-1.2', lowLabel: '—', highLabel: 'Jaundice (pre-hepatic/hepatic/post-hepatic)' },
        { name: 'Direct Bilirubin', unit: 'mg/dL', refRange: '0-0.3', lowLabel: '—', highLabel: 'Obstructive jaundice' },
      ]},
      { label: 'Synthetic Function', icon: '🛡️', analytes: [
        { name: 'Total Protein', unit: 'g/dL', refRange: '6-8', lowLabel: 'Hypoproteinaemia (liver/nutrition/nephrotic)', highLabel: 'Hyperproteinaemia (myeloma/dehydration)' },
        { name: 'Albumin', unit: 'g/dL', refRange: '3.5-5', lowLabel: 'Chronic liver disease/nephrotic/malnutrition', highLabel: 'Dehydration' },
        { name: 'Globulin', unit: 'g/dL', refRange: '2-3.5', lowLabel: 'Immunodeficiency', highLabel: 'Chronic inflammation/myeloma' },
        { name: 'A/G Ratio', unit: '', refRange: '1-2', lowLabel: 'Chronic liver disease/nephrotic', highLabel: '—' },
      ]},
      { label: 'Pancreatic Enzymes', icon: '🔪', analytes: [
        { name: 'Amylase', unit: 'U/L', refRange: '30-110', lowLabel: '—', highLabel: 'Pancreatitis/parotitis/ectopic' },
        { name: 'Lipase', unit: 'U/L', refRange: '0-160', lowLabel: '—', highLabel: 'Pancreatitis (more specific than amylase)' },
      ]},
    ],
    interpretationQuestions: [
      'Hepatocellular vs cholestatic pattern?',
      'Acute vs chronic liver disease?',
      'Synthetic function preserved? (albumin, INR)',
      'Biliary obstruction present?',
      'Likely aetiology? (viral/alcohol/NASH/drug)',
    ],
  },
  'Urea & Electrolytes': {
    name: 'Urea & Electrolytes (Renal Function)',
    purpose: 'Kidney function, electrolyte balance, acid-base status, hydration assessment',
    sections: [
      { label: 'Electrolytes', icon: '⚡', analytes: [
        { name: 'Sodium', unit: 'mmol/L', refRange: '135-145', lowLabel: 'Hyponatraemia (SIADH/diuretics/fluid overload)', highLabel: 'Hypernatraemia (dehydration/DI)', criticalLow: 120, criticalHigh: 160 },
        { name: 'Potassium', unit: 'mmol/L', refRange: '3.5-5.0', lowLabel: 'Hypokalaemia (diuretics/ diarrhoea/Conn)', highLabel: 'Hyperkalaemia (AKI/ACEi/CRF)', criticalLow: 2.5, criticalHigh: 6.5 },
        { name: 'Chloride', unit: 'mmol/L', refRange: '96-106', lowLabel: 'Hypochloraemia (vomiting/diuretics)', highLabel: 'Hyperchloraemia (dehydration/RTA)' },
        { name: 'Bicarbonate', unit: 'mmol/L', refRange: '22-29', lowLabel: 'Metabolic acidosis (DKA/renal/ diarrhoea)', highLabel: 'Metabolic alkalosis (vomiting/diuretics)' },
      ]},
      { label: 'Renal Markers', icon: '🫘', analytes: [
        { name: 'Urea', unit: 'mmol/L', refRange: '2.5-7.5', lowLabel: 'Liver disease/malnutrition/overhydration', highLabel: 'AKI/dehydration/GI bleed/high protein' },
        { name: 'Creatinine', unit: 'umol/L', refRange: '60-110', lowLabel: 'Low muscle mass/ pregnancy', highLabel: 'AKI/CKD/dehydration', criticalHigh: 500 },
        { name: 'eGFR', unit: 'mL/min', refRange: '>60', lowLabel: 'CKD/ AKI', highLabel: '—' },
        { name: 'BUN:Creatinine Ratio', unit: '', refRange: '10-20', lowLabel: 'Liver disease', highLabel: 'Dehydration/GI bleed' },
      ]},
      { label: 'Bone & Mineral', icon: '🦴', analytes: [
        { name: 'Calcium', unit: 'mmol/L', refRange: '2.2-2.6', lowLabel: 'Hypocalcaemia (CKD/hypopara/vitD)', highLabel: 'Hypercalcaemia (malignancy/hyperpara/myeloma)', criticalHigh: 3.0 },
        { name: 'Phosphate', unit: 'mmol/L', refRange: '0.8-1.5', lowLabel: 'Hyperparathyroidism/vitD/refeeding', highLabel: 'CKD/hypopara/tumour lysis' },
        { name: 'Magnesium', unit: 'mmol/L', refRange: '0.7-1.1', lowLabel: 'Hypomagnesaemia (diuretics/PPI/malabsorption)', highLabel: 'CKD/ supplements' },
        { name: 'Uric Acid', unit: 'umol/L', refRange: '200-430', lowLabel: '—', highLabel: 'Gout/tumour lysis/CKD/dehydration' },
      ]},
    ],
    interpretationQuestions: [
      'AKI or CKD pattern? (creatinine/eGFR trend)',
      'Electrolyte abnormality? (Na/K/Cl/HCO3)',
      'Metabolic acidosis or alkalosis?',
      'Dehydration or fluid overload?',
      'Calcium/phosphate abnormality suggesting bone/mineral disease?',
    ],
  },
  'Lipid Profile': {
    name: 'Lipid Profile',
    purpose: 'ASCVD risk assessment, metabolic syndrome, statin response monitoring',
    sections: [
      { label: 'Cholesterol Panel', icon: '🧈', analytes: [
        { name: 'Total Cholesterol', unit: 'mmol/L', refRange: '<5.2', lowLabel: '—', highLabel: 'Hypercholesterolaemia (ASCVD risk)' },
        { name: 'LDL Cholesterol', unit: 'mmol/L', refRange: '<3.0', lowLabel: '—', highLabel: 'Atherogenic dyslipidaemia (primary target)' },
        { name: 'HDL Cholesterol', unit: 'mmol/L', refRange: '>1.0', lowLabel: 'Metabolic syndrome/diabetes/smoking', highLabel: 'Cardioprotective' },
        { name: 'Triglycerides', unit: 'mmol/L', refRange: '<1.7', lowLabel: '—', highLabel: 'Hypertriglyceridaemia (metabolic/genetic)' },
        { name: 'VLDL', unit: 'mmol/L', refRange: '0.2-0.8', lowLabel: '—', highLabel: 'Hypertriglyceridaemia' },
        { name: 'Non-HDL Cholesterol', unit: 'mmol/L', refRange: '<3.8', lowLabel: '—', highLabel: 'Atherogenic dyslipidaemia' },
        { name: 'Total/HDL Ratio', unit: '', refRange: '<5.0', lowLabel: '—', highLabel: 'Increased ASCVD risk' },
      ]},
    ],
    interpretationQuestions: [
      'LDL goal achieved based on ASCVD risk category?',
      'Metabolic syndrome pattern? (high TG, low HDL)',
      'Statin response adequate?',
      'Secondary causes? (diabetes/hypothyroid/renal)',
      'Need for intensified therapy?',
    ],
  },
  'Coagulation Panel': {
    name: 'Coagulation Panel',
    purpose: 'Bleeding risk, anticoagulation monitoring, liver synthetic function, DIC assessment',
    sections: [
      { label: 'Coagulation Factors', icon: '💧', analytes: [
        { name: 'PT/INR', unit: 'sec', refRange: '0.8-1.2', lowLabel: '—', highLabel: 'Warfarin/liver disease/vitK deficiency/DIC', criticalHigh: 5 },
        { name: 'APTT', unit: 'sec', refRange: '25-35', lowLabel: '—', highLabel: 'Haemophilia/heparin/lupus anticoagulant' },
        { name: 'Thrombin Time', unit: 'sec', refRange: '14-21', lowLabel: '—', highLabel: 'Heparin/DIC/hypofibrinogenaemia' },
        { name: 'Fibrinogen', unit: 'g/L', refRange: '2-4', lowLabel: 'DIC/liver disease/massive transfusion', highLabel: 'Acute phase/inflammation/pregnancy' },
        { name: 'D-Dimer', unit: 'mg/L', refRange: '<0.5', lowLabel: '—', highLabel: 'DVT/PE/DIC/post-surgery/COVID' },
      ]},
    ],
    interpretationQuestions: [
      'Prolonged PT/INR → warfarin? liver disease? vitK deficiency?',
      'Prolonged APTT → haemophilia? heparin? lupus anticoagulant?',
      'Low fibrinogen → DIC? liver failure?',
      'Elevated D-dimer → VTE? DIC? post-op?',
      'Bleeding risk assessment for procedure?',
    ],
  },
  'Arterial Blood Gas (ABG)': {
    name: 'Arterial Blood Gas (ABG)',
    purpose: 'Acid-base status, oxygenation, ventilation, metabolic/respiratory disorders',
    sections: [
      { label: 'Acid-Base Status', icon: '⚗️', analytes: [
        { name: 'pH', unit: '', refRange: '7.35-7.45', lowLabel: 'Acidaemia (respiratory/metabolic acidosis)', highLabel: 'Alkalaemia (respiratory/metabolic alkalosis)', criticalLow: 7.2, criticalHigh: 7.6 },
        { name: 'pCO2', unit: 'mmHg', refRange: '35-45', lowLabel: 'Respiratory alkalosis (hyperventilation/PE/liver)', highLabel: 'Respiratory acidosis (hypoventilation/COPD/sedation)', criticalHigh: 60 },
        { name: 'HCO3', unit: 'mmol/L', refRange: '22-29', lowLabel: 'Metabolic acidosis (DKA/renal/diarrhoea/lactic)', highLabel: 'Metabolic alkalosis (vomiting/diuretics/contraction)' },
        { name: 'Base Excess', unit: 'mmol/L', refRange: '-2 to +2', lowLabel: 'Metabolic acidosis (base deficit)', highLabel: 'Metabolic alkalosis (base excess)' },
      ]},
      { label: 'Oxygenation', icon: '🫁', analytes: [
        { name: 'pO2', unit: 'mmHg', refRange: '80-100', lowLabel: 'Hypoxaemia (shunt/VQ mismatch/hypoventilation)', highLabel: 'Hyperoxaemia (supplemental O2)', criticalLow: 60 },
        { name: 'O2 Saturation', unit: '%', refRange: '95-100', lowLabel: 'Hypoxaemia', highLabel: '—', criticalLow: 90 },
        { name: 'FiO2', unit: '%', refRange: '21-100', lowLabel: '—', highLabel: '—' },
        { name: 'P/F Ratio', unit: '', refRange: '>300', lowLabel: 'ARDS (<200)/severe (<100)', highLabel: '—' },
      ]},
      { label: 'Tissue Perfusion', icon: '🔥', analytes: [
        { name: 'Lactate', unit: 'mmol/L', refRange: '0.5-2.0', lowLabel: '—', highLabel: 'Tissue hypoperfusion/ischaemia/sepsis/seizures', criticalHigh: 4 },
      ]},
    ],
    interpretationQuestions: [
      'Respiratory vs metabolic acidosis/alkalosis? (Winters formula, delta ratio)',
      'Compensation appropriate? (acute vs chronic)',
      'Hypoxaemia present? A-a gradient calculated?',
      'Lactate elevated → hypoperfusion/ischaemia?',
      'Clinical context? (DKA/COPD/PE/sepsis/renal failure)',
    ],
  },
  'Iron Studies': {
    name: 'Iron Studies',
    purpose: 'Iron deficiency vs overload, anaemia workup, haemochromatosis screening',
    sections: [
      { label: 'Iron Status', icon: '🔩', analytes: [
        { name: 'Serum Iron', unit: 'umol/L', refRange: '11-28', lowLabel: 'Iron deficiency', highLabel: 'Iron overload/haemolysis/transfusion' },
        { name: 'Serum Ferritin', unit: 'ug/L', refRange: '20-300', lowLabel: 'Iron deficiency (absolute)', highLabel: 'Iron overload/inflammation/malignancy/liver disease' },
        { name: 'TIBC', unit: 'umol/L', refRange: '45-75', lowLabel: 'Iron overload/chronic disease', highLabel: 'Iron deficiency' },
        { name: 'Transferrin Saturation', unit: '%', refRange: '15-45', lowLabel: 'Iron deficiency', highLabel: 'Iron overload/haemochromatosis' },
        { name: 'UIBC', unit: 'umol/L', refRange: '25-50', lowLabel: 'Iron overload', highLabel: 'Iron deficiency' },
      ]},
    ],
    interpretationQuestions: [
      'Iron deficiency pattern? (low ferritin, low iron, high TIBC, low sat)',
      'Iron overload pattern? (high ferritin, high sat, low TIBC)',
      'Ferritin confounded by inflammation? (acute phase reactant)',
      'Anaemia of chronic disease? (normal/high ferritin, low iron)',
      'Need for further workup? (haemochromatosis genes, bone marrow)',
    ],
  },
  'Urinalysis + Microscopy': {
    name: 'Urinalysis + Microscopy',
    purpose: 'UTI, haematuria, proteinuria, renal disease, metabolic screening',
    sections: [
      { label: 'Physical & Chemical', icon: '💧', analytes: [
        { name: 'Color', unit: '', refRange: 'Yellow/Amber', lowLabel: '—', highLabel: 'Dark/deep (dehydration/haematuria/hepatitis)' },
        { name: 'Appearance', unit: '', refRange: 'Clear', lowLabel: '—', highLabel: 'Turbid (UTI/pus/crystals/phosphates)' },
        { name: 'Specific Gravity', unit: '', refRange: '1.005-1.030', lowLabel: 'Low (<1.005) DI/overhydration', highLabel: 'High (>1.030) dehydration/contrast' },
        { name: 'pH', unit: '', refRange: '5-8', lowLabel: 'Acidic (metabolic acidosis/DKA)', highLabel: 'Alkaline (UTI/renal tubular acidosis/stones)' },
        { name: 'Protein', unit: 'g/L', refRange: 'Neg', lowLabel: '—', highLabel: 'Proteinuria (glomerular/tubular/overflow)' },
        { name: 'Glucose', unit: '', refRange: 'Neg', lowLabel: '—', highLabel: 'Glycosuria (diabetes/renal threshold)' },
        { name: 'Ketones', unit: '', refRange: 'Neg', lowLabel: '—', highLabel: 'Ketosis (DKA/starvation/alcohol)' },
        { name: 'Blood', unit: '', refRange: 'Neg', lowLabel: '—', highLabel: 'Haematuria (UTI/stone/trauma/glomerular)' },
        { name: 'Leukocytes', unit: '', refRange: 'Neg', lowLabel: '—', highLabel: 'Leukocyturia (UTI/inflammation)' },
        { name: 'Nitrites', unit: '', refRange: 'Neg', lowLabel: '—', highLabel: 'Nitrite positive (enteric bacteria/UTI)' },
        { name: 'Urobilinogen', unit: '', refRange: 'Normal', lowLabel: '—', highLabel: 'Haemolysis/liver disease' },
        { name: 'Bilirubin', unit: '', refRange: 'Neg', lowLabel: '—', highLabel: 'Obstructive jaundice/hepatocellular disease' },
      ]},
      { label: 'Microscopy Sediment', icon: '🔬', analytes: [
        { name: 'Casts', unit: '/hpf', refRange: '0-2', lowLabel: '—', highLabel: 'RBC casts (glomerulonephritis), WBC casts (pyelonephritis), granular (ATN)' },
        { name: 'Crystals', unit: '', refRange: 'None', lowLabel: '—', highLabel: 'CaOx (ethylene glycol/hyperoxaluria), uric acid, triple phosphate' },
        { name: 'Bacteria', unit: '', refRange: 'None', lowLabel: '—', highLabel: 'Bacteriuria (UTI/contamination)' },
        { name: 'Epithelial Cells', unit: '/hpf', refRange: '0-5', lowLabel: '—', highLabel: 'Squamous (contamination), transitional/renal (pathological)' },
        { name: 'RBC', unit: '/hpf', refRange: '0-3', lowLabel: '—', highLabel: 'Haematuria (dysmorphic → glomerular)' },
        { name: 'WBC', unit: '/hpf', refRange: '0-5', lowLabel: '—', highLabel: 'Pyuria (UTI/inflammation/TB)' },
        { name: 'Yeast Cells', unit: '', refRange: 'None', lowLabel: '—', highLabel: 'Candida (UTI/contamination/diabetes)' },
        { name: 'Trichomonas', unit: '', refRange: 'None', lowLabel: '—', highLabel: 'Trichomoniasis (STI)' },
      ]},
    ],
    interpretationQuestions: [
      'UTI pattern? (nitrites, leukocytes, bacteria, WBCs)',
      'Haematuria workup? (RBC casts suggest glomerular)',
      'Proteinuria significant? (glomerular vs tubular vs overflow)',
      'Casts present? (RBC → GN, WBC → pyelo, granular → ATN)',
      'Crystalluria? (stone risk, ethylene glycol, uric acid)',
    ],
  },
  'Blood Film': {
    name: 'Blood Film (Peripheral Blood Smear)',
    purpose: 'RBC/WBC/platelet morphology assessment, parasite detection, leukaemia/lymphoma screening',
    sections: [
      { label: 'RBC Morphology', icon: '🔴', analytes: [
        { name: 'RBC Morphology', unit: '', refRange: 'Normocytic, normochromic', lowLabel: '—', highLabel: 'See description' },
        { name: 'Anisocytosis', unit: '', refRange: 'Minimal', lowLabel: '—', highLabel: 'IDA/B12/folate/myelodysplasia' },
        { name: 'Poikilocytosis', unit: '', refRange: 'Minimal', lowLabel: '—', highLabel: 'Sickle/thal/MAHA/myelofibrosis' },
        { name: 'Hypochromasia', unit: '', refRange: 'None', lowLabel: '—', highLabel: 'Iron deficiency/thalassaemia' },
        { name: 'Polychromasia', unit: '', refRange: 'Minimal', lowLabel: '—', highLabel: 'Haemolysis/reticulocytosis' },
        { name: 'Nucleated RBCs', unit: '/100WBC', refRange: '0', lowLabel: '—', highLabel: 'Marrow infiltration/haemolysis/severe hypoxia' },
        { name: 'RBC Inclusions', unit: '', refRange: 'None', lowLabel: '—', highLabel: 'Howell-Jolly (hyposplenism), Basophilic stippling (lead/thal), Pappenheimer (sideroblastic)' },
        { name: 'Parasites Seen', unit: '', refRange: 'None', lowLabel: '—', highLabel: 'Malaria (P.falciparum/vivax/ovale/malariae), Babesia' },
      ]},
      { label: 'WBC Morphology', icon: '⚪', analytes: [
        { name: 'WBC Morphology', unit: '', refRange: 'Normal maturation', lowLabel: '—', highLabel: 'See description' },
        { name: 'Blast Cells', unit: '%', refRange: '0', lowLabel: '—', highLabel: 'Acute leukaemia (AML/ALL)' },
        { name: 'Band Forms', unit: '%', refRange: '0-5', lowLabel: '—', highLabel: 'Left shift (infection/inflammation)' },
        { name: 'Atypical Lymphocytes', unit: '', refRange: 'None', lowLabel: '—', highLabel: 'EBV/CMV/viral infection' },
        { name: 'Dohle Bodies', unit: '', refRange: 'None', lowLabel: '—', highLabel: 'Infection/inflammation/sepsis' },
        { name: 'Toxic Granulation', unit: '', refRange: 'None', lowLabel: '—', highLabel: 'Bacterial infection/sepsis' },
      ]},
      { label: 'Platelet Morphology', icon: '🩸', analytes: [
        { name: 'Platelet Estimate', unit: '/uL', refRange: '150-400', lowLabel: 'Thrombocytopenia (ITP/TTP/DIC/marrow)', highLabel: 'Thrombocytosis (reactive/myeloproliferative)' },
        { name: 'Clumps', unit: '', refRange: 'None', lowLabel: '—', highLabel: 'EDTA-dependent pseudothrombocytopenia' },
        { name: 'Giant Platelets', unit: '', refRange: 'None', lowLabel: '—', highLabel: 'Immune destruction/BM recovery/BSS' },
      ]},
    ],
    interpretationQuestions: [
      'RBC abnormalities? (haemolysis/IDA/thalassaemia/sickle)',
      'White cell abnormality? (leukaemia/left shift/atypical)',
      'Platelet count and morphology?',
      'Malaria or other parasites seen?',
      'Blast cells present → acute leukaemia?',
    ],
  },
  'Chest X-Ray (PA/AP)': {
    name: 'Chest X-Ray (PA/AP)',
    purpose: 'Chest radiograph interpretation for cardiopulmonary pathology',
    sections: [
      { label: 'Technique & Quality', icon: '📐', analytes: [
        { name: 'Projection', unit: '', refRange: 'PA/AP/Lateral', lowLabel: '—', highLabel: '—' },
        { name: 'Rotation', unit: '', refRange: 'None/minimal', lowLabel: '—', highLabel: 'Significant (limits assessment)' },
        { name: 'Inspiration', unit: '', refRange: 'Adequate', lowLabel: '—', highLabel: 'Poor (crowding, pseudo-cardiomegaly)' },
        { name: 'Penetration', unit: '', refRange: 'Adequate', lowLabel: 'Over-penetrated', highLabel: 'Under-penetrated' },
      ]},
      { label: 'Airways & Lungs', icon: '🫁', analytes: [
        { name: 'Trachea', unit: '', refRange: 'Central', lowLabel: '—', highLabel: 'Deviated (tension PTX/thyroid/mass)' },
        { name: 'Lung Fields', unit: '', refRange: 'Clearly aerated', lowLabel: '—', highLabel: 'Consolidation/effusion/mass/nodule/cavity' },
        { name: 'Bronchovascular Markings', unit: '', refRange: 'Normal', lowLabel: '—', highLabel: 'Prominent (pulmonary oedema/fibrosis)' },
        { name: 'Pleura', unit: '', refRange: 'Clear', lowLabel: '—', highLabel: 'Effusion/pneumothorax/pleural thickening' },
      ]},
      { label: 'Cardiomediastinum', icon: '❤️', analytes: [
        { name: 'Cardiac Silhouette', unit: '', refRange: 'Normal size/shape', lowLabel: '—', highLabel: 'Cardiomegaly/pericardial effusion' },
        { name: 'Mediastinal Width', unit: '', refRange: 'Normal', lowLabel: '—', highLabel: 'Wide (aortic dissection/lymphadenopathy/mass)' },
        { name: 'Aorta', unit: '', refRange: 'Normal calibre', lowLabel: '—', highLabel: 'Tortuous/aneurysmal/calcified' },
        { name: 'Hilar Regions', unit: '', refRange: 'Normal', lowLabel: '—', highLabel: 'Prominent (lymphadenopathy/PA hypertension/mass)' },
      ]},
      { label: 'Bones & Soft Tissues', icon: '🦴', analytes: [
        { name: 'Ribs', unit: '', refRange: 'Intact', lowLabel: '—', highLabel: 'Fracture/lytic lesion/notching' },
        { name: 'Thoracic Spine', unit: '', refRange: 'Normal alignment', lowLabel: '—', highLabel: 'Fracture/osteoporosis/scoliosis' },
        { name: 'Clavicles', unit: '', refRange: 'Intact', lowLabel: '—', highLabel: 'Fracture/erosion' },
        { name: 'Soft Tissues', unit: '', refRange: 'Normal', lowLabel: '—', highLabel: 'Subcutaneous emphysema/surgical emphysema' },
      ]},
    ],
    interpretationQuestions: [
      'Normal study? Abnormalities identified?',
      'Consolidation → pneumonia? (lobar/broncho/interstitial)',
      'Pleural effusion? Pneumothorax?',
      'Cardiomegaly? Pulmonary oedema? (heart failure)',
      'Mass/nodule/cavity → neoplasm/TB?',
    ],
  },
  '12-Lead ECG': {
    name: '12-Lead ECG',
    purpose: 'Cardiac rhythm, ischaemia, conduction abnormalities, chamber enlargement',
    sections: [
      { label: 'Rhythm & Rate', icon: '📈', analytes: [
        { name: 'Rhythm', unit: '', refRange: 'Normal sinus rhythm', lowLabel: '—', highLabel: 'AF/flutter/sinus tach/brady/paced/junctional/VT' },
        { name: 'Ventricular Rate', unit: 'bpm', refRange: '60-100', lowLabel: 'Bradycardia (sinus/block/fib), symptomatic?', highLabel: 'Tachycardia (sinus/arrhythmia), symptomatic?', criticalLow: 40, criticalHigh: 150 },
        { name: 'PR Interval', unit: 'ms', refRange: '120-200', lowLabel: 'Pre-excitation (WPW)', highLabel: '1st-degree AV block' },
        { name: 'QRS Duration', unit: 'ms', refRange: '80-120', lowLabel: '—', highLabel: 'BBB/IVCD/ventricular rhythm/paced' },
        { name: 'QT Interval', unit: 'ms', refRange: '<440', lowLabel: '—', highLabel: 'Long QT (drugs/electrolytes/genetic)' },
        { name: 'QTc (Bazett)', unit: 'ms', refRange: '<450 (M), <460 (F)', lowLabel: '—', highLabel: 'Long QT (torsade risk)', criticalHigh: 500 },
      ]},
      { label: 'Axis & Morphology', icon: '🧭', analytes: [
        { name: 'P Wave Morphology', unit: '', refRange: 'Normal', lowLabel: '—', highLabel: 'P mitrale (LAE), P pulmonale (RAE)' },
        { name: 'R Axis', unit: 'deg', refRange: '-30 to +90', lowLabel: 'Left axis (LAFB/inferior MI/COPD)', highLabel: 'Right axis (RVH/PE/lateral MI)' },
        { name: 'T Wave Morphology', unit: '', refRange: 'Normal upright', lowLabel: '—', highLabel: 'Inversion (ischaemia/strain/BBB/PE)' },
        { name: 'ST Segment', unit: '', refRange: 'Isoelectric', lowLabel: '—', highLabel: 'Elevation (STEMI/pericarditis/BER) or depression (ischaemia/strain/digoxin)' },
        { name: 'Pathological Q Waves', unit: '', refRange: 'None', lowLabel: '—', highLabel: 'Prior MI/hypertrophic cardiomyopathy' },
      ]},
      { label: 'Chamber Enlargement', icon: '❤️', analytes: [
        { name: 'Left Ventricular Hypertrophy', unit: '', refRange: 'No (Sokolow-Lyon <35)', lowLabel: '—', highLabel: 'LVH (hypertension/aortic stenosis/HCM)' },
        { name: 'Right Ventricular Hypertrophy', unit: '', refRange: 'No', lowLabel: '—', highLabel: 'RVH (PA hypertension/PE/valvular)' },
        { name: 'Left Atrial Enlargement', unit: '', refRange: 'No', lowLabel: '—', highLabel: 'LAE (mitral valve/HFpEF/AF)' },
        { name: 'Right Atrial Enlargement', unit: '', refRange: 'No', lowLabel: '—', highLabel: 'RAE (tricuspid/PA hypertension/PE)' },
      ]},
    ],
    interpretationQuestions: [
      'Normal sinus rhythm? Arrhythmia identified?',
      'ST changes → ischaemia/infarct? (STEMI vs NSTEMI vs old)',
      'Conduction abnormality? (BBB/AV block/fascicular)',
      'QT prolongation → torsade risk?',
      'Chamber enlargement/hypertrophy?',
    ],
  },
};
/** Map of panel names → their individual component analytes (computed from definitions) */
export const PANEL_COMPONENTS: Record<string, string[]> = {};
for (const [name, def] of Object.entries(PANEL_DEFINITIONS)) {
  PANEL_COMPONENTS[name] = def.sections.flatMap(s => s.analytes.map(a => a.name));
}

/** Additional panels not in PANEL_DEFINITIONS (legacy/test-only panels — Calcium & Phosphate is not a full panel yet) */
PANEL_COMPONENTS['Calcium & Phosphate'] = ['Calcium', 'Phosphate', 'Corrected Calcium'];

/** Known panels (keys of PANEL_COMPONENTS) */
export const PANEL_NAMES = Object.keys(PANEL_COMPONENTS);

/** Look up the full panel definition by name (exact match) */
export function getPanelDefinition(name: string): PanelDefinition | undefined {
  return PANEL_DEFINITIONS[name.trim()];
}

/** Parse a reference range string like "13-17" or "<5.2" or ">60" into { low, high } */
export function parseRefRange(range: string): { low?: number; high?: number } {
  const s = range.trim();
  if (s.startsWith('<')) return { high: parseFloat(s.slice(1)) };
  if (s.startsWith('>')) return { low: parseFloat(s.slice(1)) };
  const parts = s.split('-').map(p => parseFloat(p.trim()));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) return { low: parts[0], high: parts[1] };
  return {};
}

/** Auto-compute flag for a value given a reference range string */
export function computeFlag(value: string | number, refRange: string): 'Low' | 'Normal' | 'High' | 'Critical' | '' {
  const v = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(v)) return '';
  const { low, high } = parseRefRange(refRange);
  if (low !== undefined && v < low) return 'Low';
  if (high !== undefined && v > high) return 'High';
  return 'Normal';
}

/** Check if a test name is a panel (case-insensitive) */
export function isPanelTest(testName: string): boolean {
  return PANEL_NAMES.some(p => p.toLowerCase() === testName.trim().toLowerCase());
}

/** Get individual component tests for a panel name. Returns [testName] if not a panel. */
export function expandPanel(testName: string): string[] {
  const match = PANEL_NAMES.find(p => p.toLowerCase() === testName.trim().toLowerCase());
  return match ? [...PANEL_COMPONENTS[match]] : [testName.trim()];
}

/** Expand a comma-separated list of test names into individual tests */
export function expandTestList(testList: string[]): string[] {
  return testList.flatMap(t => expandPanel(t));
}

/** For display: expand an order's tests array into individual display items.
 *  Each item gets the original order ID and a single test name.
 *  Panel names are expanded into their component tests. */
export interface OrderDisplayItem {
  id: string;
  test: string;
  index: number;
  total: number;
}
export function expandOrderForDisplay(order: any): OrderDisplayItem[] {
  const tests = (order.tests || []);
  const expanded = expandTestList(tests);
  return expanded.map((test, i) => ({ id: order.id, test, index: i, total: expanded.length }));
}

export function getWorkspaceForTest(testName: string): InvestigationWorkspace | undefined {
  return INVESTIGATION_WORKSPACES.find(w =>
    w.groups.some(g => g.tests.some(t => t.toLowerCase().includes(testName.toLowerCase()) || testName.toLowerCase().includes(t.toLowerCase().split('(')[0].trim())))
  );
}

export function findOrCreateWorkspace(testName: string): InvestigationWorkspace {
  const match = getWorkspaceForTest(testName);
  if (match) return match;
  return INVESTIGATION_WORKSPACES[INVESTIGATION_WORKSPACES.length - 1];
}
