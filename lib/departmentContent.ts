// ═══════════════════════════════════════════════════════════════════════════
// lib/departmentContent.ts
// Department-specific clinical content: phases, protocols, investigations
// ═══════════════════════════════════════════════════════════════════════════

export interface PhaseContent {
  id: string;
  label: string;
  icon: string;
  desc?: string;
  questions?: { key: string; label: string; type: 'text' | 'select' | 'multi' | 'boolean'; options?: string[] }[];
  protocols?: { name: string; steps: string[] }[];
  investigations?: string[];
  differentials?: string[];
}

export interface DepartmentClinicalContent {
  key: string;
  phases: PhaseContent[];
  protocolReferences: { name: string; steps: string[] }[];
  commonDifferentials: string[];
  keyInvestigations: string[];
  scoringSystems: { name: string; calc: string }[];
}

export const DEPARTMENT_CONTENT: Record<string, DepartmentClinicalContent> = {
  CARD: {
    key: 'CARD',
    protocolReferences: [
      { name: 'Chest Pain (ACS)', steps: ['ECG within 10 min', 'Aspirin 300mg stat', 'Troponin at 0 and 3h', 'HEART score assessment', 'If STEMI: primary PCI or fibrinolysis'] },
      { name: 'Heart Failure (HFrEF)', steps: ['ARNI (sacubitril/valsartan)', 'Beta-blocker (bisoprolol)', 'MRA (spironolactone)', 'SGLT2i (empagliflozin)', 'Loop diuretic for congestion'] },
      { name: 'Atrial Fibrillation', steps: ['CHA₂DS₂-VASc score', 'DOAC or warfarin', 'Rate control (beta-blocker)', 'Rhythm control if symptomatic', 'EP referral if refractory'] },
      { name: 'Hypertension', steps: ['CCB or ACEI first line', 'Add second agent if uncontrolled', 'Consider resistant HTN workup', 'Target <130/80 mmHg', 'Lifestyle modification'] },
    ],
    commonDifferentials: ['ACS / MI', 'Heart Failure', 'Arrhythmia', 'Valvular Disease', 'Pericarditis', 'Pulmonary Embolism', 'Aortic Dissection', 'Anxiety / Panic Attack'],
    keyInvestigations: ['ECG', 'Troponin I/T', 'BNP / NT-proBNP', 'Echocardiogram', 'Chest X-ray', 'Lipid Profile', 'D-Dimer', 'Holter Monitor'],
    scoringSystems: [
      { name: 'HEART Score', calc: 'History + ECG + Age + Risk factors + Troponin' },
      { name: 'CHA₂DS₂-VASc', calc: 'CHF + HTN + Age≥75 + DM + Stroke + Vascular Disease + Age 65-74 + Sex' },
      { name: 'TIMI Risk', calc: 'Age≥65 + ≥3 RF + Known CAD + Aspirin + Severe angina + ST changes + Cardiac markers' },
    ],
    phases: [
      { id: 'biodata', label: 'Biodata', icon: '📋', desc: 'Patient demographics and cardiac risk factors',
        questions: [{ key: 'patientName', label: 'Patient Name', type: 'text' },{ key: 'age', label: 'Age', type: 'text' },{ key: 'sex', label: 'Sex', type: 'select', options: ['Male','Female'] },{ key: 'hospitalId', label: 'Hospital ID', type: 'text' },{ key: 'referralSource', label: 'Referral Source', type: 'select', options: ['Self','GP','ED','Outpatient Clinic','Other'] },{ key: 'knownCAD', label: 'Known Coronary Artery Disease', type: 'boolean' },{ key: 'cardiacRiskFactors', label: 'Cardiac Risk Factors', type: 'multi', options: ['Hypertension','Diabetes','Dyslipidaemia','Smoking','Family History','Obesity'] }] },
      { id: 'complaints', label: 'Chief Complaints', icon: '🗣️', desc: 'Chest pain, dyspnoea, palpitations',
        questions: [{ key: 'chestPain', label: 'Chest Pain', type: 'boolean' },{ key: 'dyspnoea', label: 'Dyspnoea (SOB)', type: 'boolean' },{ key: 'palpitations', label: 'Palpitations', type: 'boolean' },{ key: 'syncope', label: 'Syncope / Near-Syncope', type: 'boolean' },{ key: 'orthopnoea', label: 'Orthopnoea', type: 'boolean' },{ key: 'PND', label: 'Paroxysmal Nocturnal Dyspnoea', type: 'boolean' },{ key: 'oedema', label: 'Leg Oedema', type: 'boolean' },{ key: 'fatigue', label: 'Fatigue / Exercise Intolerance', type: 'boolean' },{ key: 'chestPainType', label: 'Chest Pain Character', type: 'select', options: ['Tightness','Burning','Stabbing','Pressure','Sharp'] },{ key: 'chestPainDuration', label: 'Chest Pain Duration', type: 'text' }] },
      { id: 'hpi', label: 'HPI', icon: '📝', desc: 'SOCRATES for chest pain, SOB, palpitations',
        questions: [{ key: 'onset', label: 'Onset', type: 'select', options: ['Sudden','Gradual','Intermittent'] },{ key: 'duration', label: 'Duration of symptoms', type: 'text' },{ key: 'progression', label: 'Progression', type: 'select', options: ['Worsening','Improving','Fluctuating','Static'] },{ key: 'associatedSymptoms', label: 'Associated Symptoms', type: 'multi', options: ['Nausea','Diaphoresis','Dizziness','Radiation to arm/jaw','Back pain','Palpitations'] },{ key: 'precipitatingFactors', label: 'Precipitating Factors', type: 'multi', options: ['Exertion','Rest','Emotional Stress','Meals','Cold'] },{ key: 'relievingFactors', label: 'Relieving Factors', type: 'multi', options: ['Rest','GTN','Positional Change','None'] },{ key: 'severity', label: 'Worst Pain (1-10)', type: 'text' }] },
      { id: 'pmh', label: 'PMH & Risk Factors', icon: '🏥', desc: 'HTN, DM, lipids, smoking, family history',
        questions: [{ key: 'hypertension', label: 'Hypertension', type: 'boolean' },{ key: 'diabetes', label: 'Diabetes Mellitus', type: 'boolean' },{ key: 'dyslipidaemia', label: 'Dyslipidaemia', type: 'boolean' },{ key: 'previousMI', label: 'Previous MI / ACS', type: 'boolean' },{ key: 'previousPCI', label: 'Previous PCI / CABG', type: 'boolean' },{ key: 'heartFailure', label: 'Heart Failure', type: 'boolean' },{ key: 'afib', label: 'Atrial Fibrillation', type: 'boolean' },{ key: 'stroke', label: 'Stroke / TIA', type: 'boolean' },{ key: 'smoking', label: 'Smoking', type: 'select', options: ['Never','Former','Current'] },{ key: 'familyCAD', label: 'Family History of CAD', type: 'boolean' },{ key: 'medications', label: 'Current Medications', type: 'text' }] },
      { id: 'vitals', label: 'Vitals & Exam', icon: '🩺', desc: 'BP, HR, JVP, heart sounds, oedema' },
      { id: 'ecg', label: 'ECG Interpretation', icon: '📊', desc: 'Rhythm, ischaemia, hypertrophy',
        questions: [{ key: 'rhythm', label: 'Rhythm', type: 'select', options: ['Sinus Rhythm','AF','SVT','VT','VFib','Atrial Flutter','Heart Block','Other'] },{ key: 'rate', label: 'Heart Rate', type: 'text' },{ key: 'axis', label: 'Axis', type: 'select', options: ['Normal','Left','Right','Extreme'] },{ key: 'stChanges', label: 'ST Changes', type: 'multi', options: ['ST Elevation','ST Depression','T Wave Inversion','None'] },{ key: 'qWaves', label: 'Q Waves', type: 'boolean' },{ key: 'lvh', label: 'LV Hypertrophy', type: 'boolean' },{ key: 'qtInterval', label: 'QT Interval', type: 'text' },{ key: 'interpretation', label: 'Overall Interpretation', type: 'text' }] },
      { id: 'scores', label: 'Cardiac Scores', icon: '📈', desc: 'HEART, CHA₂DS₂-VASc, TIMI',
        questions: [{ key: 'heartScore', label: 'HEART Score (0-10)', type: 'text' },{ key: 'cha2ds2vasc', label: 'CHA₂DS₂-VASc Score', type: 'text' },{ key: 'hasBled', label: 'HAS-BLED Score', type: 'text' },{ key: 'timiRisk', label: 'TIMI Risk Score', type: 'text' }] },
      { id: 'ddx', label: 'Differentials', icon: '🧠', desc: 'AI-powered cardiac differential' },
      { id: 'investigations', label: 'Investigations', icon: '🧪', desc: 'Troponin, BNP, echo, angiogram' },
      { id: 'treatment', label: 'Treatment', icon: '💊', desc: 'ACS protocol, HF management, rhythm control' },
      { id: 'plan', label: 'Plan & Summary', icon: '📄', desc: 'Discharge plan, follow-up, medications' },
    ],
  },

  IM: {
    key: 'IM',
    protocolReferences: [
      { name: 'Sepsis Pathway', steps: ['qSOFA ≥2 → start bundle', 'Blood cultures before antibiotics', 'IV antibiotics within 1h', 'Lactate, fluid resuscitation', 'MAP target ≥65 mmHg'] },
      { name: 'Community-Acquired Pneumonia', steps: ['CURB-65 severity score', 'Chest X-ray + blood cultures', 'Empiric antibiotics', 'Oxygen target SpO2 ≥94%', 'Review at 48h, de-escalate'] },
      { name: 'DVT Prophylaxis', steps: ['Assess risk (Caprini score)', 'LMWH or fondaparinux', 'Compression stockings', 'Early mobilisation', 'Duration based on risk'] },
      { name: 'Diabetic Ketoacidosis', steps: ['IV fluids 0.9% saline', 'Fixed-rate insulin infusion', 'Monitor K+, glucose, ketones', 'Correct K+ when <5.5', 'Transition to SC insulin when resolved'] },
    ],
    commonDifferentials: ['Sepsis', 'Pneumonia', 'UTI', 'Cellulitis', 'DKA', 'COPD exacerbation', 'Anaemia', 'Electrolyte disorder', 'AKI', 'CKD decompensation'],
    keyInvestigations: ['FBC', 'U&E', 'CRP', 'Blood cultures', 'Chest X-ray', 'Urinalysis', 'ECG', 'Lactate'],
    scoringSystems: [
      { name: 'qSOFA', calc: 'RR≥22 + Altered mental status + SBP≤100' },
      { name: 'CURB-65', calc: 'Confusion + Urea>7 + RR≥30 + BP<90/60 + Age≥65' },
      { name: 'NEWS2', calc: 'RR + SpO2 + BP + HR + Consciousness + Temp' },
    ],
    phases: [
      { id: 'biodata', label: 'Biodata', icon: '📋', desc: 'Patient demographics',
        questions: [{ key: 'patientName', label: 'Patient Name', type: 'text' },{ key: 'age', label: 'Age', type: 'text' },{ key: 'sex', label: 'Sex', type: 'select', options: ['Male','Female'] },{ key: 'hospitalId', label: 'Hospital ID', type: 'text' },{ key: 'admissionSource', label: 'Admission Source', type: 'select', options: ['ED','GP Referral','OPD','Transfer'] }] },
      { id: 'complaints', label: 'Complaints', icon: '🗣️', desc: 'Presenting symptoms',
        questions: [{ key: 'fever', label: 'Fever', type: 'boolean' },{ key: 'cough', label: 'Cough', type: 'boolean' },{ key: 'sob', label: 'Shortness of Breath', type: 'boolean' },{ key: 'abdominalPain', label: 'Abdominal Pain', type: 'boolean' },{ key: 'headache', label: 'Headache', type: 'boolean' },{ key: 'chestPain', label: 'Chest Pain', type: 'boolean' },{ key: 'nauseaVomiting', label: 'Nausea / Vomiting', type: 'boolean' },{ key: 'diarrhoea', label: 'Diarrhoea', type: 'boolean' },{ key: 'dysuria', label: 'Dysuria', type: 'boolean' },{ key: 'rash', label: 'Rash', type: 'boolean' }] },
      { id: 'hpi', label: 'HPI', icon: '📝', desc: 'History of presenting illness',
        questions: [{ key: 'onset', label: 'Onset', type: 'select', options: ['Sudden','Gradual'] },{ key: 'duration', label: 'Duration', type: 'text' },{ key: 'progression', label: 'Progression', type: 'select', options: ['Worsening','Stable','Improving'] },{ key: 'priorTreatment', label: 'Prior Treatment', type: 'text' },{ key: 'response', label: 'Response to Treatment', type: 'text' }] },
      { id: 'pmh', label: 'PMH', icon: '🏥', desc: 'Comorbidities and medications',
        questions: [{ key: 'diabetes', label: 'Diabetes', type: 'boolean' },{ key: 'hypertension', label: 'Hypertension', type: 'boolean' },{ key: 'copd', label: 'COPD / Asthma', type: 'boolean' },{ key: 'ckd', label: 'CKD', type: 'boolean' },{ key: 'hiv', label: 'HIV Status', type: 'select', options: ['Negative','Positive','Unknown'] },{ key: 'tb', label: 'TB History', type: 'boolean' },{ key: 'medications', label: 'Current Medications', type: 'text' },{ key: 'allergies', label: 'Allergies', type: 'text' }] },
      { id: 'vitals', label: 'Vitals & Exam', icon: '🩺', desc: 'General examination' },
      { id: 'investigations', label: 'Labs & Imaging', icon: '🧪', desc: 'Initial workup' },
      { id: 'scores', label: 'Severity Scores', icon: '📊', desc: 'NEWS2, qSOFA, CURB-65',
        questions: [{ key: 'news2', label: 'NEWS2 Score', type: 'text' },{ key: 'qsofa', label: 'qSOFA Score', type: 'text' },{ key: 'curb65', label: 'CURB-65 Score', type: 'text' }] },
      { id: 'ddx', label: 'Differentials', icon: '🧠', desc: 'Differential diagnosis' },
      { id: 'treatment', label: 'Treatment', icon: '💊', desc: 'Management plan' },
      { id: 'plan', label: 'Plan', icon: '📄', desc: 'Disposition' },
    ],
  },

  ENDO: {
    key: 'ENDO',
    protocolReferences: [
      { name: 'DKA Protocol', steps: ['0.9% saline 10-20 ml/kg bolus', 'Insulin infusion 0.1 U/kg/h', 'K+ replacement when <5.5', 'Monitor glucose hourly', 'Transition when pH>7.3, HCO3>15'] },
      { name: 'Thyroid Storm', steps: ['Beta-blocker (propranolol)', 'PTU 200mg q4h or methimazole', 'Iodine solution 1h after thionamide', 'Hydrocortisone 100mg q8h', 'Supportive care, cooling'] },
      { name: 'Hypoglycaemia Protocol', steps: ['Confirm glucose <3.9', '15g fast-acting glucose', 'Recheck in 15 min', 'Repeat if still <3.9', 'IV dextrose if unable to take PO'] },
    ],
    commonDifferentials: ['DKA', 'HHS', 'Thyroid Storm', 'Addisonian Crisis', 'Hypoglycaemia', 'SIADH', 'Cushing Syndrome', 'Pheochromocytoma'],
    keyInvestigations: ['HbA1c', 'Fasting glucose', 'TFT (TSH, FT4)', 'Cortisol', 'Ketones', 'Electrolytes', 'Urinalysis'],
    scoringSystems: [
      { name: 'DKA Severity', calc: 'pH + Glucose + Ketones + Anion gap' },
      { name: 'Burch-Wartofsky (Thyroid Storm)', calc: 'Temp + HR + CNS + GI + Precipitant' },
    ],
    phases: [
      { id: 'biodata', label: 'Biodata', icon: '📋' },
      { id: 'complaints', label: 'Complaints', icon: '🗣️' },
      { id: 'hpi', label: 'HPI', icon: '📝' },
      { id: 'pmh', label: 'PMH', icon: '🏥' },
      { id: 'vitals', label: 'Vitals', icon: '🩺' },
      { id: 'labs', label: 'Labs', icon: '🧪' },
      { id: 'ddx', label: 'Differentials', icon: '🧠' },
      { id: 'treatment', label: 'Treatment', icon: '💊' },
      { id: 'plan', label: 'Plan', icon: '📄' },
    ],
  },

  RESP: {
    key: 'RESP',
    protocolReferences: [
      { name: 'COPD Exacerbation', steps: ['O2 target 88-92%', 'Nebulised salbutamol + ipratropium', 'Oral prednisolone 30mg x 5 days', 'Antibiotics if purulent sputum', 'Consider NIV if pH<7.35, pCO2>6'] },
      { name: 'Asthma Attack', steps: ['Salbutamol 4-10 puffs via spacer', 'Prednisolone 40mg PO', 'Monitor PEFR and SpO2', 'IV magnesium if severe', 'Chest X-ray to exclude pneumothorax'] },
      { name: 'Pleural Effusion', steps: ['Chest X-ray + USS', 'Diagnostic aspiration', 'Light criteria for exudate', 'Send culture, cytology, ADA', 'Chest drain if empyema or large'] },
    ],
    commonDifferentials: ['COPD exacerbation', 'Asthma', 'Pneumonia', 'PE', 'Pleural Effusion', 'Pneumothorax', 'ILD', 'Lung Cancer', 'Bronchiectasis', 'Tuberculosis'],
    keyInvestigations: ['Chest X-ray', 'ABG', 'Spirometry/PFT', 'CT Chest', 'Sputum Culture', 'GeneXpert', 'Pleural Fluid Analysis'],
    scoringSystems: [
      { name: 'GOLD', calc: 'FEV1 + Exacerbations + Symptoms' },
      { name: 'BAP-65', calc: 'BUN + Altered mental + Pulse≥110 + Age≥65' },
    ],
    phases: [
      { id: 'biodata', label: 'Biodata', icon: '📋' },
      { id: 'complaints', label: 'Complaints', icon: '🗣️' },
      { id: 'hpi', label: 'Breathing HPI', icon: '📝' },
      { id: 'pmh', label: 'PMH', icon: '🏥' },
      { id: 'vitals', label: 'Vitals & Auscultation', icon: '🩺' },
      { id: 'abg', label: 'ABG Interpretation', icon: '💉' },
      { id: 'imaging', label: 'Chest Imaging', icon: '📡' },
      { id: 'ddx', label: 'Differentials', icon: '🧠' },
      { id: 'treatment', label: 'Treatment', icon: '💊' },
      { id: 'plan', label: 'Plan', icon: '📄' },
    ],
  },

  RENAL: {
    key: 'RENAL',
    protocolReferences: [
      { name: 'AKI Management', steps: ['Assess volume status', 'Hold nephrotoxins', 'Correct hypovolaemia', 'Monitor urine output', 'Consider RRT if refractory'] },
      { name: 'Hyperkalaemia Protocol', steps: ['ECG first', 'Calcium gluconate if ECG changes', 'Insulin + dextrose', 'Salbutamol neb', 'Resonium or dialysis if refractory'] },
      { name: 'CKD Management', steps: ['BP control ACEI/ARB', 'Dietary protein restriction', 'Anaemia management (iron/ESA)', 'Metabolic bone disease', 'Prepare for RRT when eGFR<15'] },
    ],
    commonDifferentials: ['AKI (pre/renal/post)', 'CKD', 'Glomerulonephritis', 'UTI/Pyelonephritis', 'Electrolyte Disorder', 'HTN urgency'],
    keyInvestigations: ['U&E', 'eGFR', 'Urinalysis', 'Urine ACR', 'Renal US', 'ANCA/ANA/Complement'],
    scoringSystems: [
      { name: 'KDIGO AKI', calc: 'Cr rise + Urine output' },
      { name: 'CKD-EPI eGFR', calc: 'Cr + Age + Sex + Race' },
    ],
    phases: [
      { id: 'biodata', label: 'Biodata', icon: '📋' },
      { id: 'complaints', label: 'Complaints', icon: '🗣️' },
      { id: 'hpi', label: 'HPI', icon: '📝' },
      { id: 'pmh', label: 'PMH', icon: '🏥' },
      { id: 'vitals', label: 'Vitals & Fluid Balance', icon: '🩺' },
      { id: 'labs', label: 'Renal Labs', icon: '🧪' },
      { id: 'ddx', label: 'Differentials', icon: '🧠' },
      { id: 'treatment', label: 'Treatment', icon: '💊' },
      { id: 'plan', label: 'RRT Plan', icon: '📄' },
    ],
  },

  NEURO: {
    key: 'NEURO',
    protocolReferences: [
      { name: 'Acute Stroke', steps: ['CT brain within 20 min', 'NIHSS assessment', 'Thrombolysis if <4.5h and no CI', 'Thrombectomy if large vessel', 'Aspirin after 24h if no haemorrhage'] },
      { name: 'Seizure Management', steps: ['ABCDE approach', 'Check glucose', 'IV lorazepam 4mg', 'Phenytoin loading if ongoing', 'CT head and EEG'] },
      { name: 'Meningitis', steps: ['CT head if CI', 'LP for opening pressure', 'CSF culture + PCR', 'Empiric ceftriaxone + vancomycin', 'Dexamethasone if suspected pneumococcal'] },
    ],
    commonDifferentials: ['Stroke/ TIA', 'Seizure', 'Migraine', 'Meningitis/Encephalitis', 'GBS', 'Myasthenia Gravis', 'Parkinson Disease', 'Multiple Sclerosis'],
    keyInvestigations: ['CT Brain', 'MRI Brain', 'EEG', 'LP with CSF analysis', 'NCS/EMG', 'Autoimmune panel'],
    scoringSystems: [
      { name: 'NIHSS', calc: '15-item stroke severity' },
      { name: 'GCS', calc: 'Eye + Verbal + Motor' },
    ],
    phases: [
      { id: 'biodata', label: 'Biodata', icon: '📋' },
      { id: 'complaints', label: 'Complaints', icon: '🗣️' },
      { id: 'hpi', label: 'Neurological HPI', icon: '📝' },
      { id: 'pmh', label: 'PMH', icon: '🏥' },
      { id: 'exam', label: 'Neuro Exam', icon: '🩺' },
      { id: 'imaging', label: 'Neuroimaging', icon: '📡' },
      { id: 'ddx', label: 'Differentials', icon: '🧠' },
      { id: 'treatment', label: 'Treatment', icon: '💊' },
      { id: 'plan', label: 'Plan', icon: '📄' },
    ],
  },

  GI: {
    key: 'GI',
    protocolReferences: [
      { name: 'Upper GI Bleed', steps: ['ABC resuscitation', 'IV PPI (omeprazole 80mg)', 'Urgent endoscopy <24h', 'VARICEAL: terlipressin + antibiotics', 'Blakemore tube if uncontrolled'] },
      { name: 'H Pylori Eradication', steps: ['PPI 20mg BD', 'Amoxicillin 1g BD', 'Clarithromycin 500mg BD', 'Duration 14 days', 'Urea breath test at 4-6 weeks'] },
      { name: 'Acute Pancreatitis', steps: ['Aggressive IV fluids', 'Analgesia', 'CT Abdomen at 48-72h', 'Severity scoring (Ranson/Glasgow)', 'ERCP if cholangitis'] },
    ],
    commonDifferentials: ['GERD', 'PUD', 'Gastritis', 'Hepatitis', 'Cholecystitis', 'Pancreatitis', 'IBD', 'IBS', 'GI Bleed', 'Cirrhosis'],
    keyInvestigations: ['Oesophagogastroduodenoscopy', 'Colonoscopy', 'Abdominal US', 'LFT', 'H pylori test', 'Faecal calprotectin'],
    scoringSystems: [
      { name: 'Glasgow-Blatchford', calc: 'Urea + Hb + BP + HR + Melena + Syncope + Liver disease + HF' },
      { name: 'Child-Pugh', calc: 'Bilirubin + Albumin + PT + Ascites + Encephalopathy' },
    ],
    phases: [
      { id: 'biodata', label: 'Biodata', icon: '📋' },
      { id: 'complaints', label: 'GI Complaints', icon: '🗣️' },
      { id: 'hpi', label: 'HPI', icon: '📝' },
      { id: 'pmh', label: 'PMH', icon: '🏥' },
      { id: 'vitals', label: 'Vitals & Abdomen', icon: '🩺' },
      { id: 'imaging', label: 'Imaging', icon: '📡' },
      { id: 'ddx', label: 'Differentials', icon: '🧠' },
      { id: 'treatment', label: 'Treatment', icon: '💊' },
      { id: 'plan', label: 'Plan', icon: '📄' },
    ],
  },

  OB: {
    key: 'OB',
    protocolReferences: [
      { name: 'Pre-eclampsia', steps: ['BP ≥140/90 + proteinuria', 'IV labetalol or nifedipine', 'MgSO4 seizure prophylaxis', 'Corticosteroids for fetal lung', 'Delivery planning at 37wk'] },
      { name: 'Postpartum Haemorrhage', steps: ['Tone: uterine massage + oxytocin', 'Trauma: examine genital tract', 'Tissue: explore uterus', 'Thrombin: give tranexamic acid', 'Activate MTP if ongoing'] },
      { name: 'Eclampsia', steps: ['ABCDE, left lateral', 'MgSO4 4g IV loading + 1g/h', 'Control BP (labetalol)', 'Do NOT use diazepam first line', 'Deliver after stabilisation'] },
    ],
    commonDifferentials: ['Pre-eclampsia', 'Gestational HTN', 'Placental abruption', 'PPH', 'Chorioamnionitis', 'Obstructed labour', 'Uterine rupture'],
    keyInvestigations: ['BP monitoring', 'Urine protein', 'FBC', 'LFT', 'U&E', 'CTG', 'Obstetric US'],
    scoringSystems: [
      { name: 'MEOWS', calc: 'Modified Early Obstetric Warning Score' },
      { name: 'sFlt-1/PlGF', calc: 'Angiogenic ratio for pre-eclampsia' },
    ],
    phases: [
      { id: 'biodata', label: 'Biodata', icon: '📋' },
      { id: 'complaints', label: 'Obstetric Hx', icon: '🗣️' },
      { id: 'hpi', label: 'Presenting HPI', icon: '📝' },
      { id: 'obhx', label: 'Obstetric History', icon: '🤰' },
      { id: 'vitals', label: 'Vitals & Exam', icon: '🩺' },
      { id: 'monitoring', label: 'Fetal Monitoring', icon: '📊' },
      { id: 'ddx', label: 'Differentials', icon: '🧠' },
      { id: 'treatment', label: 'Management', icon: '💊' },
      { id: 'plan', label: 'Delivery Plan', icon: '📄' },
    ],
  },

  PSYCH: {
    key: 'PSYCH',
    protocolReferences: [
      { name: 'Suicide Risk Assessment', steps: ['Ask directly about suicidal thoughts', 'Assess plan, means, intent', 'Check protective factors', 'PHQ-9 question 9', 'Low threshold for admission'] },
      { name: 'Acute Agitation', steps: ['Verbal de-escalation first', 'Offer oral medication', 'IM if refuses oral or risk', 'Haloperidol + lorazepam', 'Monitor for NMS/QTc'] },
      { name: 'Alcohol Withdrawal', steps: ['CIWA-Ar assessment hourly', 'Benzodiazepine protocol', 'Thiamine 100mg IV/IM', 'Monitor for seizures', 'Consider ICU if severe'] },
    ],
    commonDifferentials: ['Major Depressive Disorder', 'Bipolar Disorder', 'Schizophrenia', 'GAD', 'PTSD', 'Substance Use Disorder', 'Neurocognitive Disorder', 'Personality Disorder'],
    keyInvestigations: ['PHQ-9', 'GAD-7', 'MDQ', 'AUDIT', 'TFT', 'B12/Folate', 'Toxicology screen'],
    scoringSystems: [
      { name: 'PHQ-9', calc: '9-question depression severity' },
      { name: 'GAD-7', calc: '7-question anxiety severity' },
      { name: 'Young Mania', calc: 'Mania severity rating' },
    ],
    phases: [
      { id: 'biodata', label: 'Biodata', icon: '📋' },
      { id: 'complaints', label: 'Presenting Complaint', icon: '🗣️' },
      { id: 'hpi', label: 'Psychiatric HPI', icon: '📝' },
      { id: 'pmh', label: 'PMH', icon: '🏥' },
      { id: 'mse', label: 'Mental State Exam', icon: '🧠' },
      { id: 'risk', label: 'Risk Assessment', icon: '⚠️' },
      { id: 'ddx', label: 'Differentials', icon: '🧠' },
      { id: 'treatment', label: 'Treatment Plan', icon: '💊' },
      { id: 'plan', label: 'Disposition', icon: '📄' },
    ],
  },

  SURG: {
    key: 'SURG',
    protocolReferences: [
      { name: 'Acute Abdomen', steps: ['ABC assessment', 'IV access + bloods', 'Analgesia after assessment', 'CT abdomen with contrast', 'Urgent laparotomy if peritonitis'] },
      { name: 'Trauma / ATLS', steps: ['Primary survey ABCDE', 'C-spine immobilisation', 'Chest X-ray + Pelvis + FAST', 'CT trauma series', 'Damage control if unstable'] },
      { name: 'Bowel Obstruction', steps: ['NG tube + IV fluids', 'CT with oral contrast', 'Monitor for strangulation', 'Conservative if adhesive', 'Surgery if complete/strangulated'] },
    ],
    commonDifferentials: ['Appendicitis', 'Cholecystitis', 'Bowel Obstruction', 'Perforated Viscus', 'Pancreatitis', 'Mesenteric Ischaemia', 'Incarcerated Hernia', 'AAA'],
    keyInvestigations: ['FBC', 'CRP', 'LFT', 'Amylase/Lipase', 'CT Abdomen/Pelvis', 'Abdominal US', 'AXR'],
    scoringSystems: [
      { name: 'Alvarado', calc: 'Migration + Anorexia + Nausea + RLQ Pain + Rebound + Fever + WBC' },
      { name: 'ASA', calc: 'Pre-operative physical status' },
    ],
    phases: [
      { id: 'biodata', label: 'Biodata', icon: '📋' },
      { id: 'complaints', label: 'Surgical Complaint', icon: '🗣️' },
      { id: 'hpi', label: 'HPI', icon: '📝' },
      { id: 'pmh', label: 'PMH', icon: '🏥' },
      { id: 'vitals', label: 'Vitals & Abdomen', icon: '🩺' },
      { id: 'imaging', label: 'Imaging', icon: '📡' },
      { id: 'ddx', label: 'Differentials', icon: '🧠' },
      { id: 'treatment', label: 'Operative Plan', icon: '🔪' },
      { id: 'plan', label: 'Post-Op Plan', icon: '📄' },
    ],
  },

  ORTHO: {
    key: 'ORTHO',
    protocolReferences: [
      { name: 'Fracture Management', steps: ['ATLS primary survey', 'Splint + neurovascular check', 'X-ray 2 views + joint above/below', 'Reduce if displaced', 'ORIF vs conservative'] },
      { name: 'Compartment Syndrome', steps: ['High suspicion post-trauma', 'Pain out of proportion', 'Measure compartment pressure', 'Urgent fasciotomy if >30mmHg', 'Monitor CK and renal function'] },
      { name: 'Septic Arthritis', steps: ['Joint aspiration + culture', 'Empiric IV antibiotics', 'Urgent orthopaedic referral', 'Arthroscopic washout', 'Monitor CRP daily'] },
    ],
    commonDifferentials: ['Fracture', 'Dislocation', 'Septic Arthritis', 'Osteomyelitis', 'Cellulitis', 'DVT', 'Gout/Pseudogout', 'Tendon Injury'],
    keyInvestigations: ['X-ray 2 views', 'CT if complex fracture', 'MRI if ligament/tendon', 'CRP', 'Joint aspiration', 'Blood cultures'],
    scoringSystems: [
      { name: 'Gustilo-Anderson', calc: 'Open fracture classification' },
      { name: 'Rockwood', calc: 'Shoulder dislocation classification' },
    ],
    phases: [
      { id: 'biodata', label: 'Biodata', icon: '📋' },
      { id: 'complaints', label: 'Ortho Complaint', icon: '🗣️' },
      { id: 'hpi', label: 'HPI', icon: '📝' },
      { id: 'pmh', label: 'PMH', icon: '🏥' },
      { id: 'vitals', label: 'Vitals & Limb Exam', icon: '🩺' },
      { id: 'imaging', label: 'Imaging', icon: '📡' },
      { id: 'ddx', label: 'Differentials', icon: '🧠' },
      { id: 'treatment', label: 'Management', icon: '💊' },
      { id: 'plan', label: 'Rehab Plan', icon: '📄' },
    ],
  },

  DERM: {
    key: 'DERM',
    protocolReferences: [
      { name: 'Eczema Management', steps: ['Emollients regularly', 'Topical steroids stepwise', 'Wet wraps for flares', 'Antihistamines for itch', 'Avoid triggers'] },
      { name: 'Cellulitis Treatment', steps: ['Mark erythema border', 'IV flucloxacillin + benzylpenicillin', 'Elevate affected limb', 'Monitor CRP/hCRP', 'Switch to oral when improving'] },
      { name: 'Skin Cancer Suspicion', steps: ['ABCDE assessment', 'Dermatoscopy', 'Excisional biopsy', 'Histopathology review', 'MDT discussion'] },
    ],
    commonDifferentials: ['Eczema', 'Psoriasis', 'Cellulitis', 'Fungal Infection', 'Contact Dermatitis', 'Urticaria', 'Skin Cancer', 'Acne', 'Rosacea'],
    keyInvestigations: ['Skin biopsy', 'KOH preparation', 'Woods lamp', 'Patch testing', 'Dermatoscopy'],
    scoringSystems: [
      { name: 'PASI', calc: 'Psoriasis severity' },
      { name: 'ABCDE', calc: 'Melanoma screening' },
    ],
    phases: [
      { id: 'biodata', label: 'Biodata', icon: '📋' },
      { id: 'complaints', label: 'Skin Complaint', icon: '🗣️' },
      { id: 'hpi', label: 'Dermatological HPI', icon: '📝' },
      { id: 'pmh', label: 'PMH', icon: '🏥' },
      { id: 'exam', label: 'Skin Exam', icon: '🩺' },
      { id: 'ddx', label: 'Differentials', icon: '🧠' },
      { id: 'treatment', label: 'Treatment', icon: '💊' },
      { id: 'plan', label: 'Plan', icon: '📄' },
    ],
  },

  HAEM: {
    key: 'HAEM',
    protocolReferences: [
      { name: 'Anaemia Workup', steps: ['FBC + reticulocyte count', 'Iron studies, B12, folate', 'Peripheral blood film', 'Haemolysis screen', 'Bone marrow if unexplained'] },
      { name: 'Sickle Cell Crisis', steps: ['O2 if hypoxic', 'IV fluids', 'Analgesia (PCA morphine)', 'Antibiotics if febrile', 'Exchange transfusion if severe'] },
      { name: 'DIC Management', steps: ['Treat underlying cause', 'Platelets if <50 + bleeding', 'FFP if PT/APTT elevated', 'Cryoprecipitate if fibrinogen <1', 'Monitor fibrinogen, platelets, D-dimer'] },
    ],
    commonDifferentials: ['Anaemia (IDA/Macrocytic/AHA)', 'Sickle Cell Disease', 'Thalassaemia', 'Leukaemia', 'Lymphoma', 'Multiple Myeloma', 'ITP', 'DIC', 'VTE'],
    keyInvestigations: ['FBC + Film', 'Coagulation', 'Iron/B12/Folate', 'Hb Electrophoresis', 'Bone Marrow Aspirate', 'Flow Cytometry'],
    scoringSystems: [
      { name: 'ISTH DIC', calc: 'Platelets + D-dimer + PT + Fibrinogen' },
      { name: 'IPSS-R', calc: 'MDS risk stratification' },
    ],
    phases: [
      { id: 'biodata', label: 'Biodata', icon: '📋' },
      { id: 'complaints', label: 'Complaints', icon: '🗣️' },
      { id: 'hpi', label: 'HPI', icon: '📝' },
      { id: 'pmh', label: 'PMH', icon: '🏥' },
      { id: 'vitals', label: 'Vitals & Lymph Exam', icon: '🩺' },
      { id: 'labs', label: 'Haematology Labs', icon: '🧪' },
      { id: 'ddx', label: 'Differentials', icon: '🧠' },
      { id: 'treatment', label: 'Treatment', icon: '💊' },
      { id: 'plan', label: 'Plan', icon: '📄' },
    ],
  },

  ONCO: {
    key: 'ONCO',
    protocolReferences: [
      { name: 'Febrile Neutropenia', steps: ['Blood cultures + CXR', 'IV piperacillin-tazobactam', 'Monitor for septic shock', 'G-CSF if high risk', 'Continue until afebrile + ANC>0.5'] },
      { name: 'Tumour Lysis Syndrome', steps: ['IV fluids 3L/m²/day', 'Allopurinol 300mg', 'Rasburicase if uric acid high', 'Monitor K+, PO4, Ca, uric acid', 'Consider haemodialysis if severe'] },
      { name: 'Chemotherapy Nausea', steps: ['Aprepitant D1-3', 'Ondansetron 8mg TDS', 'Dexamethasone 8mg OD', 'Metoclopramide PRN', 'Rescue with olanzapine'] },
    ],
    commonDifferentials: ['Solid Tumour (breast/lung/colon)', 'Leukaemia', 'Lymphoma', 'MDS/MPN', 'Multiple Myeloma', 'Sarcoma', 'Brain Tumour'],
    keyInvestigations: ['CT/MRI/PET imaging', 'Biopsy + histopathology', 'Immunohistochemistry', 'Genetic profiling', 'Tumour markers', 'Bone marrow biopsy'],
    scoringSystems: [
      { name: 'ECOG', calc: 'Performance status 0-5' },
      { name: 'MASCC', calc: 'Febrile neutropenia risk' },
    ],
    phases: [
      { id: 'biodata', label: 'Biodata', icon: '📋' },
      { id: 'complaints', label: 'Oncology Hx', icon: '🗣️' },
      { id: 'hpi', label: 'Presenting HPI', icon: '📝' },
      { id: 'pmh', label: 'PMH', icon: '🏥' },
      { id: 'vitals', label: 'Vitals & Performance', icon: '🩺' },
      { id: 'staging', label: 'Staging & Imaging', icon: '📡' },
      { id: 'ddx', label: 'Differentials', icon: '🧠' },
      { id: 'treatment', label: 'Chemo/RT Plan', icon: '💊' },
      { id: 'plan', label: 'MDT Plan', icon: '📄' },
    ],
  },

  PAED: {
    key: 'PAED',
    protocolReferences: [
      { name: 'Severe Pneumonia', steps: ['Amoxicillin PO 40-45 mg/kg/day', 'Benzylpenicillin IV + Gentamicin if severe', 'O2 target SpO2 ≥92%', 'Monitor for chest indrawing', 'Failure at 48h: escalate to Ceftriaxone'] },
      { name: 'Bronchiolitis', steps: ['Supportive care, nasal suction', 'O2 if SpO2 <92%', 'Trial of salbutamol if wheeze', 'IV fluids if unable to feed', 'CPAP if severe distress'] },
      { name: 'Acute Asthma', steps: ['Salbutamol 4-8 puffs via spacer', 'Prednisolone 1-2 mg/kg x 3-5 days', 'Nebulised ipratropium if severe', 'IV magnesium if life-threatening', 'PICU review if no response'] },
      { name: 'TB in Children', steps: ['RHZE x 2 months intensive', 'RH x 4 months continuation', 'Pyridoxine 25-50 mg daily', 'Steroids for TB meningitis', 'Contact tracing + IPT'] },
      { name: 'Paediatric DKA', steps: ['0.9% saline 10 ml/kg bolus', 'Insulin 0.05-0.1 U/kg/h', 'K+ replacement when <5.5', 'Monitor for cerebral oedema', 'Transition to SC insulin when eating'] },
    ],
    commonDifferentials: ['Pneumonia', 'Bronchiolitis', 'Asthma', 'TB', 'Malaria', 'Sepsis', 'Meningitis', 'Gastroenteritis', 'UTI', 'Malnutrition'],
    keyInvestigations: ['Chest X-ray', 'FBC+DC', 'CRP', 'Blood cultures', 'Malaria RDT', 'GeneXpert', 'LP if meningitis suspected', 'Stool MC&S'],
    scoringSystems: [
      { name: 'WHO IMCI', calc: 'Integrated Management of Childhood Illness' },
      { name: 'Pediatric GCS', calc: 'Modified GCS for children' },
      { name: 'Pediatric qSOFA', calc: 'Age-adjusted qSOFA' },
    ],
    phases: [
      { id: 'biodata', label: 'Biodata', icon: '📋', desc: 'Patient demographics & clinical context' },
      { id: 'complaints', label: 'Chief Complaints', icon: '🗣️', desc: 'Symptoms & timeline' },
      { id: 'hpi', label: 'HPI', icon: '📝', desc: 'History of Presenting Illness' },
      { id: 'pmh', label: 'PMH', icon: '🏥', desc: 'Past Medical History' },
      { id: 'birth', label: 'Birth History', icon: '👶', desc: 'Antenatal, delivery, neonatal' },
      { id: 'development', label: 'Development', icon: '🧒', desc: 'Milestones & growth' },
      { id: 'immunization', label: 'Immunization', icon: '💉', desc: 'Vaccination status' },
      { id: 'nutrition', label: 'Nutrition', icon: '🍽️', desc: 'Feeding & anthropometry' },
      { id: 'family', label: 'Family & Social', icon: '👨‍👩‍👧‍👦', desc: 'Environmental & genetic risks' },
      { id: 'vitals', label: 'Vitals & Exam', icon: '🩺', desc: 'Vital signs & physical exam' },
      { id: 'ddx', label: 'Differentials', icon: '🧠', desc: 'AI-powered differentials' },
      { id: 'management', label: 'Management', icon: '💊', desc: 'Treatment plan & prescriptions' },
      { id: 'plan', label: 'Plan & Summary', icon: '📄', desc: 'Clinical note & discharge plan' },
    ],
  },

  EM: {
    key: 'EM',
    protocolReferences: [
      { name: 'Anaphylaxis', steps: ['ABCDE assessment', 'Adrenaline 0.5mg IM anterolateral thigh', 'IV fluids 500-1000mL crystalloid', 'Chlorphenamine 10mg IM/IV', 'Hydrocortisone 200mg IV'] },
      { name: 'Sepsis Resuscitation', steps: ['qSOFA ≥2 → sepsis bundle', 'Blood cultures before antibiotics', '30mL/kg crystalloid if lactate ≥4', 'Broad-spectrum antibiotics within 1h', 'Vasopressors if MAP <65'] },
      { name: 'Major Trauma / ATLS', steps: ['Primary survey ABCDE + C-spine', 'CXR + Pelvis XR + E-FAST', 'TXA 1g IV if haemorrhage', 'CT trauma series after stabilisation', 'Damage control surgery if unstable'] },
      { name: 'Status Epilepticus', steps: ['ABCDE + check glucose', 'Lorazepam 4mg IV (max 2 doses)', 'Phenytoin 18mg/kg IV if ongoing', 'Anaesthetic dose propofol if refractory', 'CT head + EEG monitoring'] },
      { name: 'Acute Stroke', steps: ['CT brain within 20 min', 'NIHSS assessment', 'Thrombolysis if <4.5h and no CI', 'Thrombectomy if large vessel occlusion', 'Aspirin 300mg after 24h if no haemorrhage'] },
    ],
    commonDifferentials: ['ACS', 'Sepsis', 'PE', 'Stroke', 'Anaphylaxis', 'Status Epilepticus', 'Haemorrhagic Shock', 'Tension Pneumothorax', 'Cardiac Tamponade', 'Aortic Dissection'],
    keyInvestigations: ['ECG', 'Chest X-ray', 'ABG', 'Lactate', 'Troponin', 'FBC', 'U&E', 'CT head/body'],
    scoringSystems: [
      { name: 'NEWS2', calc: 'RR + SpO2 + BP + HR + Consciousness + Temp' },
      { name: 'qSOFA', calc: 'RR≥22 + Altered mental status + SBP≤100' },
      { name: 'GCS', calc: 'Eye + Verbal + Motor response' },
    ],
    phases: [
      { id: 'biodata', label: 'Biodata', icon: '📋', desc: 'Triage category and demographics',
        questions: [{ key: 'patientName', label: 'Patient Name', type: 'text' },{ key: 'age', label: 'Age', type: 'text' },{ key: 'sex', label: 'Sex', type: 'select', options: ['Male','Female'] },{ key: 'hospitalId', label: 'Hospital ID', type: 'text' },{ key: 'triageCategory', label: 'Triage Category', type: 'select', options: ['Resus','Emergent','Urgent','Semi-urgent','Non-urgent'] },{ key: 'arrivalMode', label: 'Arrival Mode', type: 'select', options: ['Self','Ambulance','HEMS','Police','Transfer'] },{ key: 'mechanism', label: 'Mechanism / Context', type: 'text' }] },
      { id: 'triage', label: 'Triage Assessment', icon: '🚨', desc: 'ABCDE primary survey',
        questions: [{ key: 'airway', label: 'Airway Patent', type: 'boolean' },{ key: 'breathing', label: 'Breathing Adequate', type: 'boolean' },{ key: 'circulation', label: 'Circulation Intact', type: 'boolean' },{ key: 'disability', label: 'GCS', type: 'text' },{ key: 'exposure', label: 'Exposure / Temp', type: 'text' }] },
      { id: 'complaints', label: 'Chief Complaints', icon: '🗣️', desc: 'Presenting symptoms',
        questions: [{ key: 'chestPain', label: 'Chest Pain', type: 'boolean' },{ key: 'sob', label: 'Shortness of Breath', type: 'boolean' },{ key: 'trauma', label: 'Trauma', type: 'boolean' },{ key: 'alteredLOC', label: 'Altered LOC', type: 'boolean' },{ key: 'bleeding', label: 'Bleeding', type: 'boolean' },{ key: 'fever', label: 'Fever', type: 'boolean' },{ key: 'abdominalPain', label: 'Abdominal Pain', type: 'boolean' },{ key: 'headache', label: 'Headache', type: 'boolean' }] },
      { id: 'hpi', label: 'HPI & Events', icon: '📝', desc: 'Timeline of events, onset, progression' },
      { id: 'pmh', label: 'PMH & Meds', icon: '🏥', desc: 'Comorbidities, medications, allergies' },
      { id: 'abcde', label: 'ABCDE Workflow', icon: '🩺', desc: 'Systematic resuscitation assessment',
        questions: [{ key: 'airwayIntervention', label: 'Airway Intervention', type: 'select', options: ['None','O2','OPA/NPA','SGA','ETT','Cricothyroidotomy'] },{ key: 'o2Delivery', label: 'O2 Delivery', type: 'select', options: ['Room Air','Nasal Cannula','Venturi Mask','Non-Rebreather','CPAP/NIV','Ventilator'] },{ key: 'ivAccess', label: 'IV Access', type: 'select', options: ['None','Peripheral','IO','Central'] },{ key: 'fluidsGiven', label: 'Fluids Given', type: 'text' },{ key: 'vasopressors', label: 'Vasopressors', type: 'boolean' }] },
      { id: 'investigations', label: 'Labs & Imaging', icon: '🧪', desc: 'Bedside and lab investigations' },
      { id: 'scores', label: 'Severity Scores', icon: '📊', desc: 'NEWS2, qSOFA, GCS' },
      { id: 'ddx', label: 'Differentials', icon: '🧠', desc: 'ED differentials' },
      { id: 'treatment', label: 'ED Treatment', icon: '💊', desc: 'Resuscitation and specific treatment' },
      { id: 'plan', label: 'Disposition', icon: '📄', desc: 'Admit, discharge, or transfer decision' },
    ],
  },

  ICU: {
    key: 'ICU',
    protocolReferences: [
      { name: 'ARDS Ventilation', steps: ['TV 6mL/kg PBW', 'Plateau pressure <30 cmH2O', 'PEEP titration per FiO2-PEEP table', 'Prone positioning if PF <150 for ≥16h/day', 'Consider ECMO if PF <100'] },
      { name: 'Septic Shock', steps: ['Noradrenaline first line, target MAP ≥65', 'Add vasopressin 0.03 U/min as second line', 'Hydrocortisone 50mg IV QID if pressor-dependent', 'Fluid resuscitation guided by passive leg raise', 'Lactate clearance target >20% at 6h'] },
      { name: 'VAP Management', steps: ['Clinical suspicion: new infiltrate + fever', 'BAL/mini-BAL for culture before antibiotics', 'Empiric anti-pseudomonal beta-lactam + MRSA coverage', 'De-escalate at 48-72h based on culture', 'Duration 7-8 days'] },
      { name: 'Sedation Protocol', steps: ['Daily sedation interruption', 'Target RASS 0 to -2 (calm/arousable)', 'Propofol or dexmedetomidine first line', 'Analgesia before sedation', 'Delirium screening (CAM-ICU) daily'] },
    ],
    commonDifferentials: ['Septic Shock', 'ARDS', 'VAP', 'Cardiogenic Shock', 'Hypovolaemic Shock', 'Acute Pancreatitis', 'DKA/HHS', 'MODS', 'AKI requiring RRT', 'Intracranial Hypertension'],
    keyInvestigations: ['ABG', 'Lactate', 'Procalcitonin', 'Blood cultures', 'Chest X-ray', 'Troponin', 'Coagulation profile', 'Echocardiogram'],
    scoringSystems: [
      { name: 'SOFA', calc: 'Resp + Coag + Liver + CVS + CNS + Renal organ scores' },
      { name: 'APACHE II', calc: 'Physiology + Age + Chronic Health points' },
      { name: 'RASS', calc: 'Richmond Agitation-Sedation Scale -5 to +4' },
    ],
    phases: [
      { id: 'biodata', label: 'Biodata', icon: '📋', desc: 'ICU admission data',
        questions: [{ key: 'patientName', label: 'Patient Name', type: 'text' },{ key: 'age', label: 'Age', type: 'text' },{ key: 'sex', label: 'Sex', type: 'select', options: ['Male','Female'] },{ key: 'hospitalId', label: 'Hospital ID', type: 'text' },{ key: 'admissionSource', label: 'Admission Source', type: 'select', options: ['ED','Ward','OT','Other ICU','External Transfer'] },{ key: 'admittingDiagnosis', label: 'Admitting Diagnosis', type: 'text' },{ key: 'codeStatus', label: 'Code Status', type: 'select', options: ['Full Code','DNAR','DNI','Comfort Care'] }] },
      { id: 'complaints', label: 'ICU Presenting Problem', icon: '🗣️', desc: 'Primary ICU indication' },
      { id: 'hpi', label: 'ICU HPI', icon: '📝', desc: 'Pre-ICU course and events',
        questions: [{ key: 'preICUStay', label: 'Pre-ICU LOS (days)', type: 'text' },{ key: 'priorInterventions', label: 'Prior Interventions', type: 'multi', options: ['Intubation','Central Line','CRRT','Vasopressors','Surgery'] }] },
      { id: 'pmh', label: 'PMH', icon: '🏥', desc: 'Comorbidities and baseline status' },
      { id: 'vitals', label: 'Vitals & Monitoring', icon: '🩺', desc: 'Haemodynamics, ventilator settings',
        questions: [{ key: 'hr', label: 'Heart Rate', type: 'text' },{ key: 'bp', label: 'BP (MAP)', type: 'text' },{ key: 'spo2', label: 'SpO2', type: 'text' },{ key: 'cvv', label: 'CVP/ScvO2', type: 'text' },{ key: 'ventMode', label: 'Ventilator Mode', type: 'select', options: ['PCV','VCV','PSV','PRVC','SIMV','CPAP'] },{ key: 'fio2', label: 'FiO2', type: 'text' },{ key: 'peep', label: 'PEEP', type: 'text' },{ key: 'sedation', label: 'Sedation (RASS)', type: 'text' }] },
      { id: 'organ', label: 'Organ Support', icon: '⚡', desc: 'Vasopressors, RRT, ventilation',
        questions: [{ key: 'vasopressorType', label: 'Vasopressor', type: 'select', options: ['None','Noradrenaline','Vasopressin','Adrenaline','Dobutamine'] },{ key: 'vasopressorDose', label: 'Vasopressor Dose (mcg/kg/min)', type: 'text' },{ key: 'rrt', label: 'RRT', type: 'boolean' },{ key: 'pao2fio2', label: 'PaO2/FiO2 Ratio', type: 'text' }] },
      { id: 'investigations', label: 'ICU Labs', icon: '🧪', desc: 'Daily labs and microbiology' },
      { id: 'scores', label: 'ICU Scores', icon: '📊', desc: 'SOFA, APACHE II',
        questions: [{ key: 'sofa', label: 'SOFA Score', type: 'text' },{ key: 'apache2', label: 'APACHE II', type: 'text' }] },
      { id: 'ddx', label: 'Differentials', icon: '🧠', desc: 'ICU differential diagnosis' },
      { id: 'treatment', label: 'ICU Plan', icon: '💊', desc: 'Daily goals, weaning, de-escalation' },
      { id: 'plan', label: 'ICU Disposition', icon: '📄', desc: 'Step-down, tracheostomy, palliative' },
    ],
  },

  ID: {
    key: 'ID',
    protocolReferences: [
      { name: 'Sepsis / Bacteraemia', steps: ['Blood cultures x2 before antibiotics', 'Empiric broad-spectrum IV antibiotics', 'Source identification and control', 'De-escalate based on sensitivities at 48-72h', 'Duration 7-14 days depending on source'] },
      { name: 'Meningitis / Encephalitis', steps: ['CT head if CI before LP', 'LP for opening pressure, culture, PCR', 'Empiric ceftriaxone 2g BD + vancomycin', 'Dexamethasone if pneumococcal suspected', 'Acyclovir IV if HSV encephalitis'] },
      { name: 'Infective Endocarditis', steps: ['Blood cultures x3 before antibiotics', 'ECHO (transthoracic + transoesophageal)', 'Empiric gentamicin + amoxicillin/vancomycin', 'Modified Duke criteria for diagnosis', 'Cardiothoracic surgery if valve destruction'] },
      { name: 'Osteomyelitis', steps: ['MRI for diagnosis and extent', 'Bone biopsy for culture', 'Empiric flucloxacillin / clindamycin', 'IV antibiotics 4-6 weeks minimum', 'Surgical debridement if necrotic bone'] },
      { name: 'TB Management', steps: ['GeneXpert + culture + DST', 'RHZE 2 months intensive phase', 'RH 4 months continuation', 'Monitor LFTs monthly', 'Directly Observed Therapy (DOT)'] },
    ],
    commonDifferentials: ['Sepsis / Bacteraemia', 'Pneumonia', 'UTI / Pyelonephritis', 'Cellulitis / Necrotising Fasciitis', 'Meningitis / Encephalitis', 'Infective Endocarditis', 'Osteomyelitis / Septic Arthritis', 'Tuberculosis', 'HIV / Opportunistic Infections', 'Malaria / Tropical Infections'],
    keyInvestigations: ['Blood cultures', 'FBC + CRP + ESR', 'Procalcitonin', 'Chest X-ray', 'Urinalysis + culture', 'LP with CSF analysis', 'HIV / Hepatitis serology', 'GeneXpert / Culture'],
    scoringSystems: [
      { name: 'qSOFA', calc: 'RR≥22 + Altered mental + SBP≤100' },
      { name: 'Modified Duke Criteria', calc: 'Major + Minor criteria for endocarditis' },
      { name: 'CRB-65', calc: 'Confusion + RR≥30 + BP<90/60 + Age≥65' },
    ],
    phases: [
      { id: 'biodata', label: 'Biodata', icon: '📋', desc: 'Demographics and exposure history',
        questions: [{ key: 'patientName', label: 'Patient Name', type: 'text' },{ key: 'age', label: 'Age', type: 'text' },{ key: 'sex', label: 'Sex', type: 'select', options: ['Male','Female'] },{ key: 'hospitalId', label: 'Hospital ID', type: 'text' },{ key: 'travelHistory', label: 'Travel History', type: 'text' },{ key: 'exposure', label: 'Infectious Exposure', type: 'multi', options: ['TB Contact','Animal Bite','Food Poisoning','Unsafe Water','Healthcare Worker','Endemic Area'] },{ key: 'immunisation', label: 'Immunisation Status', type: 'text' }] },
      { id: 'complaints', label: 'Infectious Complaints', icon: '🗣️', desc: 'Fever, rigors, localising symptoms',
        questions: [{ key: 'fever', label: 'Fever', type: 'boolean' },{ key: 'rigors', label: 'Rigors', type: 'boolean' },{ key: 'nightSweats', label: 'Night Sweats', type: 'boolean' },{ key: 'weightLoss', label: 'Weight Loss', type: 'text' },{ key: 'cough', label: 'Cough', type: 'boolean' },{ key: 'diarrhoea', label: 'Diarrhoea', type: 'boolean' },{ key: 'dysuria', label: 'Dysuria', type: 'boolean' },{ key: 'rash', label: 'Rash', type: 'boolean' },{ key: 'lymphadenopathy', label: 'Lymphadenopathy', type: 'boolean' }] },
      { id: 'hpi', label: 'HPI', icon: '📝', desc: 'Fever pattern and progression' },
      { id: 'pmh', label: 'PMH', icon: '🏥', desc: 'Comorbidities, HIV status, immunosuppression',
        questions: [{ key: 'hivStatus', label: 'HIV Status', type: 'select', options: ['Negative','Positive','Unknown'] },{ key: 'immunosuppressed', label: 'Immunosuppressed', type: 'boolean' },{ key: 'diabetes', label: 'Diabetes', type: 'boolean' },{ key: 'malignancy', label: 'Malignancy', type: 'boolean' },{ key: 'recentAbx', label: 'Recent Antibiotics', type: 'text' },{ key: 'hospitalisation', label: 'Hospitalisation past 90d', type: 'boolean' }] },
      { id: 'vitals', label: 'Vitals & Exam', icon: '🩺', desc: 'Temperature, lymph node exam, skin' },
      { id: 'microbiology', label: 'Microbiology', icon: '🔬', desc: 'Cultures, serology, molecular',
        questions: [{ key: 'bloodCultures', label: 'Blood Cultures Drawn', type: 'boolean' },{ key: 'cultureResults', label: 'Culture Results', type: 'text' },{ key: 'geneXpert', label: 'GeneXpert / PCR', type: 'text' },{ key: 'serology', label: 'Serology Results', type: 'text' },{ key: 'sensitivity', label: 'Sensitivity Pattern', type: 'text' }] },
      { id: 'imaging', label: 'Imaging', icon: '📡', desc: 'CXR, US, MRI for source localisation' },
      { id: 'ddx', label: 'Differentials', icon: '🧠', desc: 'Infectious differentials' },
      { id: 'treatment', label: 'Antimicrobial Therapy', icon: '💊', desc: 'Empiric then targeted antibiotics' },
      { id: 'plan', label: 'Plan & IPC', icon: '📄', desc: 'Duration, follow-up, infection control' },
    ],
  },

  RHEUM: {
    key: 'RHEUM',
    protocolReferences: [
      { name: 'Rheumatoid Arthritis', steps: ['Methotrexate 7.5-25mg weekly + folic acid', 'Add bDMARD (adalimumab) if inadequate response at 3 months', 'Treat-to-target: aim for DAS28 <2.6', 'Flare management: IA/IM steroids as bridge', 'Monitor for joint erosions and extra-articular disease'] },
      { name: 'Gout (Acute Flare)', steps: ['NSAID (naproxen 500mg BD) or colchicine 500mcg BD-TDS', 'Prednisolone 30mg OD x 5 days if CI to NSAID/colchicine', 'Start allopurinol 2-4 weeks after flare resolves', 'Uptitrate allopurinol monthly to target urate <0.36', 'Colchicine prophylaxis for first 3-6 months of ULT'] },
      { name: 'SLE Management', steps: ['HCQ 200-400mg OD for all patients lifelong', 'Prednisolone 20-30mg OD for moderate flares with taper', 'Mycophenolate or IV cyclophosphamide for lupus nephritis', 'Antiphospholipid screen in all SLE patients', 'Annual renal and cardiovascular screening'] },
      { name: 'Osteoarthritis', steps: ['Weight loss and exercise first line', 'Paracetamol + topical NSAIDs', 'Oral NSAIDs with PPI if needed', 'IA hyaluronic acid or corticosteroid', 'Joint replacement if end-stage'] },
    ],
    commonDifferentials: ['Rheumatoid Arthritis', 'Osteoarthritis', 'Gout / Pseudogout', 'SLE', 'Psoriatic Arthritis', 'Ankylosing Spondylitis', 'Reactive Arthritis', 'Fibromyalgia', 'Polymyalgia Rheumatica', 'Vasculitis'],
    keyInvestigations: ['RF / Anti-CCP', 'ANA / anti-dsDNA', 'CRP / ESR', 'Uric Acid', 'X-ray hands/feet', 'Joint aspiration with polarised microscopy', 'MRI with contrast', 'DAS28 score'],
    scoringSystems: [
      { name: 'DAS28', calc: '28-joint counts + CRP/ESR + Global health VAS' },
      { name: 'SLEDAI', calc: 'SLE Disease Activity Index (24 descriptors)' },
      { name: 'WOMAC', calc: 'Osteoarthritis pain + stiffness + function' },
    ],
    phases: [
      { id: 'biodata', label: 'Biodata', icon: '📋', desc: 'Demographics and rheumatological risk factors',
        questions: [{ key: 'patientName', label: 'Patient Name', type: 'text' },{ key: 'age', label: 'Age', type: 'text' },{ key: 'sex', label: 'Sex', type: 'select', options: ['Male','Female'] },{ key: 'hospitalId', label: 'Hospital ID', type: 'text' },{ key: 'jointSymptomsDuration', label: 'Joint Symptom Duration', type: 'select', options: ['<6 weeks','6-12 weeks','>12 weeks'] },{ key: 'familyRheum', label: 'Family History of Rheumatic Disease', type: 'boolean' },{ key: 'prevDiagnosis', label: 'Previous Rheumatological Diagnosis', type: 'text' }] },
      { id: 'complaints', label: 'Rheumatological Complaints', icon: '🗣️', desc: 'Joint pain, swelling, stiffness, fatigue',
        questions: [{ key: 'morningStiffness', label: 'Morning Stiffness >30 min', type: 'boolean' },{ key: 'jointSwelling', label: 'Joint Swelling', type: 'boolean' },{ key: 'jointPain', label: 'Joint Pain', type: 'boolean' },{ key: 'fatigue', label: 'Fatigue', type: 'boolean' },{ key: 'myalgia', label: 'Myalgia', type: 'boolean' },{ key: 'rash', label: 'Rash / Photosensitivity', type: 'boolean' },{ key: 'oralUlcers', label: 'Oral / Genital Ulcers', type: 'boolean' },{ key: 'sicca', label: 'Dry Eyes / Mouth', type: 'boolean' },{ key: 'enthesitis', label: 'Enthesitis / Back Pain', type: 'boolean' }] },
      { id: 'hpi', label: 'HPI', icon: '📝', desc: 'Symptom onset, pattern, progression' },
      { id: 'pmh', label: 'PMH', icon: '🏥', desc: 'Autoimmune, medications, surgeries' },
      { id: 'joint_exam', label: 'Joint Exam', icon: '🦴', desc: 'Swollen/tender joint count, symmetry, deformities',
        questions: [{ key: 'swollenJoints', label: 'Swollen Joint Count (28)', type: 'text' },{ key: 'tenderJoints', label: 'Tender Joint Count (28)', type: 'text' },{ key: 'symmetry', label: 'Symmetric', type: 'boolean' },{ key: 'deformities', label: 'Deformities', type: 'multi', options: ['Ulnar Deviation','Swan Neck','Boutonniere','Z-thumb','Hallux Valgus','None'] }] },
      { id: 'vitals', label: 'Vitals & Extra-Articular', icon: '🩺', desc: 'Systemic features, skin, vessels' },
      { id: 'investigations', label: 'Serology & Imaging', icon: '🧪', desc: 'Autoantibodies, X-ray, US, MRI' },
      { id: 'scores', label: 'Disease Activity', icon: '📊', desc: 'DAS28, SLEDAI, HAQ-DI',
        questions: [{ key: 'das28', label: 'DAS28 (0-9.4)', type: 'text' },{ key: 'svedai', label: 'SLEDAI (0-105)', type: 'text' },{ key: 'painVAS', label: 'Pain VAS (0-100)', type: 'text' }] },
      { id: 'ddx', label: 'Differentials', icon: '🧠', desc: 'Rheumatic differentials' },
      { id: 'treatment', label: 'DMARD Plan', icon: '💊', desc: 'csDMARDs, bDMARDs, steroids' },
      { id: 'plan', label: 'Plan & Monitoring', icon: '📄', desc: 'Review interval, screening, referrals' },
    ],
  },

  GERI: {
    key: 'GERI',
    protocolReferences: [
      { name: 'Falls Prevention', steps: ['Multifactorial falls assessment', 'Orthostatic BP measurement', 'Medication review (STOPP/START criteria)', 'Strength and balance exercise (Otago programme)', 'Home hazard assessment by OT'] },
      { name: 'Delirium Management', steps: ['Identify acute cause (PINCH ME)', 'Non-pharmacological: reorientation + family', 'Low-dose haloperidol 0.5mg PRN if agitated (check QTc)', 'Avoid benzodiazepines unless alcohol withdrawal', 'Daily CAM reassessment'] },
      { name: 'Frailty / Sarcopenia', steps: ['SARC-F screening', 'Grip strength + gait speed assessment', 'Resistance training 2-3x/week', 'Protein intake 1.2-1.5 g/kg/day', 'Vitamin D 800 IU daily + calcium'] },
      { name: 'Polypharmacy Review', steps: ['Full medication reconciliation', 'STOPP/START screening tool', 'Anticholinergic burden (ACB) calculation', 'Deprescribe one drug at a time', 'Document rationale and communicate with GP'] },
      { name: 'CGA (Comprehensive Geriatric Assessment)', steps: ['Medical assessment (diagnoses + syndromes)', 'Functional assessment (ADL/IADL)', 'Cognitive assessment (MoCA/ACE-III)', 'Social and environmental assessment', 'Goal-oriented care plan'] },
    ],
    commonDifferentials: ['Delirium', 'Dementia', 'Depression', 'Falls / Gait Disorder', 'Frailty', 'Sarcopenia', 'Urinary Incontinence', 'Polypharmacy ADR', 'Pressure Ulcer', 'Malnutrition'],
    keyInvestigations: ['FBC', 'U&E', 'TFT', 'B12 / Folate', 'Vitamin D', 'Orthostatic BP', 'MoCA / 4AT', 'DEXA scan'],
    scoringSystems: [
      { name: '4AT', calc: 'Alertness + AMT4 + Attention + Acute change' },
      { name: 'Clinical Frailty Scale', calc: '1 (very fit) to 9 (terminally ill)' },
      { name: 'CIRS-G', calc: 'Cumulative Illness Rating Scale for Geriatrics' },
    ],
    phases: [
      { id: 'biodata', label: 'Biodata', icon: '📋', desc: 'Geriatric patient demographics',
        questions: [{ key: 'patientName', label: 'Patient Name', type: 'text' },{ key: 'age', label: 'Age', type: 'text' },{ key: 'sex', label: 'Sex', type: 'select', options: ['Male','Female'] },{ key: 'hospitalId', label: 'Hospital ID', type: 'text' },{ key: 'residence', label: 'Residence', type: 'select', options: ['Home Alone','Home with Carer','Sheltered Housing','Care Home','Nursing Home'] },{ key: 'careLevel', label: 'Care Level Pre-Admission', type: 'text' },{ key: 'livingWill', label: 'Advance Directive / LPA', type: 'boolean' },{ key: 'nextOfKin', label: 'Next of Kin / Carer', type: 'text' }] },
      { id: 'complaints', label: 'Geriatric Complaints', icon: '🗣️', desc: 'Falls, confusion, immobility, incontinence' },
      { id: 'hpi', label: 'Collateral HPI', icon: '📝', desc: 'Obtain from patient AND family/carer',
        questions: [{ key: 'onset', label: 'Onset', type: 'select', options: ['Sudden','Gradual','Intermittent'] },{ key: 'baselineFunction', label: 'Baseline Functional Level', type: 'select', options: ['Independent','Needs Assistance','Chair/Bed Bound'] },{ key: 'changeFromBaseline', label: 'Change from Baseline', type: 'text' },{ key: 'carerConcerns', label: 'Carer Concerns', type: 'text' }] },
      { id: 'pmh', label: 'PMH & Meds', icon: '🏥', desc: 'Comorbidities, medications, falls history',
        questions: [{ key: 'medicationCount', label: 'Number of Regular Medications', type: 'text' },{ key: 'falls_6mo', label: 'Falls in Past 6 Months', type: 'text' },{ key: 'previousFracture', label: 'Previous Fragility Fracture', type: 'boolean' },{ key: 'incontinence', label: 'Urinary / Faecal Incontinence', type: 'boolean' },{ key: 'vision', label: 'Vision Impairment', type: 'boolean' },{ key: 'hearing', label: 'Hearing Impairment', type: 'boolean' }] },
      { id: 'cognition', label: 'Cognition & Mood', icon: '🧠', desc: 'MoCA, 4AT, PHQ-9, GDS',
        questions: [{ key: '4atScore', label: '4AT Score (0-12)', type: 'text' },{ key: 'moca', label: 'MoCA Score (0-30)', type: 'text' },{ key: 'gds', label: 'GDS Score (0-15)', type: 'text' },{ key: 'deliriumSuperimposed', label: 'Delirium on Dementia', type: 'boolean' }] },
      { id: 'function', label: 'Functional Assessment', icon: '🚶', desc: 'ADL, IADL, gait, mobility aids',
        questions: [{ key: 'adl', label: 'ADL Score (Barthel 0-100)', type: 'text' },{ key: 'gaitSpeed', label: 'Gait Speed (m/s)', type: 'text' },{ key: 'tug', label: 'Timed Up & Go (sec)', type: 'text' },{ key: 'gripStrength', label: 'Grip Strength (kg)', type: 'text' },{ key: 'mobilityAid', label: 'Mobility Aid', type: 'select', options: ['None','Stick','Zimmer Frame','Wheelchair','Hoist'] }] },
      { id: 'vitals', label: 'Vitals & Exam', icon: '🩺', desc: 'Orthostatic BP, nutrition, skin' },
      { id: 'investigations', label: 'Geriatric Workup', icon: '🧪', desc: 'Targeted, avoid over-investigation' },
      { id: 'scores', label: 'Geriatric Assessment', icon: '📊', desc: 'CFS, 4AT, CIRS-G' },
      { id: 'ddx', label: 'Differentials', icon: '🧠', desc: 'Geriatric syndromes' },
      { id: 'treatment', label: 'Management Plan', icon: '💊', desc: 'Multidisciplinary, goal-oriented' },
      { id: 'plan', label: 'Discharge & Follow-Up', icon: '📄', desc: 'Safely home, rehab, or care placement' },
    ],
  },

  GYN: {
    key: 'GYN',
    protocolReferences: [
      { name: 'Abnormal Uterine Bleeding', steps: ['Pregnancy test first', 'Transvaginal ultrasound', 'Endometrial biopsy if >45 or risk factors', 'Tranexamic acid 1g TDS during menses', 'Mirena IUS or endometrial ablation for menorrhagia'] },
      { name: 'Pelvic Inflammatory Disease', steps: ['Cervical swabs for CT/NG', 'Empiric ceftriaxone 500mg IM stat', 'Doxycycline 100mg BD x 14 days', 'Metronidazole 400mg BD x 14 days', 'USS to rule out tubo-ovarian abscess'] },
      { name: 'Ovarian Cyst Management', steps: ['TVUS with CA-125 if complex', 'Simple cyst <5cm: reassure + US in 6-12 weeks', 'Complex >7cm: MRI + surgical referral', 'Acute pain: exclude torsion (emergency surgery)', 'Postmenopausal: lower threshold for surgery'] },
      { name: 'Endometriosis', steps: ['NSAIDs + COC continuously first line', 'GnRH agonist for 3-6 months if refractory', 'Laparoscopic excision of deposits', 'Fertility referral for moderate-severe disease', 'Long-term hormonal suppression'] },
    ],
    commonDifferentials: ['Menorrhagia', 'Fibroids', 'Endometriosis', 'PID', 'Ovarian Cyst/Torsion', 'PCOS', 'Cervical Dysplasia', 'Endometrial Hyperplasia', 'Vaginitis', 'Vulval Dermatosis'],
    keyInvestigations: ['TV Ultrasound', 'Pregnancy Test (hCG)', 'Cervical swabs (CT/NG)', 'Liquid-based cytology (Pap smear)', 'CA-125', 'Endometrial biopsy', 'Colposcopy'],
    scoringSystems: [
      { name: 'PALM-COEIN', calc: 'FIGO classification for AUB' },
      { name: 'RMI', calc: 'U/S score + Menopausal + CA-125 for ovarian cancer risk' },
    ],
    phases: [
      { id: 'biodata', label: 'Biodata', icon: '📋', desc: 'Gynaecological history',
        questions: [{ key: 'patientName', label: 'Patient Name', type: 'text' },{ key: 'age', label: 'Age', type: 'text' },{ key: 'hospitalId', label: 'Hospital ID', type: 'text' },{ key: 'menarcheAge', label: 'Age at Menarche', type: 'text' },{ key: 'menopause', label: 'Menopausal Status', type: 'select', options: ['Premenopausal','Perimenopausal','Postmenopausal'] },{ key: 'lastPapSmear', label: 'Last Pap Smear', type: 'text' },{ key: 'contraception', label: 'Current Contraception', type: 'text' }] },
      { id: 'complaints', label: 'Gynaecological Complaints', icon: '🗣️', desc: 'Bleeding, pain, discharge, mass',
        questions: [{ key: 'abnormalBleeding', label: 'Abnormal Vaginal Bleeding', type: 'boolean' },{ key: 'pelvicPain', label: 'Pelvic Pain', type: 'boolean' },{ key: 'dysmenorrhea', label: 'Dysmenorrhea', type: 'boolean' },{ key: 'vaginalDischarge', label: 'Vaginal Discharge', type: 'boolean' },{ key: 'dyspareunia', label: 'Dyspareunia', type: 'boolean' },{ key: 'pelvicMass', label: 'Pelvic Mass', type: 'boolean' },{ key: 'infertility', label: 'Infertility', type: 'boolean' }] },
      { id: 'hpi', label: 'HPI', icon: '📝', desc: 'Menstrual, pain, and discharge history' },
      { id: 'pmh', label: 'PMH', icon: '🏥', desc: 'OB/GYN history, STIs, surgeries',
        questions: [{ key: 'gravidaPara', label: 'Gravida / Para', type: 'text' },{ key: 'previousGynSurgery', label: 'Previous Gyn Surgery', type: 'text' },{ key: 'stiHistory', label: 'STI History', type: 'text' },{ key: 'hormonalTherapy', label: 'Current Hormonal Therapy', type: 'text' }] },
      { id: 'menstrual_history', label: 'Menstrual History', icon: '📅', desc: 'Cycle, duration, flow, associated symptoms',
        questions: [{ key: 'cycleLength', label: 'Cycle Length (days)', type: 'text' },{ key: 'periodDuration', label: 'Period Duration (days)', type: 'text' },{ key: 'flowSeverity', label: 'Flow Severity', type: 'select', options: ['Light','Moderate','Heavy','Very Heavy'] },{ key: 'clots', label: 'Clots', type: 'boolean' },{ key: 'intermenstrual', label: 'Inter-menstrual Bleeding', type: 'boolean' },{ key: 'postcoital', label: 'Post-coital Bleeding', type: 'boolean' },{ key: 'painCycle', label: 'Pain related to cycle', type: 'select', options: ['None','Before Menses','During Menses','Ovulation','Continuous'] }] },
      { id: 'vitals', label: 'Vitals & Pelvic Exam', icon: '🩺', desc: 'Speculum, bimanual, USS findings' },
      { id: 'imaging', label: 'Imaging & Tests', icon: '📡', desc: 'TVUS, MRI, colposcopy results' },
      { id: 'ddx', label: 'Differentials', icon: '🧠', desc: 'Gynaecological differentials' },
      { id: 'treatment', label: 'Gyn Management', icon: '💊', desc: 'Medical or surgical treatment' },
      { id: 'plan', label: 'Gyn Plan', icon: '📄', desc: 'Follow-up, surveillance, referral' },
    ],
  },

  ENT: {
    key: 'ENT',
    protocolReferences: [
      { name: 'Tonsillitis / Quinsy', steps: ['Centor criteria (fever, exudate, nodes, no cough)', 'Phenoxymethylpenicillin 500mg QID x 10 days', 'Clarithromycin 500mg BD if penicillin allergy', 'Needle aspiration if peritonsillar abscess', 'Tonsillectomy if ≥7 episodes/year'] },
      { name: 'Acute Sinusitis', steps: ['Symptom >10 days or double worsening = bacterial', 'Amoxicillin 500mg TDS x 7 days', 'Co-amoxiclav 625mg TDS if treatment failure', 'Nasal saline irrigation + steroid spray', 'CT sinuses if chronic or recurrent'] },
      { name: 'Otitis Media / Glue Ear', steps: ['Watchful waiting 3 months for OME', 'Amoxicillin 500mg TDS x 5-7 days for AOM', 'Grommets if bilateral OME >3 months with hearing loss >25dB', 'Audiogram + tympanometry before referral', 'Regular audiology follow-up'] },
      { name: 'Epistaxis', steps: ['First aid: lean forward, pinch nose 10 min', 'Cautery with silver nitrate if visible vessel', 'Nasal packing (Merocel/Rapid Rhino) if ongoing', 'Consider sphenopalatine artery ligation if refractory', 'Check FBC, coagulation, BP'] },
      { name: 'Hearing Loss', steps: ['Otoscopy + tuning fork tests (Rinne/Weber)', 'Pure tone audiometry', 'Treat conductive: wax removal, grommets, ossiculoplasty', 'Treat sensorineural: hearing aids, cochlear implant', 'Sudden SNHL: urgent ENT — high-dose steroids within 72h'] },
    ],
    commonDifferentials: ['Tonsillitis / Pharyngitis', 'Peritonsillar Abscess', 'Acute Sinusitis', 'Otitis Media', 'Otitis Externa', 'Epistaxis', 'Hearing Loss (Conductive/SNHL)', 'Vestibular Neuritis / Labyrinthitis', 'Allergic Rhinitis', 'Laryngeal Cancer'],
    keyInvestigations: ['Otoscopy + Tuning Forks', 'Pure Tone Audiometry', 'Tympanometry', 'Nasoendoscopy', 'CT Sinus/Temporal Bone', 'Throat Swab + Culture'],
    scoringSystems: [
      { name: 'Centor Criteria', calc: 'Fever + Exudate + Nodes + No cough (0-4)' },
      { name: 'SNOT-22', calc: 'Sino-Nasal Outcome Test (0-110)' },
    ],
    phases: [
      { id: 'biodata', label: 'Biodata', icon: '📋', desc: 'ENT demographics and exposure',
        questions: [{ key: 'patientName', label: 'Patient Name', type: 'text' },{ key: 'age', label: 'Age', type: 'text' },{ key: 'sex', label: 'Sex', type: 'select', options: ['Male','Female'] },{ key: 'hospitalId', label: 'Hospital ID', type: 'text' },{ key: 'smoking', label: 'Smoking', type: 'select', options: ['Never','Former','Current'] },{ key: 'alcohol', label: 'Alcohol Use', type: 'select', options: ['None','Moderate','Heavy'] },{ key: 'occupation', label: 'Occupation (noise exposure)', type: 'text' }] },
      { id: 'complaints', label: 'ENT Complaints', icon: '🗣️', desc: 'Ear, nose, throat symptoms',
        questions: [{ key: 'soreThroat', label: 'Sore Throat', type: 'boolean' },{ key: 'dysphagia', label: 'Dysphagia', type: 'boolean' },{ key: 'earPain', label: 'Ear Pain', type: 'boolean' },{ key: 'hearingLoss', label: 'Hearing Loss', type: 'boolean' },{ key: 'tinnitus', label: 'Tinnitus', type: 'boolean' },{ key: 'vertigo', label: 'Vertigo / Dizziness', type: 'boolean' },{ key: 'nasalObstruction', label: 'Nasal Obstruction', type: 'boolean' },{ key: 'epistaxis', label: 'Epistaxis', type: 'boolean' },{ key: 'hoarseness', label: 'Hoarseness', type: 'boolean' },{ key: 'facialPain', label: 'Facial Pain', type: 'boolean' }] },
      { id: 'hpi', label: 'Ear / Nose / Throat HPI', icon: '📝', desc: 'Duration, laterality, progression' },
      { id: 'pmh', label: 'PMH', icon: '🏥', desc: 'Previous ENT issues, surgeries, medications' },
      { id: 'exam', label: 'ENT Exam', icon: '🩺', desc: 'Otoscopy, nasal exam, oral cavity, neck',
        questions: [{ key: 'otoscopy', label: 'Otoscopy Findings', type: 'select', options: ['Normal','Perforation','Effusion','Infection','Wax Impaction'] },{ key: 'tonsils', label: 'Tonsil Grade', type: 'select', options: ['1+','2+','3+','4+'] },{ key: 'nasalMucosa', label: 'Nasal Mucosa', type: 'select', options: ['Normal','Inflamed','Polypoid'] },{ key: 'neckNodes', label: 'Cervical Lymph Nodes', type: 'boolean' }] },
      { id: 'audiology', label: 'Audiology', icon: '🔊', desc: 'Audiogram, tympanometry, tuning forks' },
      { id: 'imaging', label: 'CT / MRI / Nasoendoscopy', icon: '📡', desc: 'Imaging findings' },
      { id: 'ddx', label: 'Differentials', icon: '🧠', desc: 'ENT differentials' },
      { id: 'treatment', label: 'Treatment', icon: '💊', desc: 'Medical or surgical management' },
      { id: 'plan', label: 'Plan', icon: '📄', desc: 'Follow-up, surgery date, audiology' },
    ],
  },

  OPHTH: {
    key: 'OPHTH',
    protocolReferences: [
      { name: 'Cataract Management', steps: ['Phacoemulsification with IOL when VA <6/12 affecting daily activities', 'IOLMaster biometry for power calculation', 'Day case under local anaesthesia', 'Post-op topical antibiotics + steroids 4-6 weeks', 'Monitor for posterior capsule opacification'] },
      { name: 'Glaucoma Management', steps: ['Prostaglandin analogue (latanoprost) OD first line', 'Add beta-blocker (timolol 0.5%) BD if IOP uncontrolled', 'SLT laser as alternative to drops', 'Trabeculectomy if maximal medical therapy fails', 'Target IOP <18 mmHg or 30% reduction from baseline'] },
      { name: 'Acute Red Eye', steps: ['Differentiate: conjunctivitis vs keratitis vs iritis vs acute glaucoma', 'Bacterial conjunctivitis: chloramphenicol drops 2-hourly', 'Viral: supportive — artificial tears, cold compresses', 'Contact lens wearer: urgent ophthalmology referral', 'Pain + photophobia + reduced VA: emergency slit lamp exam'] },
      { name: 'Diabetic Retinopathy', steps: ['Annual retinal screening (fundus photos)', 'Optimise HbA1c, BP, lipids', 'PRP for proliferative DR', 'IV anti-VEGF for DMO', 'Vitrectomy for persistent vitreous haemorrhage'] },
    ],
    commonDifferentials: ['Cataract', 'Glaucoma (POAG / Acute Angle Closure)', 'Diabetic Retinopathy', 'AMD', 'Conjunctivitis (bacterial/viral/allergic)', 'Keratitis / Corneal Ulcer', 'Uveitis / Iritis', 'Retinal Detachment', 'Vitreous Haemorrhage', 'Optic Neuritis'],
    keyInvestigations: ['Visual Acuity (Snellen)', 'Slit Lamp Examination', 'Tonometry (IOP)', 'Fundoscopy', 'OCT', 'Visual Field Perimetry', 'Fluorescein Angiography'],
    scoringSystems: [
      { name: 'Glaucoma Staging (Hodapp-Parrish)', calc: 'MD and PSD on Humphrey visual field' },
      { name: 'ETDRS', calc: 'Early Treatment Diabetic Retinopathy Study severity' },
    ],
    phases: [
      { id: 'biodata', label: 'Biodata', icon: '📋', desc: 'Ophthalmic demographics',
        questions: [{ key: 'patientName', label: 'Patient Name', type: 'text' },{ key: 'age', label: 'Age', type: 'text' },{ key: 'sex', label: 'Sex', type: 'select', options: ['Male','Female'] },{ key: 'hospitalId', label: 'Hospital ID', type: 'text' },{ key: 'occupation', label: 'Occupation (visual demands)', type: 'text' },{ key: 'driving', label: 'Driving Status', type: 'boolean' },{ key: 'refractiveHistory', label: 'Refractive History', type: 'text' },{ key: 'diabetes', label: 'Diabetes', type: 'boolean' },{ key: 'hypertension', label: 'Hypertension', type: 'boolean' }] },
      { id: 'complaints', label: 'Ophthalmic Complaints', icon: '👁️', desc: 'Visual symptoms, pain, redness',
        questions: [{ key: 'visionLoss', label: 'Vision Loss', type: 'boolean' },{ key: 'blurredVision', label: 'Blurred Vision', type: 'boolean' },{ key: 'eyePain', label: 'Eye Pain', type: 'boolean' },{ key: 'redEye', label: 'Red Eye', type: 'boolean' },{ key: 'photophobia', label: 'Photophobia', type: 'boolean' },{ key: 'floaters', label: 'Floaters', type: 'boolean' },{ key: 'flashes', label: 'Flashes of Light', type: 'boolean' },{ key: 'fieldDefect', label: 'Visual Field Defect', type: 'boolean' },{ key: 'diplopia', label: 'Diplopia', type: 'boolean' }] },
      { id: 'hpi', label: 'HPI', icon: '📝', desc: 'Onset, duration, laterality, progression' },
      { id: 'pmh', label: 'PMH', icon: '🏥', desc: 'Ocular and systemic history' },
      { id: 'exam_vision', label: 'Vision & Refraction', icon: '👓', desc: 'VA (corrected/pinhole), refraction',
        questions: [{ key: 'vaRight', label: 'VA Right (Snellen)', type: 'text' },{ key: 'vaLeft', label: 'VA Left (Snellen)', type: 'text' },{ key: 'pinholeRight', label: 'Pinhole Right', type: 'text' },{ key: 'pinholeLeft', label: 'Pinhole Left', type: 'text' },{ key: 'iopRight', label: 'IOP Right (mmHg)', type: 'text' },{ key: 'iopLeft', label: 'IOP Left (mmHg)', type: 'text' }] },
      { id: 'slit_lamp', label: 'Slit Lamp & Fundus', icon: '🔦', desc: 'Anterior / posterior segment findings',
        questions: [{ key: 'lens', label: 'Lens', type: 'select', options: ['Clear','NS','Cortical','PSC','PCIOL'] },{ key: 'opticDisc', label: 'Optic Disc', type: 'select', options: ['Normal','Cupped >0.5','Pale','Oedematous'] },{ key: 'macula', label: 'Macula', type: 'select', options: ['Normal','Drusen','Oedema','Scar'] }] },
      { id: 'imaging', label: 'OCT / FFA / VF', icon: '📡', desc: 'Imaging and perimetry' },
      { id: 'ddx', label: 'Differentials', icon: '🧠', desc: 'Ophthalmic differentials' },
      { id: 'treatment', label: 'Treatment Plan', icon: '💊', desc: 'Medical / laser / surgical' },
      { id: 'plan', label: 'Follow-up & Referral', icon: '📄', desc: 'Ongoing monitoring plan' },
    ],
  },

  URO: {
    key: 'URO',
    protocolReferences: [
      { name: 'BPH / LUTS', steps: ['IPSS symptom score', 'Alpha-blocker (tamsulosin 400mcg OD) first line', '5-ARI (finasteride 5mg OD) for large prostates >40g', 'Combination therapy for superior response', 'TURP if medical failure, retention, or complications'] },
      { name: 'Ureteric Colic / Stones', steps: ['CT KUB (non-contrast) gold standard', 'Diclofenac 75mg IM/PR first line analgesia', 'Tamsulosin 400mcg OD for MET (distal stones 5-10mm)', 'Urgent decompression if infected (nephrostomy/stent)', 'ESWL <10mm, Ureteroscopy + laser >10mm'] },
      { name: 'Complicated UTI', steps: ['Urine culture before antibiotics', 'Empiric IV co-amoxiclav 1.2g TDS or ceftriaxone 1g OD', 'Switch to oral based on sensitivities', 'Renal US/CT to exclude obstruction or abscess', 'Duration 10-14 days'] },
      { name: 'Haematuria Workup', steps: ['Urine dip + microscopy + culture', 'CT urogram (CTU) for upper tracts', 'Cystoscopy for bladder source', 'FBC, U&E, coagulation profile', 'Urothelial cancer risk stratification'] },
      { name: 'Prostate Cancer Surveillance', steps: ['PSA + DRE annually', 'mpMRI before biopsy if PSA raised', 'TRUS-guided or transperineal biopsy', 'Gleason scoring on biopsy', 'Active surveillance vs radical treatment per risk'] },
    ],
    commonDifferentials: ['BPH / LUTS', 'Ureteric Colic / Nephrolithiasis', 'UTI / Pyelonephritis', 'Prostate Cancer', 'Bladder Cancer', 'Haematuria (Glomerular / Urological)', 'Urinary Retention', 'Overactive Bladder', 'Testicular Torsion / Epididymitis', 'Phimosis / Paraphimosis'],
    keyInvestigations: ['Urinalysis + Culture', 'CT KUB / CT Urogram', 'Renal US', 'Uroflowmetry + PVR', 'PSA', 'Cystoscopy', 'Urodynamics'],
    scoringSystems: [
      { name: 'IPSS', calc: '7-question BPH symptom severity (0-35)' },
      { name: 'D\'Amico Risk', calc: 'PSA + Gleason + Stage for prostate cancer risk' },
      { name: 'STONE Score', calc: 'Ureteral stone prediction (0-13)' },
    ],
    phases: [
      { id: 'biodata', label: 'Biodata', icon: '📋', desc: 'Urology demographics and risk factors',
        questions: [{ key: 'patientName', label: 'Patient Name', type: 'text' },{ key: 'age', label: 'Age', type: 'text' },{ key: 'sex', label: 'Sex', type: 'select', options: ['Male','Female'] },{ key: 'hospitalId', label: 'Hospital ID', type: 'text' },{ key: 'familyProstate', label: 'Family History of Prostate Cancer', type: 'boolean' },{ key: 'smoking', label: 'Smoking', type: 'select', options: ['Never','Former','Current'] },{ key: 'occupation', label: 'Occupation (chemical exposure)', type: 'text' }] },
      { id: 'complaints', label: 'Urological Complaints', icon: '🗣️', desc: 'LUTS, pain, haematuria, infection',
        questions: [{ key: 'frequency', label: 'Urinary Frequency', type: 'boolean' },{ key: 'urgency', label: 'Urgency', type: 'boolean' },{ key: 'nocturia', label: 'Nocturia', type: 'text' },{ key: 'hesitancy', label: 'Hesitancy / Poor Stream', type: 'boolean' },{ key: 'haematuria', label: 'Haematuria', type: 'boolean' },{ key: 'flankPain', label: 'Flank Pain', type: 'boolean' },{ key: 'dysuria', label: 'Dysuria', type: 'boolean' },{ key: 'urinaryRetention', label: 'Urinary Retention', type: 'boolean' },{ key: 'incontinence', label: 'Incontinence', type: 'boolean' },{ key: 'scrotalPain', label: 'Scrotal Pain / Swelling', type: 'boolean' }] },
      { id: 'hpi', label: 'HPI', icon: '📝', desc: 'Symptom timeline and progression' },
      { id: 'pmh', label: 'PMH', icon: '🏥', desc: 'Urological, surgical, medications',
        questions: [{ key: 'previousStones', label: 'Previous Kidney Stones', type: 'boolean' },{ key: 'previousUTI', label: 'Recurrent UTIs', type: 'boolean' },{ key: 'urologicalSurgery', label: 'Previous Urological Surgery', type: 'text' },{ key: 'catheter', label: 'Currently Catheterised', type: 'boolean' },{ key: 'alphaBlocker', label: 'On Alpha-Blocker / 5-ARI', type: 'boolean' }] },
      { id: 'vitals', label: 'Vitals & Abdominal Exam', icon: '🩺', desc: 'DRE, renal angle tenderness' },
      { id: 'flow_studies', label: 'Flow Studies', icon: '💧', desc: 'Uroflowmetry, PVR, urodynamics',
        questions: [{ key: 'qmax', label: 'Qmax (mL/s)', type: 'text' },{ key: 'voidedVolume', label: 'Voided Volume (mL)', type: 'text' },{ key: 'pvr', label: 'Post-Void Residual (mL)', type: 'text' },{ key: 'ipss', label: 'IPSS Score (0-35)', type: 'text' }] },
      { id: 'imaging', label: 'Imaging', icon: '📡', desc: 'CT KUB, CTU, US, MRI' },
      { id: 'ddx', label: 'Differentials', icon: '🧠', desc: 'Urological differentials' },
      { id: 'treatment', label: 'Urology Treatment', icon: '💊', desc: 'Medical / surgical / endoscopic' },
      { id: 'plan', label: 'Urology Plan', icon: '📄', desc: 'Follow-up, surveillance, future procedures' },
    ],
  },
};

export function getDepartmentContent(key: string): DepartmentClinicalContent | undefined {
  return DEPARTMENT_CONTENT[key];
}
