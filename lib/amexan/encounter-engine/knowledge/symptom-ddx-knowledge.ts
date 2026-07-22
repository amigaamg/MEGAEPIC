export interface DdxSymptomWeight {
  key: string
  weight: number
}

export interface DdxDiseaseEntry {
  id: string
  name: string
  system: string
  epidemiology: { minAge?: number; maxAge?: number; sex?: 'male' | 'female'; prevalence?: string }
  symptoms: DdxSymptomWeight[]
  against: DdxSymptomWeight[]
  riskFactors: string[]
  investigations: string[]
  managementSummary: string
  emergencyWeight: number
}

export const DDX_KNOWLEDGE_BASE: DdxDiseaseEntry[] = [
  // ══════════════════════════════════════════════════════════════════════
  // INFECTIOUS DISEASES
  // ══════════════════════════════════════════════════════════════════════
  {
    id: 'malaria', name: 'Malaria', system: 'infectious',
    epidemiology: { prevalence: 'Very common in sub-Saharan Africa' },
    symptoms: [
      { key: 'cc_fever', weight: 15 }, { key: 'associated_symptoms_rigors', weight: 12 },
      { key: 'associated_symptoms_headache', weight: 8 }, { key: 'associated_symptoms_joint_pain', weight: 6 },
      { key: 'associated_symptoms_vomiting', weight: 5 }, { key: 'associated_symptoms_sweating', weight: 6 },
      { key: 'associated_symptoms_fatigue', weight: 4 }, { key: 'ros_night_sweats', weight: 4 },
      { key: 'ros_fever', weight: 10 }, { key: 'ros_fatigue', weight: 3 },
      { key: 'exam_pallor', weight: 5 }, { key: 'exam_jaundice', weight: 3 },
      { key: 'recent_travel', weight: 8 },
    ],
    against: [{ key: 'ros_cough', weight: 4 }, { key: 'ros_diarrhea', weight: 3 }, { key: 'ros_dysuria', weight: 3 }],
    riskFactors: ['recent_travel', 'hiv', 'sickle_cell'],
    investigations: ['RDT (Malaria RDT)', 'Blood film for malaria parasites', 'FBC', 'CRP', 'Blood glucose'],
    managementSummary: 'Artemether-lumefantrine (or IV artesunate if severe) + supportive care',
    emergencyWeight: 60,
  },
  {
    id: 'severe_malaria', name: 'Severe Malaria', system: 'infectious',
    epidemiology: { prevalence: 'Common in endemic areas, especially children <5' },
    symptoms: [
      { key: 'cc_fever', weight: 15 }, { key: 'associated_symptoms_rigors', weight: 10 },
      { key: 'associated_symptoms_confusion', weight: 12 }, { key: 'associated_symptoms_seizures', weight: 10 },
      { key: 'associated_symptoms_vomiting', weight: 6 }, { key: 'exam_jaundice', weight: 8 },
      { key: 'exam_pallor_severe', weight: 10 }, { key: 'exam_consciousness_confused', weight: 12 },
      { key: 'exam_consciousness_unconscious', weight: 15 }, { key: 'exam_dehydration', weight: 6 },
    ],
    against: [{ key: 'ros_cough', weight: 3 }],
    riskFactors: ['hiv', 'sickle_cell', 'malnutrition'],
    investigations: ['RDT', 'Blood film for parasite count', 'FBC', 'CRP', 'Lactate', 'Blood glucose', 'U&E', 'LFT', 'Blood culture'],
    managementSummary: 'IV artesunate 2.4 mg/kg at 0, 12, 24, 48h + IV fluids + organ support',
    emergencyWeight: 90,
  },
  {
    id: 'pneumonia', name: 'Pneumonia', system: 'respiratory',
    epidemiology: { prevalence: 'Common, especially <5 and >65' },
    symptoms: [
      { key: 'cc_cough', weight: 12 }, { key: 'cc_shortness_of_breath', weight: 8 },
      { key: 'cc_fever', weight: 8 }, { key: 'ros_cough', weight: 10 },
      { key: 'ros_sputum_yellow', weight: 8 }, { key: 'ros_sputum_green', weight: 8 },
      { key: 'ros_fever', weight: 6 }, { key: 'ros_sob_exertion', weight: 6 },
      { key: 'ros_chest_pain', weight: 5 }, { key: 'ros_wheeze', weight: 4 },
      { key: 'ros_fatigue', weight: 3 }, { key: 'exam_temp', weight: 5 },
    ],
    against: [{ key: 'ros_diarrhea', weight: 3 }, { key: 'ros_dysuria', weight: 3 }],
    riskFactors: ['hiv', 'diabetes', 'asthma', 'copd', 'heart_disease', 'smoking'],
    investigations: ['Chest X-ray', 'FBC', 'CRP', 'Sputum culture', 'Blood culture'],
    managementSummary: 'Antibiotics per CURB-65 (amoxicillin + clarithromycin or ceftriaxone) + oxygen if hypoxic',
    emergencyWeight: 60,
  },
  {
    id: 'tuberculosis', name: 'Pulmonary Tuberculosis', system: 'respiratory',
    epidemiology: { prevalence: 'High burden in sub-Saharan Africa' },
    symptoms: [
      { key: 'cc_cough', weight: 12 }, { key: 'ros_cough', weight: 10 },
      { key: 'ros_cough_duration', weight: 8 }, { key: 'ros_night_sweats', weight: 10 },
      { key: 'ros_weight_loss', weight: 8 }, { key: 'ros_fever', weight: 5 },
      { key: 'ros_fatigue', weight: 5 }, { key: 'ros_hemoptysis', weight: 8 },
      { key: 'ros_sputum_blood', weight: 8 },
    ],
    against: [{ key: 'ros_diarrhea', weight: 2 }],
    riskFactors: ['hiv', 'diabetes', 'malnutrition', 'smoking', 'contact_tb'],
    investigations: ['Chest X-ray', 'GeneXpert MTB/RIF', 'Sputum AFB x3', 'TB culture', 'HIV test'],
    managementSummary: 'RIPE regimen (rifampicin, isoniazid, pyrazinamide, ethambutol) for 6 months',
    emergencyWeight: 70,
  },
  {
    id: 'uti', name: 'Urinary Tract Infection', system: 'renal',
    epidemiology: { sex: 'female', prevalence: 'More common in women' },
    symptoms: [
      { key: 'ros_dysuria', weight: 12 }, { key: 'ros_urinary_frequency', weight: 8 },
      { key: 'ros_urinary_urgency', weight: 8 }, { key: 'ros_flank_pain', weight: 6 },
      { key: 'cc_fever', weight: 6 }, { key: 'ros_fever', weight: 5 },
      { key: 'ros_hematuria', weight: 5 },
    ],
    against: [{ key: 'ros_cough', weight: 3 }],
    riskFactors: ['diabetes', 'pregnancy', 'catheter'],
    investigations: ['Urinalysis', 'Urine culture + sensitivity', 'FBC', 'CRP', 'Renal ultrasound'],
    managementSummary: 'Antibiotics per local guideline (nitrofurantoin, ciprofloxacin, or ceftriaxone)',
    emergencyWeight: 30,
  },
  {
    id: 'pyelonephritis', name: 'Acute Pyelonephritis', system: 'renal',
    epidemiology: { sex: 'female', prevalence: 'Complicated UTI' },
    symptoms: [
      { key: 'ros_dysuria', weight: 8 }, { key: 'ros_flank_pain', weight: 12 },
      { key: 'cc_fever', weight: 10 }, { key: 'ros_fever', weight: 8 },
      { key: 'ros_urinary_frequency', weight: 5 }, { key: 'ros_nausea', weight: 5 },
      { key: 'ros_vomiting', weight: 5 }, { key: 'ros_hematuria', weight: 4 },
      { key: 'associated_symptoms_rigors', weight: 8 },
    ],
    against: [],
    riskFactors: ['diabetes', 'pregnancy', 'uti_history', 'catheter'],
    investigations: ['Urinalysis', 'Urine culture', 'FBC', 'CRP', 'Blood culture', 'Renal ultrasound'],
    managementSummary: 'IV ceftriaxone 2g OD + IV fluids. Admit for IV antibiotics.',
    emergencyWeight: 60,
  },
  {
    id: 'gastroenteritis', name: 'Acute Gastroenteritis', system: 'gi',
    epidemiology: {},
    symptoms: [
      { key: 'ros_diarrhea', weight: 12 }, { key: 'ros_vomiting', weight: 10 },
      { key: 'ros_nausea', weight: 8 }, { key: 'cc_abdominal_pain', weight: 6 },
      { key: 'cc_fever', weight: 5 }, { key: 'ros_fever', weight: 4 },
      { key: 'ros_diarrhea_watery', weight: 10 }, { key: 'exam_dehydration', weight: 6 },
    ],
    against: [{ key: 'ros_dysuria', weight: 2 }, { key: 'ros_cough', weight: 2 }],
    riskFactors: ['recent_travel', 'immunosuppression', 'hiv'],
    investigations: ['Stool microscopy', 'Stool culture', 'FBC', 'CRP', 'U&E'],
    managementSummary: 'Oral rehydration solution + zinc + antiemetics if needed. IV fluids if dehydrated.',
    emergencyWeight: 20,
  },
  {
    id: 'typhoid_fever', name: 'Typhoid Fever', system: 'infectious',
    epidemiology: { prevalence: 'Endemic in areas with poor sanitation' },
    symptoms: [
      { key: 'cc_fever', weight: 12 }, { key: 'ros_fever', weight: 10 },
      { key: 'associated_symptoms_headache', weight: 8 }, { key: 'ros_abdominal_pain', weight: 6 },
      { key: 'ros_diarrhea', weight: 5 }, { key: 'ros_constipation', weight: 4 },
      { key: 'ros_fatigue', weight: 5 }, { key: 'ros_nausea', weight: 4 },
      { key: 'associated_symptoms_vomiting', weight: 4 }, { key: 'recent_travel', weight: 6 },
    ],
    against: [{ key: 'associated_symptoms_rigors', weight: 4 }],
    riskFactors: ['recent_travel', 'poor_sanitation'],
    investigations: ['Blood culture', 'Widal test', 'Stool culture', 'FBC'],
    managementSummary: 'Ceftriaxone or azithromycin — avoid fluoroquinolones if resistant strain suspected',
    emergencyWeight: 40,
  },
  {
    id: 'meningitis', name: 'Meningitis', system: 'neurological',
    epidemiology: {},
    symptoms: [
      { key: 'cc_headache', weight: 12 }, { key: 'ros_headache', weight: 10 },
      { key: 'cc_fever', weight: 10 }, { key: 'ros_fever', weight: 8 },
      { key: 'associated_symptoms_neck_stiffness', weight: 15 },
      { key: 'associated_symptoms_vomiting', weight: 6 },
      { key: 'associated_symptoms_confusion', weight: 10 },
      { key: 'associated_symptoms_seizures', weight: 8 },
      { key: 'exam_consciousness_confused', weight: 10 },
      { key: 'ros_headache_thunderclap', weight: 8 },
    ],
    against: [],
    riskFactors: ['hiv', 'immunosuppression', 'sickle_cell'],
    investigations: ['LP with CSF analysis', 'Blood culture', 'CRP', 'CT head'],
    managementSummary: 'IV ceftriaxone + dexamethasone + acyclovir if encephalitis suspected',
    emergencyWeight: 90,
  },
  {
    id: 'sepsis', name: 'Sepsis / Bacteraemia', system: 'infectious',
    epidemiology: {},
    symptoms: [
      { key: 'cc_fever', weight: 10 }, { key: 'ros_fever', weight: 8 },
      { key: 'associated_symptoms_rigors', weight: 12 },
      { key: 'exam_consciousness_confused', weight: 12 },
      { key: 'exam_temp_high', weight: 8 }, { key: 'exam_temp', weight: 6 },
      { key: 'associated_symptoms_rapid_onset', weight: 6 },
    ],
    against: [],
    riskFactors: ['hiv', 'diabetes', 'cancer', 'immunosuppression'],
    investigations: ['Blood culture x2', 'FBC', 'CRP', 'PCT', 'Lactate', 'Urinalysis', 'Chest X-ray'],
    managementSummary: 'IV broad-spectrum antibiotics within 1 hour + fluid resuscitation + source control',
    emergencyWeight: 85,
  },
  {
    id: 'dengue', name: 'Dengue Fever', system: 'infectious',
    epidemiology: { prevalence: 'Endemic in tropical areas' },
    symptoms: [
      { key: 'cc_fever', weight: 10 }, { key: 'ros_fever', weight: 8 },
      { key: 'associated_symptoms_headache', weight: 8 },
      { key: 'associated_symptoms_joint_pain', weight: 10 },
      { key: 'associated_symptoms_rash', weight: 8 }, { key: 'ros_joint_pain', weight: 8 },
      { key: 'recent_travel', weight: 6 },
    ],
    against: [{ key: 'associated_symptoms_rigors', weight: 3 }, { key: 'ros_cough', weight: 3 }],
    riskFactors: ['recent_travel'],
    investigations: ['Dengue NS1 antigen', 'Dengue IgM/IgG', 'FBC (platelet count)', 'Haematocrit'],
    managementSummary: 'Supportive — IV fluids if warning signs, monitor platelets/haematocrit',
    emergencyWeight: 50,
  },
  {
    id: 'hiv_acute', name: 'Acute HIV Seroconversion', system: 'infectious',
    epidemiology: {},
    symptoms: [
      { key: 'cc_fever', weight: 8 }, { key: 'ros_fever', weight: 6 },
      { key: 'associated_symptoms_headache', weight: 5 }, { key: 'ros_fatigue', weight: 6 },
      { key: 'ros_night_sweats', weight: 5 }, { key: 'ros_weight_loss', weight: 5 },
      { key: 'ros_joint_pain', weight: 4 }, { key: 'exam_lymph_nodes', weight: 6 },
      { key: 'associated_symptoms_rash', weight: 5 },
    ],
    against: [],
    riskFactors: ['unprotected_sex', 'ivdu', 'blood_transfusion'],
    investigations: ['HIV rapid test', 'HIV viral load', 'CD4 count'],
    managementSummary: 'Refer to HIV clinic. Start ART per national guidelines.',
    emergencyWeight: 40,
  },
  {
    id: 'covid_19', name: 'COVID-19', system: 'respiratory',
    epidemiology: { prevalence: 'Pandemic respiratory virus' },
    symptoms: [
      { key: 'cc_fever', weight: 8 }, { key: 'ros_fever', weight: 6 },
      { key: 'cc_cough', weight: 8 }, { key: 'ros_cough', weight: 6 },
      { key: 'cc_shortness_of_breath', weight: 8 }, { key: 'ros_sob_exertion', weight: 6 },
      { key: 'ros_fatigue', weight: 6 }, { key: 'associated_symptoms_headache', weight: 4 },
      { key: 'associated_symptoms_joint_pain', weight: 4 }, { key: 'ros_chest_pain', weight: 3 },
      { key: 'ros_sputum', weight: 3 },
    ],
    against: [{ key: 'ros_diarrhea', weight: 2 }],
    riskFactors: ['diabetes', 'hypertension', 'heart_disease', 'copd', 'obesity'],
    investigations: ['SARS-CoV-2 PCR/RAT', 'Chest X-ray', 'FBC', 'CRP', 'D-dimer'],
    managementSummary: 'Supportive — oxygen if hypoxic, dexamethasone if severe, anticoagulation',
    emergencyWeight: 50,
  },
  // ══════════════════════════════════════════════════════════════════════
  // CARDIOVASCULAR
  // ══════════════════════════════════════════════════════════════════════
  {
    id: 'acute_coronary_syndrome', name: 'Acute Coronary Syndrome', system: 'cardiovascular',
    epidemiology: { minAge: 35, prevalence: 'Leading cause of death globally' },
    symptoms: [
      { key: 'ros_chest_pain', weight: 15 }, { key: 'ros_chest_pain_pressure', weight: 12 },
      { key: 'ros_chest_pain_exertional', weight: 10 }, { key: 'ros_sob_exertion', weight: 6 },
      { key: 'ros_nausea', weight: 5 }, { key: 'ros_palpitations', weight: 4 },
      { key: 'associated_symptoms_sweating', weight: 8 },
    ],
    against: [{ key: 'ros_diarrhea', weight: 2 }],
    riskFactors: ['hypertension', 'diabetes', 'smoking', 'family_history_heart_disease', 'obesity'],
    investigations: ['ECG', 'Troponin', 'Chest X-ray', 'Echocardiogram'],
    managementSummary: 'MONA (morphine, oxygen, nitrates, aspirin) + PCI or fibrinolysis + dual antiplatelet therapy',
    emergencyWeight: 95,
  },
  {
    id: 'heart_failure', name: 'Congestive Heart Failure', system: 'cardiovascular',
    epidemiology: { minAge: 50 },
    symptoms: [
      { key: 'ros_sob_exertion', weight: 10 }, { key: 'ros_sob_rest', weight: 8 },
      { key: 'ros_orthopnea', weight: 10 }, { key: 'ros_edema', weight: 8 },
      { key: 'ros_fatigue', weight: 6 }, { key: 'ros_chest_pain', weight: 4 },
      { key: 'ros_palpitations', weight: 4 }, { key: 'ros_night_sweats', weight: 3 },
    ],
    against: [{ key: 'ros_diarrhea', weight: 2 }],
    riskFactors: ['hypertension', 'diabetes', 'heart_disease', 'previous_mi'],
    investigations: ['Echocardiogram', 'ECG', 'Chest X-ray', 'BNP/NT-proBNP', 'U&E', 'FBC'],
    managementSummary: 'Diuretics + ACE inhibitor/ARB + beta-blocker + sodium restriction',
    emergencyWeight: 70,
  },
  {
    id: 'pulmonary_embolism', name: 'Pulmonary Embolism', system: 'cardiovascular',
    epidemiology: {},
    symptoms: [
      { key: 'cc_shortness_of_breath', weight: 12 }, { key: 'ros_sob_exertion', weight: 10 },
      { key: 'ros_sob_rest', weight: 8 }, { key: 'ros_chest_pain', weight: 8 },
      { key: 'ros_chest_pain_sharp', weight: 8 }, { key: 'ros_hemoptysis', weight: 6 },
      { key: 'ros_palpitations', weight: 5 },
    ],
    against: [{ key: 'ros_cough', weight: 3 }],
    riskFactors: ['surgery', 'immobility', 'cancer', 'pregnancy', 'oral_contraceptives', 'previous_dvt'],
    investigations: ['D-dimer', 'CT pulmonary angiogram', 'ECG', 'ECHO', 'ABG'],
    managementSummary: 'Anticoagulation (LMWH/UFH → warfarin/DOAC) + oxygen + thrombolysis if massive',
    emergencyWeight: 95,
  },
  {
    id: 'hypertension_urgency', name: 'Hypertensive Urgency', system: 'cardiovascular',
    epidemiology: { minAge: 30 },
    symptoms: [
      { key: 'ros_headache', weight: 6 }, { key: 'ros_chest_pain', weight: 4 },
      { key: 'ros_sob_exertion', weight: 4 }, { key: 'ros_vision_blurred', weight: 5 },
      { key: 'ros_dizziness', weight: 4 },
    ],
    against: [],
    riskFactors: ['hypertension', 'ckd', 'obesity'],
    investigations: ['BP measurement', 'ECG', 'U&E/Creatinine', 'Urinalysis'],
    managementSummary: 'Oral antihypertensives (labetalol or nifedipine). Gradual BP reduction over 24h.',
    emergencyWeight: 60,
  },
  // ══════════════════════════════════════════════════════════════════════
  // GASTROINTESTINAL
  // ══════════════════════════════════════════════════════════════════════
  {
    id: 'acute_appendicitis', name: 'Acute Appendicitis', system: 'gi',
    epidemiology: { minAge: 5, maxAge: 50 },
    symptoms: [
      { key: 'cc_abdominal_pain', weight: 10 }, { key: 'pain_site_rif', weight: 12 },
      { key: 'pain_migration', weight: 10 }, { key: 'ros_nausea', weight: 6 },
      { key: 'ros_vomiting', weight: 6 }, { key: 'ros_fever', weight: 5 },
      { key: 'associated_symptoms_anorexia', weight: 8 },
    ],
    against: [{ key: 'ros_diarrhea', weight: 3 }],
    riskFactors: [],
    investigations: ['FBC', 'CRP', 'Urinalysis (to exclude UTI)', 'Abdominal US', 'Alvarado score'],
    managementSummary: 'Appendectomy (laparoscopic or open) + IV antibiotics peri-operatively',
    emergencyWeight: 70,
  },
  {
    id: 'gi_bleed_upper', name: 'Upper GI Bleed', system: 'gi',
    epidemiology: {},
    symptoms: [
      { key: 'ros_hematemesis', weight: 15 }, { key: 'ros_melena', weight: 12 },
      { key: 'associated_symptoms_vomiting_blood', weight: 15 },
      { key: 'ros_nausea', weight: 4 }, { key: 'ros_abdominal_pain', weight: 4 },
      { key: 'exam_pallor', weight: 6 },
    ],
    against: [],
    riskFactors: ['nsaid_use', 'alcohol', 'cirrhosis', 'previous_ulcer'],
    investigations: ['FBC', 'Coagulation', 'U&E', 'LFT', 'Blood group + cross-match', 'EGD'],
    managementSummary: 'IV fluids + blood transfusion + PPI + early endoscopy + octreotide if variceal',
    emergencyWeight: 90,
  },
  {
    id: 'intestinal_obstruction', name: 'Intestinal Obstruction', system: 'gi',
    epidemiology: {},
    symptoms: [
      { key: 'cc_abdominal_pain', weight: 10 }, { key: 'ros_vomiting', weight: 8 },
      { key: 'ros_vomiting_feculent', weight: 12 }, { key: 'ros_constipation', weight: 8 },
      { key: 'ros_nausea', weight: 5 }, { key: 'exam_dehydration', weight: 5 },
    ],
    against: [{ key: 'ros_diarrhea', weight: 4 }],
    riskFactors: ['previous_abdominal_surgery', 'hernia', 'cancer'],
    investigations: ['Abdominal X-ray (erect + supine)', 'FBC', 'U&E', 'CRP', 'CT abdomen'],
    managementSummary: 'NPO + NG tube + IV fluids + surgical consult',
    emergencyWeight: 80,
  },
  {
    id: 'cholecystitis', name: 'Acute Cholecystitis', system: 'gi',
    epidemiology: { sex: 'female', minAge: 30 },
    symptoms: [
      { key: 'cc_abdominal_pain', weight: 8 }, { key: 'pain_site_ruq', weight: 10 },
      { key: 'ros_nausea', weight: 6 }, { key: 'ros_vomiting', weight: 5 },
      { key: 'ros_fever', weight: 6 }, { key: 'ros_jaundice', weight: 4 },
      { key: 'ros_fatigue', weight: 3 },
    ],
    against: [],
    riskFactors: ['obesity', 'female', 'multiparity', 'rapid_weight_loss'],
    investigations: ['Abdominal US', 'FBC', 'CRP', 'LFT', 'Amylase'],
    managementSummary: 'IV antibiotics + laparoscopic cholecystectomy + analgesia',
    emergencyWeight: 60,
  },
  {
    id: 'pancreatitis', name: 'Acute Pancreatitis', system: 'gi',
    epidemiology: {},
    symptoms: [
      { key: 'cc_abdominal_pain', weight: 10 }, { key: 'pain_site_epigastric', weight: 10 },
      { key: 'pain_radiation_to_back', weight: 10 }, { key: 'ros_nausea', weight: 6 },
      { key: 'ros_vomiting', weight: 6 }, { key: 'ros_fever', weight: 4 },
    ],
    against: [],
    riskFactors: ['gallstones', 'alcohol', 'hypertriglyceridemia'],
    investigations: ['Serum amylase/lipase', 'FBC', 'CRP', 'LFT', 'Abdominal US', 'CT abdomen'],
    managementSummary: 'NPO + IV fluids + analgesia + monitor for complications. ICU if severe.',
    emergencyWeight: 75,
  },
  // ══════════════════════════════════════════════════════════════════════
  // NEUROLOGICAL
  // ══════════════════════════════════════════════════════════════════════
  {
    id: 'stroke_ischemic', name: 'Acute Ischemic Stroke', system: 'neurological',
    epidemiology: { minAge: 40 },
    symptoms: [
      { key: 'ros_weakness_unilateral', weight: 15 }, { key: 'ros_headache', weight: 5 },
      { key: 'ros_dizziness', weight: 5 }, { key: 'ros_vision_blurred', weight: 6 },
      { key: 'ros_vision_loss', weight: 8 }, { key: 'ros_seizures', weight: 4 },
    ],
    against: [],
    riskFactors: ['hypertension', 'diabetes', 'smoking', 'heart_disease', 'afib'],
    investigations: ['CT head (non-contrast) STAT', 'MRI brain', 'FBC', 'Coagulation', 'ECG', 'Carotid US'],
    managementSummary: 'Thrombolysis (alteplase) if within 4.5h + thrombectomy if large vessel occlusion',
    emergencyWeight: 95,
  },
  {
    id: 'stroke_hemorrhagic', name: 'Intracranial Hemorrhage', system: 'neurological',
    epidemiology: { minAge: 40 },
    symptoms: [
      { key: 'ros_headache', weight: 10 }, { key: 'ros_headache_thunderclap', weight: 15 },
      { key: 'ros_weakness_unilateral', weight: 8 }, { key: 'ros_seizures', weight: 6 },
      { key: 'ros_nausea', weight: 4 }, { key: 'ros_vomiting', weight: 5 },
      { key: 'exam_consciousness_confused', weight: 10 },
      { key: 'exam_consciousness_unconscious', weight: 12 },
    ],
    against: [],
    riskFactors: ['hypertension', 'anticoagulation', 'aneurysm'],
    investigations: ['CT head STAT', 'CT angiogram', 'FBC', 'Coagulation'],
    managementSummary: 'BP control + reverse anticoagulation + neurosurgical consult + ICU',
    emergencyWeight: 95,
  },
  {
    id: 'seizure_disorder', name: 'Seizure Disorder', system: 'neurological',
    epidemiology: {},
    symptoms: [
      { key: 'ros_seizures', weight: 15 }, { key: 'ros_seizure_generalized', weight: 10 },
      { key: 'ros_seizure_focal', weight: 8 }, { key: 'ros_headache', weight: 3 },
      { key: 'ros_confusion', weight: 5 },
    ],
    against: [],
    riskFactors: ['previous_seizures', 'cns_infection', 'head_injury', 'stroke'],
    investigations: ['EEG', 'CT/MRI brain', 'FBC', 'U&E', 'LFT', 'Antiepileptic drug levels'],
    managementSummary: 'Antiepileptic medication (phenytoin, levetiracetam, or valproate) + safety precautions',
    emergencyWeight: 70,
  },
  {
    id: 'migraine', name: 'Migraine', system: 'neurological',
    epidemiology: { sex: 'female', minAge: 15, maxAge: 50 },
    symptoms: [
      { key: 'ros_headache', weight: 10 }, { key: 'ros_headache_migraine', weight: 10 },
      { key: 'ros_vision_blurred', weight: 5 }, { key: 'ros_nausea', weight: 6 },
      { key: 'ros_vomiting', weight: 5 },
    ],
    against: [{ key: 'ros_fever', weight: 4 }, { key: 'ros_neck_stiffness', weight: 4 }],
    riskFactors: ['family_history_migraine', 'female'],
    investigations: ['Clinical diagnosis', 'MRI brain (if atypical features)'],
    managementSummary: 'Acute: triptans + NSAIDs. Preventive: beta-blockers, amitriptyline, topiramate.',
    emergencyWeight: 15,
  },
  // ══════════════════════════════════════════════════════════════════════
  // RESPIRATORY (non-infectious)
  // ══════════════════════════════════════════════════════════════════════
  {
    id: 'asthma_exacerbation', name: 'Acute Asthma Exacerbation', system: 'respiratory',
    epidemiology: {},
    symptoms: [
      { key: 'cc_shortness_of_breath', weight: 10 }, { key: 'ros_wheeze', weight: 12 },
      { key: 'ros_cough', weight: 6 }, { key: 'ros_sob_exertion', weight: 6 },
      { key: 'ros_chest_pain', weight: 4 },
    ],
    against: [{ key: 'ros_sputum_green', weight: 3 }, { key: 'ros_fever', weight: 3 }],
    riskFactors: ['asthma', 'allergies', 'smoking'],
    investigations: ['PEFR', 'SpO2', 'Chest X-ray', 'FBC', 'ABG if severe'],
    managementSummary: 'Inhaled salbutamol + ipratropium + systemic steroids + oxygen + monitor PEFR',
    emergencyWeight: 70,
  },
  {
    id: 'copd_exacerbation', name: 'COPD Exacerbation', system: 'respiratory',
    epidemiology: { minAge: 50 },
    symptoms: [
      { key: 'cc_shortness_of_breath', weight: 10 }, { key: 'ros_cough', weight: 8 },
      { key: 'ros_sputum_yellow', weight: 8 }, { key: 'ros_sputum_green', weight: 8 },
      { key: 'ros_wheeze', weight: 6 }, { key: 'ros_sob_exertion', weight: 6 },
    ],
    against: [],
    riskFactors: ['smoking', 'copd', 'biomass_fuel_exposure'],
    investigations: ['Chest X-ray', 'ABG', 'FBC', 'CRP', 'Sputum culture'],
    managementSummary: 'Bronchodilators + corticosteroids + antibiotics if purulent sputum + oxygen',
    emergencyWeight: 70,
  },
  // ══════════════════════════════════════════════════════════════════════
  // MUSCULOSKELETAL / RHEUMATOLOGICAL
  // ══════════════════════════════════════════════════════════════════════
  {
    id: 'septic_arthritis', name: 'Septic Arthritis', system: 'musculoskeletal',
    epidemiology: {},
    symptoms: [
      { key: 'ros_joint_pain', weight: 10 }, { key: 'ros_joint_swelling', weight: 10 },
      { key: 'ros_fever', weight: 6 }, { key: 'ros_joint_pain_detail_small', weight: 5 },
      { key: 'ros_joint_pain_detail_large', weight: 8 },
    ],
    against: [],
    riskFactors: ['hiv', 'diabetes', 'joint_prosthesis', 'rheumatoid_arthritis'],
    investigations: ['Joint aspiration + culture', 'FBC', 'CRP', 'Blood culture'],
    managementSummary: 'IV antibiotics + joint drainage + analgesia',
    emergencyWeight: 80,
  },
  {
    id: 'osteomyelitis', name: 'Osteomyelitis', system: 'musculoskeletal',
    epidemiology: {},
    symptoms: [
      { key: 'associated_symptoms_joint_pain', weight: 6 }, { key: 'ros_joint_swelling', weight: 6 },
      { key: 'ros_fever', weight: 6 }, { key: 'ros_fatigue', weight: 4 },
    ],
    against: [],
    riskFactors: ['diabetes', 'sickle_cell', 'recent_trauma', 'hiv'],
    investigations: ['X-ray affected bone', 'MRI', 'FBC', 'CRP', 'Blood culture', 'Bone biopsy'],
    managementSummary: 'IV antibiotics (6 weeks) + surgical debridement if needed',
    emergencyWeight: 60,
  },
  // ══════════════════════════════════════════════════════════════════════
  // HEMATOLOGICAL / ONCOLOGICAL
  // ══════════════════════════════════════════════════════════════════════
  {
    id: 'sickle_cell_crisis', name: 'Sickle Cell Vaso-Occlusive Crisis', system: 'hematological',
    epidemiology: { prevalence: 'Common in sub-Saharan Africa' },
    symptoms: [
      { key: 'associated_symptoms_joint_pain', weight: 8 },
      { key: 'associated_symptoms_body_aches', weight: 8 },
      { key: 'associated_symptoms_fever', weight: 6 }, { key: 'exam_pallor', weight: 6 },
      { key: 'ros_fever', weight: 5 }, { key: 'ros_joint_pain', weight: 6 },
      { key: 'ros_fatigue', weight: 6 },
    ],
    against: [],
    riskFactors: ['sickle_cell', 'hiv'],
    investigations: ['FBC with reticulocyte count', 'Blood film', 'CRP', 'Blood culture', 'Chest X-ray'],
    managementSummary: 'IV fluids + analgesia (morphine if severe) + oxygen + treat underlying cause + folic acid',
    emergencyWeight: 70,
  },
  {
    id: 'anemia_severe', name: 'Severe Anemia', system: 'hematological',
    epidemiology: {},
    symptoms: [
      { key: 'ros_fatigue', weight: 8 }, { key: 'associated_symptoms_fatigue', weight: 6 },
      { key: 'cc_shortness_of_breath', weight: 5 }, { key: 'ros_sob_exertion', weight: 5 },
      { key: 'ros_palpitations', weight: 4 }, { key: 'exam_pallor', weight: 8 },
      { key: 'exam_pallor_severe', weight: 10 },
    ],
    against: [],
    riskFactors: ['malaria', 'sickle_cell', 'malnutrition', 'gi_bleed', 'hiv'],
    investigations: ['FBC', 'Blood film', 'Reticulocyte count', 'Hb electrophoresis', 'Stool occult blood'],
    managementSummary: 'Blood transfusion + treat underlying cause + folic acid + iron (if iron deficiency)',
    emergencyWeight: 70,
  },
  // ══════════════════════════════════════════════════════════════════════
  // METABOLIC / ENDOCRINE
  // ══════════════════════════════════════════════════════════════════════
  {
    id: 'diabetic_ketoacidosis', name: 'Diabetic Ketoacidosis', system: 'endocrine',
    epidemiology: {},
    symptoms: [
      { key: 'ros_thirst', weight: 8 }, { key: 'ros_urination', weight: 8 },
      { key: 'ros_fatigue', weight: 5 }, { key: 'ros_nausea', weight: 5 },
      { key: 'ros_vomiting', weight: 5 }, { key: 'ros_abdominal_pain', weight: 4 },
      { key: 'ros_vision_blurred', weight: 3 },
    ],
    against: [],
    riskFactors: ['diabetes', 'infection', 'noncompliance'],
    investigations: ['Blood glucose', 'ABG', 'U&E', 'Beta-hydroxybutyrate', 'Urinalysis', 'ECG'],
    managementSummary: 'IV fluids + insulin infusion + K+ replacement + treat precipitating cause',
    emergencyWeight: 90,
  },
  {
    id: 'hypoglycemia', name: 'Hypoglycemia', system: 'endocrine',
    epidemiology: {},
    symptoms: [
      { key: 'ros_dizziness', weight: 6 }, { key: 'ros_dizziness_lightheaded', weight: 6 },
      { key: 'associated_symptoms_sweating', weight: 8 },
      { key: 'ros_palpitations', weight: 5 }, { key: 'ros_fatigue', weight: 4 },
    ],
    against: [],
    riskFactors: ['diabetes', 'insulin_therapy', 'sulfonylurea', 'alcohol', 'liver_disease'],
    investigations: ['Blood glucose (bedside)'],
    managementSummary: 'Oral glucose/dextrose IV + glucagon IM if unconscious + treat underlying cause',
    emergencyWeight: 80,
  },
  {
    id: 'thyroid_storm', name: 'Thyroid Storm', system: 'endocrine',
    epidemiology: {},
    symptoms: [
      { key: 'ros_palpitations', weight: 8 }, { key: 'ros_temp_intolerance', weight: 6 },
      { key: 'ros_fever', weight: 6 }, { key: 'ros_fatigue', weight: 5 },
      { key: 'ros_diarrhea', weight: 4 }, { key: 'ros_nausea', weight: 4 },
      { key: 'ros_vision_blurred', weight: 3 },
    ],
    against: [],
    riskFactors: ['hyperthyroidism', 'iodinated_contrast', 'infection', 'surgery'],
    investigations: ['TSH', 'Free T4', 'Free T3', 'ECG', 'FBC', 'LFT'],
    managementSummary: 'Beta-blocker + thionamide + corticosteroids + iodine solution + supportive care',
    emergencyWeight: 90,
  },
  // ══════════════════════════════════════════════════════════════════════
  // RENAL
  // ══════════════════════════════════════════════════════════════════════
  {
    id: 'acute_kidney_injury', name: 'Acute Kidney Injury', system: 'renal',
    epidemiology: {},
    symptoms: [
      { key: 'ros_urination_decreased', weight: 8 }, { key: 'ros_edema', weight: 5 },
      { key: 'ros_nausea', weight: 4 }, { key: 'ros_fatigue', weight: 4 },
      { key: 'ros_sob_exertion', weight: 4 },
    ],
    against: [],
    riskFactors: ['sepsis', 'dehydration', 'nsaid_use', 'diabetes', 'hypertension', 'ckd'],
    investigations: ['U&E/Creatinine', 'Urinalysis', 'Renal US', 'FBC', 'ABG'],
    managementSummary: 'Treat underlying cause + IV fluids (if pre-renal) + avoid nephrotoxins + dialysis if indicated',
    emergencyWeight: 70,
  },
  {
    id: 'nephrolithiasis', name: 'Nephrolithiasis (Kidney Stone)', system: 'renal',
    epidemiology: {},
    symptoms: [
      { key: 'ros_flank_pain', weight: 12 }, { key: 'ros_hematuria', weight: 8 },
      { key: 'ros_dysuria', weight: 4 }, { key: 'ros_nausea', weight: 5 },
      { key: 'ros_vomiting', weight: 5 },
    ],
    against: [],
    riskFactors: ['dehydration', 'family_history_stones', 'gout'],
    investigations: ['Urinalysis', 'CT KUB (non-contrast)', 'U&E', 'CRP'],
    managementSummary: 'Analgesia (NSAIDs) + IV fluids + tamsulosin (for distal ureteric stones) + urology referral',
    emergencyWeight: 40,
  },
  // ══════════════════════════════════════════════════════════════════════
  // OBSTETRIC / GYNECOLOGICAL
  // ══════════════════════════════════════════════════════════════════════
  {
    id: 'ectopic_pregnancy', name: 'Ectopic Pregnancy', system: 'obstetric',
    epidemiology: { sex: 'female', minAge: 12, maxAge: 50 },
    symptoms: [
      { key: 'cc_abdominal_pain', weight: 8 }, { key: 'associated_symptoms_bleeding_pv', weight: 8 },
      { key: 'ros_abdominal_pain', weight: 6 },
    ],
    against: [],
    riskFactors: ['previous_ectopic', 'tubal_surgery', 'iud', 'pid', 'smoking'],
    investigations: ['Pregnancy test (urine/serum)', 'Transvaginal US', 'Beta-hCG', 'FBC'],
    managementSummary: 'Urgent gynecology referral. Laparoscopic salpingectomy or methotrexate if early/unruptured.',
    emergencyWeight: 95,
  },
  {
    id: 'pelvic_inflammatory_disease', name: 'Pelvic Inflammatory Disease', system: 'obstetric',
    epidemiology: { sex: 'female', minAge: 15, maxAge: 45 },
    symptoms: [
      { key: 'cc_abdominal_pain', weight: 6 }, { key: 'ros_dysuria', weight: 4 },
      { key: 'ros_fever', weight: 5 }, { key: 'ros_nausea', weight: 3 },
      { key: 'ros_vomiting', weight: 3 },
    ],
    against: [],
    riskFactors: ['multiple_partners', 'iud', 'previous_sti'],
    investigations: ['Pregnancy test', 'Cervical swab culture/PCR', 'FBC', 'CRP', 'Pelvic US'],
    managementSummary: 'Antibiotics (ceftriaxone + doxycycline + metronidazole) + analgesia + partner treatment',
    emergencyWeight: 40,
  },
  // ══════════════════════════════════════════════════════════════════════
  // DERMATOLOGICAL
  // ══════════════════════════════════════════════════════════════════════
  {
    id: 'cellulitis', name: 'Cellulitis', system: 'dermatological',
    epidemiology: {},
    symptoms: [
      { key: 'ros_fever', weight: 5 }, { key: 'ros_joint_swelling', weight: 4 },
      { key: 'ros_fatigue', weight: 3 },
    ],
    against: [],
    riskFactors: ['diabetes', 'hiv', 'lymphedema', 'venous_insufficiency', 'skin_breakdown'],
    investigations: ['FBC', 'CRP', 'Blood culture (if febrile)', 'Wound swab'],
    managementSummary: 'Antibiotics (flucloxacillin or clindamycin) + elevation + analgesia',
    emergencyWeight: 30,
  },
  // ══════════════════════════════════════════════════════════════════════
  // PSYCHIATRIC
  // ══════════════════════════════════════════════════════════════════════
  {
    id: 'psychosis_acute', name: 'Acute Psychotic Episode', system: 'psychiatric',
    epidemiology: { minAge: 15, maxAge: 45 },
    symptoms: [
      { key: 'confusion', weight: 6 }, { key: 'ros_fatigue', weight: 4 },
      { key: 'ros_appetite', weight: 3 }, { key: 'ros_seizures', weight: 3 },
    ],
    against: [],
    riskFactors: ['family_history_psychosis', 'substance_use', 'stress'],
    investigations: ['Psychiatric assessment', 'Toxicology screen', 'CT brain (if first episode)'],
    managementSummary: 'Antipsychotic medication + safety + psychiatric referral',
    emergencyWeight: 70,
  },
]

export function getDdxEntry(id: string): DdxDiseaseEntry | undefined {
  return DDX_KNOWLEDGE_BASE.find(d => d.id === id)
}

export function getDdxEntriesBySystem(system: string): DdxDiseaseEntry[] {
  return DDX_KNOWLEDGE_BASE.filter(d => d.system === system)
}
