// ═══════════════════════════════════════════════════════════════════════════════
// lib/amexan/core.ts
// AMEXAN Clinical Knowledge Operating System — Core Type Definitions
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Department & Specialty Registry ──────────────────────────────────────────

export interface SpecialtyDef {
  id: string;
  label: string;
  icon: string;
  color: string;
  subspecialties: SubspecialtyDef[];
}

export interface SubspecialtyDef {
  id: string;
  label: string;
  icon: string;
  description: string;
  commonDiseases: string[];
}

export const AMEXAN_SPECIALTIES: SpecialtyDef[] = [
  {
    id: 'PAED', label: 'Paediatrics', icon: '👶', color: '#22d3ee',
    subspecialties: [
      { id: 'paediatric-respiratory', label: 'Paediatric Respiratory', icon: '🫁', description: 'Cough, wheeze, respiratory distress, TB, asthma, bronchiolitis', commonDiseases: ['Pneumonia', 'Bronchiolitis', 'Asthma', 'Tuberculosis', 'Croup', 'Foreign Body Aspiration'] },
      { id: 'neonatology', label: 'Neonatology', icon: '👶', description: 'Newborn care, prematurity, NICU, neonatal jaundice', commonDiseases: ['Neonatal Sepsis', 'Neonatal Jaundice', 'Prematurity', 'Birth Asphyxia', 'Neonatal Pneumonia'] },
      { id: 'paediatric-cardiology', label: 'Paediatric Cardiology', icon: '❤️', description: 'Congenital heart disease, murmurs, heart failure', commonDiseases: ['Congenital Heart Disease', 'Rheumatic Fever', 'Kawasaki Disease', 'Infective Endocarditis'] },
      { id: 'paediatric-neurology', label: 'Paediatric Neurology', icon: '🧠', description: 'Seizures, developmental delay, cerebral palsy', commonDiseases: ['Febrile Seizures', 'Epilepsy', 'Cerebral Palsy', 'Meningitis', 'Encephalitis'] },
      { id: 'paediatric-gastro', label: 'Paediatric Gastroenterology', icon: '🩺', description: 'Diarrhoea, malnutrition, abdominal pain', commonDiseases: ['Acute Gastroenteritis', 'Malnutrition', 'Chronic Diarrhoea', 'Celiac Disease'] },
      { id: 'paediatric-nephrology', label: 'Paediatric Nephrology', icon: '💧', description: 'Renal disease, UTI, nephrotic syndrome', commonDiseases: ['Urinary Tract Infection', 'Nephrotic Syndrome', 'Glomerulonephritis', 'AKI'] },
      { id: 'paediatric-haematology', label: 'Paediatric Haematology', icon: '🩸', description: 'Anaemia, sickle cell, bleeding disorders', commonDiseases: ['Sickle Cell Disease', 'Iron Deficiency Anaemia', 'Thalassaemia', 'ITP'] },
      { id: 'paediatric-oncology', label: 'Paediatric Oncology', icon: '⚕️', description: 'Childhood cancers, leukaemia, lymphoma', commonDiseases: ['Acute Lymphoblastic Leukaemia', 'Acute Myeloid Leukaemia', 'Wilms Tumour', 'Neuroblastoma'] },
      { id: 'paediatric-endocrinology', label: 'Paediatric Endocrinology', icon: '🔬', description: 'Growth, puberty, diabetes', commonDiseases: ['Type 1 Diabetes', 'Growth Hormone Deficiency', 'Congenital Hypothyroidism', 'Precocious Puberty'] },
      { id: 'paediatric-infectious', label: 'Paediatric Infectious Disease', icon: '🦠', description: 'Febrile illness, sepsis, tropical infections', commonDiseases: ['Malaria', 'Sepsis', 'Meningitis', 'HIV', 'Tuberculosis', 'Kawasaki Disease'] },
      { id: 'paediatric-emergency', label: 'Paediatric Emergency', icon: '🚨', description: 'Acute presentations, trauma, poisoning, resuscitation', commonDiseases: ['Febrile Seizure', 'Severe Dehydration', 'Poisoning', 'Anaphylaxis', 'Status Epilepticus'] },
      { id: 'developmental-paediatrics', label: 'Developmental Paediatrics', icon: '🧒', description: 'Developmental delay, autism, ADHD', commonDiseases: ['Autism Spectrum Disorder', 'ADHD', 'Global Developmental Delay', 'Cerebral Palsy'] },
      { id: 'picu-nicu', label: 'PICU/NICU', icon: '💓', description: 'Intensive care for critically ill children', commonDiseases: ['Respiratory Failure', 'Septic Shock', 'Cardiac Arrest', 'Status Epilepticus'] },
    ]
  },
  {
    id: 'IM', label: 'Internal Medicine', icon: '🏥', color: '#3b82f6',
    subspecialties: [
      { id: 'general-medicine', label: 'General Medicine', icon: '🏥', description: 'Adult internal medicine', commonDiseases: ['Sepsis', 'Pneumonia', 'UTI', 'Cellulitis', 'Anaemia', 'Electrolyte Disorder'] },
      { id: 'infectious-disease', label: 'Infectious Disease', icon: '🦠', description: 'HIV, TB, tropical medicine', commonDiseases: ['HIV/AIDS', 'Tuberculosis', 'Malaria', 'Sepsis', 'Meningitis', 'COVID-19'] },
      { id: 'rheumatology', label: 'Rheumatology', icon: '🦴', description: 'Autoimmune disease, arthritis', commonDiseases: ['Rheumatoid Arthritis', 'SLE', 'Gout', 'Vasculitis', 'Osteoarthritis'] },
      { id: 'geriatrics', label: 'Geriatrics', icon: '👴', description: 'Elderly care, dementia, polypharmacy', commonDiseases: ['Dementia', 'Falls', 'Delirium', 'Osteoporosis', 'Urinary Incontinence'] },
    ]
  },
  {
    id: 'CARD', label: 'Cardiology', icon: '❤️', color: '#ef4444',
    subspecialties: [
      { id: 'general-cardiology', label: 'General Cardiology', icon: '❤️', description: 'Chest pain, dyspnoea, palpitations', commonDiseases: ['ACS', 'Angina', 'Hypertension', 'Atrial Fibrillation', 'Heart Failure'] },
      { id: 'heart-failure', label: 'Heart Failure', icon: '💔', description: 'HFrEF, HFpEF, acute decompensation', commonDiseases: ['Heart Failure with Reduced EF', 'Heart Failure with Preserved EF', 'Acute Decompensated HF'] },
      { id: 'cardiac-ep', label: 'Electrophysiology', icon: '⚡', description: 'Arrhythmias, pacemakers, ablation', commonDiseases: ['Atrial Fibrillation', 'SVT', 'VT', 'Heart Block', 'Brugada Syndrome'] },
      { id: 'interventional-cardiology', label: 'Interventional Cardiology', icon: '🔪', description: 'PCI, stenting, structural heart', commonDiseases: ['STEMI', 'NSTEMI', 'Stable Angina', 'Valvular Heart Disease'] },
    ]
  },
  {
    id: 'SURG', label: 'General Surgery', icon: '🔪', color: '#94a3b8',
    subspecialties: [
      { id: 'general-surgery', label: 'General Surgery', icon: '🔪', description: 'Acute abdomen, hernia, biliary', commonDiseases: ['Appendicitis', 'Cholecystitis', 'Bowel Obstruction', 'Hernia', 'Peritonitis'] },
      { id: 'trauma', label: 'Trauma Surgery', icon: '🚑', description: 'Polytrauma, haemorrhage, resuscitation', commonDiseases: ['Polytrauma', 'Haemorrhagic Shock', 'Head Injury', 'Chest Trauma', 'Abdominal Trauma'] },
      { id: 'colorectal', label: 'Colorectal Surgery', icon: '🩺', description: 'Colon, rectal, anal surgery', commonDiseases: ['Colorectal Cancer', 'Diverticulitis', 'Haemorrhoids', 'Anal Fissure'] },
      { id: 'breast-surgery', label: 'Breast Surgery', icon: '🎗️', description: 'Breast cancer, breast disease', commonDiseases: ['Breast Cancer', 'Fibroadenoma', 'Mastitis', 'Breast Abscess'] },
    ]
  },
  {
    id: 'OB', label: 'Obstetrics & Gynaecology', icon: '🤱', color: '#f97316',
    subspecialties: [
      { id: 'antenatal', label: 'Antenatal', icon: '🤰', description: 'Pregnancy care, screening', commonDiseases: ['Pre-eclampsia', 'Gestational Diabetes', 'Multiple Pregnancy', 'Obstetric Cholestasis'] },
      { id: 'labour-ward', label: 'Labour Ward', icon: '🏥', description: 'Labour, delivery, emergencies', commonDiseases: ['Obstructed Labour', 'PPH', 'Eclampsia', 'Uterine Rupture', 'Shoulder Dystocia'] },
      { id: 'postnatal', label: 'Postnatal', icon: '👶', description: 'Postpartum care, breastfeeding', commonDiseases: ['PPH', 'Endometritis', 'Mastitis', 'Postpartum Depression'] },
      { id: 'gynaecology', label: 'Gynaecology', icon: '⚕️', description: 'Women health, menstrual disorders', commonDiseases: ['Fibroids', 'Endometriosis', 'PID', 'Ectopic Pregnancy', 'Ovarian Cyst'] },
    ]
  },
  {
    id: 'NEURO', label: 'Neurology', icon: '🧠', color: '#ec4899',
    subspecialties: [
      { id: 'general-neurology', label: 'General Neurology', icon: '🧠', description: 'Headache, movement disorders, neuropathy', commonDiseases: ['Migraine', 'Parkinson Disease', 'Multiple Sclerosis', 'Guillain-Barre Syndrome'] },
      { id: 'stroke', label: 'Stroke Unit', icon: '🩸', description: 'Acute stroke, TIA', commonDiseases: ['Ischaemic Stroke', 'Haemorrhagic Stroke', 'TIA', 'Cerebral Venous Thrombosis'] },
      { id: 'epilepsy', label: 'Epilepsy', icon: '⚡', description: 'Seizure disorders', commonDiseases: ['Epilepsy', 'Status Epilepticus', 'Febrile Seizures', 'Psychogenic Non-epileptic Seizures'] },
    ]
  },
  {
    id: 'PSYCH', label: 'Psychiatry', icon: '💬', color: '#a78bfa',
    subspecialties: [
      { id: 'general-psychiatry', label: 'General Psychiatry', icon: '💬', description: 'Depression, anxiety, psychosis', commonDiseases: ['Major Depressive Disorder', 'Bipolar Disorder', 'Schizophrenia', 'Generalised Anxiety Disorder'] },
      { id: 'child-adolescent', label: 'Child & Adolescent', icon: '👦', description: 'ADHD, autism, behavioural', commonDiseases: ['ADHD', 'Autism Spectrum', 'Conduct Disorder', 'Eating Disorders'] },
      { id: 'addiction', label: 'Addiction Psychiatry', icon: '🔄', description: 'Substance use, detox', commonDiseases: ['Alcohol Dependence', 'Opioid Use Disorder', 'Cocaine Use', 'Benzodiazepine Dependence'] },
    ]
  },
  {
    id: 'RESP', label: 'Respiratory Medicine', icon: '🫁', color: '#06b6d4',
    subspecialties: [
      { id: 'pulmonology', label: 'Pulmonology', icon: '🫁', description: 'Airways, lung disease', commonDiseases: ['COPD', 'Asthma', 'Pneumonia', 'PLE', 'ILD', 'Pleural Effusion'] },
      { id: 'sleep-medicine', label: 'Sleep Medicine', icon: '🌙', description: 'Sleep disorders', commonDiseases: ['OSA', 'Insomnia', 'Restless Leg Syndrome', 'Narcolepsy'] },
    ]
  },
  {
    id: 'RENAL', label: 'Nephrology', icon: '💧', color: '#8b5cf6',
    subspecialties: [
      { id: 'general-nephrology', label: 'General Nephrology', icon: '💧', description: 'CKD, AKI, GN', commonDiseases: ['CKD', 'AKI', 'Glomerulonephritis', 'Nephrotic Syndrome'] },
      { id: 'dialysis', label: 'Dialysis Unit', icon: '🔄', description: 'Haemodialysis, peritoneal dialysis', commonDiseases: ['ESRD', 'Dialysis Complications', 'Peritonitis', 'Vascular Access Issues'] },
    ]
  },
  {
    id: 'GI', label: 'Gastroenterology', icon: '🩺', color: '#10b981',
    subspecialties: [
      { id: 'general-gi', label: 'General GI', icon: '🩺', description: 'GI disorders', commonDiseases: ['GERD', 'PUD', 'IBD', 'IBS', 'Pancreatitis', 'GI Bleed'] },
      { id: 'hepatology', label: 'Hepatology', icon: '🍃', description: 'Liver disease', commonDiseases: ['Hepatitis B/C', 'Cirrhosis', 'NAFLD', 'HCC', 'Liver Failure'] },
    ]
  },
  {
    id: 'ENDO', label: 'Endocrinology', icon: '🔬', color: '#f59e0b',
    subspecialties: [
      { id: 'diabetes', label: 'Diabetes', icon: '💉', description: 'Type 1/2 diabetes, complications', commonDiseases: ['Type 1 DM', 'Type 2 DM', 'DKA', 'HHS'] },
      { id: 'thyroid', label: 'Thyroid', icon: '🔬', description: 'Thyroid disease', commonDiseases: ['Hypothyroidism', 'Hyperthyroidism', 'Thyroid Cancer', 'Goitre'] },
    ]
  },
  {
    id: 'ORTHO', label: 'Orthopaedics', icon: '🦴', color: '#d97706',
    subspecialties: [
      { id: 'general-ortho', label: 'Orthopaedics', icon: '🦴', description: 'Fractures, arthritis, spine', commonDiseases: ['Fractures', 'Septic Arthritis', 'Osteomyelitis', 'Osteoarthritis'] },
      { id: 'sports-medicine', label: 'Sports Medicine', icon: '⚽', description: 'Sports injuries', commonDiseases: ['ACL Tear', 'Meniscal Injury', 'Tendonitis', 'Stress Fracture'] },
    ]
  },
  {
    id: 'DERM', label: 'Dermatology', icon: '🩹', color: '#fb7185',
    subspecialties: [
      { id: 'general-derm', label: 'General Dermatology', icon: '🩹', description: 'Rash, eczema, psoriasis', commonDiseases: ['Eczema', 'Psoriasis', 'Cellulitis', 'Acne', 'Fungal Infections'] },
      { id: 'surgical-derm', label: 'Surgical Dermatology', icon: '🔬', description: 'Skin cancer surgery', commonDiseases: ['BCC', 'SCC', 'Melanoma', 'Sebaceous Cyst'] },
    ]
  },
  {
    id: 'HAEM', label: 'Haematology', icon: '🩸', color: '#ef4444',
    subspecialties: [
      { id: 'general-haem', label: 'General Haematology', icon: '🩸', description: 'Anaemia, coagulation', commonDiseases: ['Iron Deficiency Anaemia', 'B12 Deficiency', 'Sickle Cell', 'ITP', 'DIC'] },
      { id: 'haem-onc', label: 'Haemato-Oncology', icon: '⚕️', description: 'Blood cancers, transplant', commonDiseases: ['Leukaemia', 'Lymphoma', 'Multiple Myeloma', 'MDS'] },
    ]
  },
  {
    id: 'ONCO', label: 'Oncology', icon: '⚕️', color: '#6366f1',
    subspecialties: [
      { id: 'medical-oncology', label: 'Medical Oncology', icon: '💊', description: 'Chemotherapy, targeted therapy', commonDiseases: ['Breast Cancer', 'Lung Cancer', 'Colorectal Cancer', 'Prostate Cancer'] },
      { id: 'radiation-oncology', label: 'Radiation Oncology', icon: '☢️', description: 'Radiotherapy, brachytherapy', commonDiseases: ['Breast Cancer RT', 'Prostate RT', 'Brain RT', 'Palliative RT'] },
      { id: 'palliative-care', label: 'Palliative Care', icon: '🕊️', description: 'End-of-life care, symptom control', commonDiseases: ['Pain Management', 'Nausea Control', 'Terminal Care', 'Advanced Care Planning'] },
    ]
  },
  {
    id: 'EMERG', label: 'Emergency Medicine', icon: '🚨', color: '#f59e0b',
    subspecialties: [
      { id: 'triage', label: 'Triage', icon: '🔢', description: 'Emergency triage', commonDiseases: ['All emergencies'] },
      { id: 'resus', label: 'Resuscitation', icon: '💓', description: 'Cardiac arrest, shock', commonDiseases: ['Cardiac Arrest', 'Shock', 'Respiratory Failure', 'Anaphylaxis'] },
      { id: 'trauma-emerg', label: 'Trauma', icon: '🚑', description: 'Major trauma', commonDiseases: ['Polytrauma', 'Head Injury', 'Spinal Injury', 'Burn'] },
      { id: 'toxicology', label: 'Toxicology', icon: '☠️', description: 'Poisoning, overdose', commonDiseases: ['Paracetamol OD', 'Opioid OD', 'Organophosphate', 'Alcohol Intoxication'] },
    ]
  },
  {
    id: 'ICU', label: 'Critical Care', icon: '💓', color: '#6366f1',
    subspecialties: [
      { id: 'medical-icu', label: 'Medical ICU', icon: '💓', description: 'Medical critical care', commonDiseases: ['Septic Shock', 'ARDS', 'Respiratory Failure', 'DKA'] },
      { id: 'surgical-icu', label: 'Surgical ICU', icon: '🔪', description: 'Post-surgical critical care', commonDiseases: ['Haemorrhagic Shock', 'Post-op Complications', 'Sepsis'] },
    ]
  },
  {
    id: 'ENT', label: 'Ear, Nose & Throat', icon: '👂', color: '#06b6d4',
    subspecialties: [
      { id: 'general-ent', label: 'General ENT', icon: '👂', description: 'Ear, nose, throat disorders', commonDiseases: ['Tonsillitis', 'Otitis Media', 'Sinusitis', 'Hearing Loss'] },
    ]
  },
  {
    id: 'OPHTH', label: 'Ophthalmology', icon: '👁️', color: '#10b981',
    subspecialties: [
      { id: 'general-ophth', label: 'General Ophthalmology', icon: '👁️', description: 'Eye disorders', commonDiseases: ['Cataracts', 'Glaucoma', 'Diabetic Retinopathy', 'Retinal Detachment'] },
    ]
  },
  {
    id: 'URO', label: 'Urology', icon: '🫧', color: '#3b82f6',
    subspecialties: [
      { id: 'general-uro', label: 'General Urology', icon: '🫧', description: 'Urinary tract disorders', commonDiseases: ['BPH', 'Prostate Cancer', 'Renal Stones', 'UTI', 'Urinary Retention'] },
    ]
  },
  {
    id: 'RAD', label: 'Radiology', icon: '📡', color: '#8b5cf6',
    subspecialties: [
      { id: 'general-rad', label: 'General Radiology', icon: '📡', description: 'Diagnostic imaging', commonDiseases: ['Chest X-ray findings', 'CT findings', 'MRI findings'] },
    ]
  },
  {
    id: 'LAB', label: 'Laboratory Medicine', icon: '🧪', color: '#f59e0b',
    subspecialties: [
      { id: 'general-lab', label: 'General Lab', icon: '🧪', description: 'Clinical laboratory', commonDiseases: ['Critical lab values', 'Microbiology', 'Blood Bank'] },
    ]
  },
  {
    id: 'PHARM', label: 'Pharmacy', icon: '💊', color: '#22c55e',
    subspecialties: [
      { id: 'clinical-pharmacy', label: 'Clinical Pharmacy', icon: '💊', description: 'Medication management', commonDiseases: ['Drug interactions', 'Dosing', 'Therapeutic monitoring'] },
    ]
  },
];

// ─── Disease Intelligence Model ────────────────────────────────────────────────

export interface SymptomWeight {
  symptom: string;
  weight: number;        // 0-10, how specific this symptom is for this disease
  prevalence: number;    // 0-100, % of patients with this disease who have this symptom
  category: 'major' | 'minor' | 'red_flag';
}

export interface RiskFactor {
  factor: string;
  weight: number;        // odds ratio or relative risk
  prevalence: number;    // prevalence in general population
}

export interface DifferentialPair {
  disease: string;
  likelihood: number;    // 0-100, how likely it is in the differential
  distinguishingFeatures: string[];
}

export interface Investigation {
  test: string;
  purpose: string;
  timing: 'routine' | 'urgent' | 'emergency';
  sensitivity?: number;
  specificity?: number;
  positiveResult: string;
  negativeResult: string;
}

export interface ImagingStudy {
  modality: string;
  indication: string;
  findings: string;
  sensitivity?: number;
  specificity?: number;
  preparation?: string;
}

export interface SeverityCriterion {
  criterion: string;
  mild: string;
  moderate: string;
  severe: string;
  critical: string;
}

export interface DiagnosticCriterion {
  name: string;
  type: 'major' | 'minor' | 'required';
  description: string;
}

export interface DrugRegimen {
  drug: string;
  dose: string;
  route: string;
  frequency: string;
  duration: string;
  maxDose?: string;
  renalAdjustment?: string;
  hepaticAdjustment?: string;
  pregnancyCategory?: string;
  pediatricDose?: string;
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
}

export interface TreatmentStep {
  step: number;
  therapy: string;
  details: string;
  duration: string;
  monitoring: string[];
  alternatives?: string[];
}

export interface TreatmentGuideline {
  name: string;
  source: string;
  year: number;
  firstLine: DrugRegimen[];
  stepProtocol: TreatmentStep[];
  secondLine?: DrugRegimen[];
  duration: string;
  monitoring: string[];
}

export interface AdmissionCriteria {
  indications: string[];
  level: 'ward' | 'HDU' | 'ICU';
  parameters: { param: string; threshold: string }[];
}

export interface DischargeCriteria {
  clinical: string[];
  lab: string[];
  social: string[];
}

export interface Complication {
  name: string;
  incidence: number;
  timeCourse: string;
  management: string;
  redFlags: string[];
}

export interface FollowUpPlan {
  interval: string;
  duration: string;
  tests: string[];
  specialistReview: boolean;
  specialistTiming?: string;
}

export interface PediatricAdjustment {
  parameter: string;
  adjustment: string;
  ageRange: string;
}

export interface PregnancyAdjustment {
  trimester: 'first' | 'second' | 'third' | 'all' | 'postpartum';
  adjustment: string;
  safety: 'safe' | 'caution' | 'avoid' | 'contraindicated';
  alternative?: string;
}

export interface AIReasoningPattern {
  presentationPattern: string[];
  keyFeatures: string[];
  discriminatingQuestions: string[];
  diagnosticAlgorithm: string[];
}

export interface DiseaseIntelligence {
  id: string;
  name: string;
  specialtyId: string;
  subspecialtyId: string;
  icd10: string;
  epidemiology: {
    incidence: string;
    prevalence: string;
    ageDistribution: string;
    genderPredilection: string;
    geographicDistribution: string;
    seasonality: string;
  };
  symptomWeights: SymptomWeight[];
  riskFactors: RiskFactor[];
  differentials: DifferentialPair[];
  investigations: Investigation[];
  imaging?: ImagingStudy[];
  severityCriteria: SeverityCriterion[];
  diagnosticCriteria: DiagnosticCriterion[];
  treatmentGuidelines: TreatmentGuideline[];
  admissionCriteria: AdmissionCriteria[];
  dischargeCriteria: DischargeCriteria;
  complications: Complication[];
  followUp: FollowUpPlan;
  prognosis: string;
  emergencyFlags: { condition: string; action: string; timeCritical: string }[];
  pediatricAdjustments: PediatricAdjustment[];
  pregnancyAdjustments: PregnancyAdjustment[];
  aiReasoning: AIReasoningPattern;
  clinicalNoteTemplate: {
    sections: string[];
    consultantWording: string;
    exampleNote: string;
  };
}

// ─── Drug Intelligence Model ───────────────────────────────────────────────────

export interface DrugDose {
  indication: string;
  adultDose: string;
  pediatricDose?: string;
  maxDose: string;
  renalAdjustment?: string;
  hepaticAdjustment?: string;
  route: string;
  frequency: string;
  duration?: string;
}

export interface DrugInteraction {
  drug: string;
  severity: 'mild' | 'moderate' | 'severe' | 'contraindicated';
  mechanism: string;
  clinicalEffect: string;
  management: string;
  evidence: string;
}

export interface DrugIntelligence {
  id: string;
  name: string;
  genericName: string;
  class: string;
  mechanism: string;
  indications: string[];
  contraindications: string[];
  cautions: string[];
  doses: DrugDose[];
  forms: string[];
  sideEffects: { common: string[]; serious: string[]; rare: string[] };
  interactions: DrugInteraction[];
  monitoring: string[];
  pregnancy: { category: string; safety: 'safe' | 'caution' | 'avoid' | 'contraindicated'; details: string };
  lactation: string;
  counselling: string;
  overdose: { symptoms: string; treatment: string; antidote?: string };
  specialties: string[];
}

// ─── Intelligence Layer Definition ─────────────────────────────────────────────

export interface IntelligenceLayer {
  name: string;
  description: string;
  enabled: boolean;
  version: string;
  lastUpdated: string;
}

export const AMEXAN_INTELLIGENCE_LAYERS: IntelligenceLayer[] = [
  { name: 'Symptom Weighting Engine', description: 'Per-disease symptom probability and specificity scoring', enabled: true, version: '1.0', lastUpdated: '2026-05-28' },
  { name: 'Differential Diagnosis Engine', description: 'Bayesian differential generation with distinguishing features', enabled: true, version: '1.0', lastUpdated: '2026-05-28' },
  { name: 'Severity Classification System', description: 'Mild/moderate/severe/critical criteria per disease', enabled: true, version: '1.0', lastUpdated: '2026-05-28' },
  { name: 'Investigation Advisor', description: 'Recommended investigations with sensitivity/specificity', enabled: true, version: '1.0', lastUpdated: '2026-05-28' },
  { name: 'Imaging Interpreter', description: 'Findings, indications and preparation for imaging', enabled: true, version: '1.0', lastUpdated: '2026-05-28' },
  { name: 'Treatment Pathway Engine', description: 'Evidence-based step protocols with drug regimens', enabled: true, version: '1.0', lastUpdated: '2026-05-28' },
  { name: 'Admission/Discharge Logic', description: 'Criteria-based admission and discharge decisions', enabled: true, version: '1.0', lastUpdated: '2026-05-28' },
  { name: 'Complication Predictor', description: 'Complications with incidence, timing, and management', enabled: true, version: '1.0', lastUpdated: '2026-05-28' },
  { name: 'Follow-up Scheduler', description: 'Evidence-based follow-up intervals and monitoring', enabled: true, version: '1.0', lastUpdated: '2026-05-28' },
  { name: 'Pediatric Adjustment Layer', description: 'Age-specific adjustments for all pediatric parameters', enabled: true, version: '1.0', lastUpdated: '2026-05-28' },
  { name: 'Pregnancy Adjustment Layer', description: 'Trimester-specific adjustments and safety guidance', enabled: true, version: '1.0', lastUpdated: '2026-05-28' },
  { name: 'AI Reasoning Engine', description: 'Diagnostic algorithms and discriminating questions', enabled: true, version: '1.0', lastUpdated: '2026-05-28' },
  { name: 'Clinical Note Generator', description: 'Consultant-grade clinical note templates and examples', enabled: true, version: '1.0', lastUpdated: '2026-05-28' },
  { name: 'Drug Interaction Engine', description: 'Drug-drug interaction checking with management guidance', enabled: true, version: '1.0', lastUpdated: '2026-05-28' },
  { name: 'Drug Dosing Calculator', description: 'Age/weight/renal/hepatic adjusted dosing', enabled: true, version: '1.0', lastUpdated: '2026-05-28' },
];

// ─── Specialty Note Templates ──────────────────────────────────────────────────

export interface SpecialtyNoteTemplate {
  specialtyId: string;
  noteTypes: {
    admission: { sections: string[]; tone: string; keyElements: string[] };
    progress: { sections: string[]; tone: string; frequency: string };
    discharge: { sections: string[]; tone: string; requiredElements: string[] };
    operative: { sections: string[]; tone: string; requiredElements: string[] };
    consultation: { sections: string[]; tone: string; structure: string };
  };
}

export const SPECIALTY_NOTE_TEMPLATES: Record<string, SpecialtyNoteTemplate> = {
  PAED: {
    specialtyId: 'PAED',
    noteTypes: {
      admission: { sections: ['Patient identifiers', 'Informant & reliability', 'Caregiver history', 'Birth history', 'Developmental history', 'Immunization status', 'Feeding/nutrition', 'Presenting complaint', 'HPI', 'PMH', 'Examination', 'Diagnosis/DDx', 'Plan'], tone: 'Comprehensive, family-centered, developmentally appropriate', keyElements: ['Weight/height/head circumference centiles', 'WHO IMCI classification if applicable', 'Caregiver concerns'] },
      progress: { sections: ['Date & time', 'Subjective (caregiver report)', 'Objective (vitals, exam)', 'Assessment', 'Plan'], tone: 'Concise, problem-focused', frequency: 'Daily (ward), hourly (PICU)' },
      discharge: { sections: ['Diagnosis', 'Treatment given', 'Condition at discharge', 'Medications', 'Follow-up', 'Caregiver counselling'], tone: 'Clear, actionable, caregiver-friendly', requiredElements: ['Discharge weight', 'Feeding plan', 'Return precautions', 'Follow-up appointment'] },
      operative: { sections: ['Pre-op diagnosis', 'Procedure', 'Findings', 'Blood loss', 'Complications', 'Post-op plan'], tone: 'Technical, precise', requiredElements: ['Weight-based dosing', 'Anaesthetic agents used'] },
      consultation: { sections: ['Referral reason', 'History', 'Examination', 'Assessment', 'Recommendations'], tone: 'Collaborative, specific recommendations', structure: 'Specialist opinion format' },
    }
  },
  CARD: {
    specialtyId: 'CARD',
    noteTypes: {
      admission: { sections: ['Patient identifiers', 'Presenting complaint (SOCRATES)', 'HPI', 'Cardiac risk factors', 'PMH', 'Medications', 'Examination (CVS focused)', 'ECG interpretation', 'Echo findings', 'Diagnosis', 'Plan'], tone: 'Structured, risk-focused, hemodynamic reasoning', keyElements: ['BP both arms', 'JVP', 'Heart sounds', 'Peripheral pulses', 'Oedema'] },
      progress: { sections: ['Symptoms', 'Vitals (HR, BP, SpO2)', 'JVP/fluid status', 'Medication changes', 'Labs (troponin, BNP, K+)', 'Plan'], tone: 'Hemodynamic, data-driven', frequency: 'Daily, more frequent if unstable' },
      discharge: { sections: ['Diagnosis', 'Procedures performed', 'Medication list', 'Activity restrictions', 'Follow-up (clinic, echo)', 'When to seek help'], tone: 'Structured, clear, safety-focused', requiredElements: ['Discharge EF', 'Medication reconciliation', 'Follow-up appointment'] },
      operative: { sections: ['Pre-op diagnosis', 'Procedure', 'Findings', 'Graft details', 'Cross-clamp time', 'CPB time', 'Complications', 'Post-op plan'], tone: 'Highly technical, procedural', requiredElements: ['Procedure codes', 'Device details if implanted'] },
      consultation: { sections: ['Reason for referral', 'History reviewed', 'ECG/Echo reviewed', 'Assessment', 'Recommendations'], tone: 'Expert, evidence-based', structure: 'Structured cardiology opinion' },
    }
  },
};

// ─── Master Registry ───────────────────────────────────────────────────────────

export interface AMEXANRegistry {
  version: string;
  lastBuilt: string;
  totalDiseases: number;
  totalDrugs: number;
  departments: string[];
  intelligenceLayers: number;
  diseaseCountByDept: Record<string, number>;
  drugCountByClass: Record<string, number>;
}
