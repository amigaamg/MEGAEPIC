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
};

/** Map of panel names → their individual component analytes (computed from definitions) */
export const PANEL_COMPONENTS: Record<string, string[]> = {};
for (const [name, def] of Object.entries(PANEL_DEFINITIONS)) {
  PANEL_COMPONENTS[name] = def.sections.flatMap(s => s.analytes.map(a => a.name));
}

/** Additional panels not in PANEL_DEFINITIONS (legacy/test-only panels) */
PANEL_COMPONENTS['Arterial Blood Gas (ABG)'] = ['pH', 'pCO2', 'pO2', 'HCO3', 'Base Excess', 'Lactate', 'O2 Saturation'];
PANEL_COMPONENTS['Iron Studies'] = ['Serum Ferritin', 'Serum Iron', 'TIBC', 'Transferrin Saturation', 'UIBC'];
PANEL_COMPONENTS['Calcium & Phosphate'] = ['Calcium', 'Phosphate', 'Corrected Calcium'];
PANEL_COMPONENTS['Urinalysis + Microscopy'] = ['Color', 'Appearance', 'Specific Gravity', 'pH', 'Protein', 'Glucose', 'Ketones', 'Blood', 'Leukocytes', 'Nitrites', 'Urobilinogen', 'Bilirubin', 'Casts', 'Crystals', 'Bacteria', 'Epithelial Cells'];
PANEL_COMPONENTS['Blood Film'] = ['RBC Morphology', 'WBC Morphology', 'Platelet Estimate', 'Parasites Seen'];

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
