import type {
  InvestigationBundle, MedicationProtocol, NursingProtocol,
  MonitoringProtocol, SupportiveCareProtocol, ImagingProtocol, IsolationProtocol, DiseaseKnowledge,
  InfusionProtocol,
} from '../types/protocols'

export const HTN_DISEASE_KNOWLEDGE: DiseaseKnowledge[] = [{
  id: 'hypertension',
  name: 'Hypertension',
  mechanisms: ['vascular_remodeling'],
  epidemiology: ['Leading modifiable risk factor for CVD worldwide', 'Prevalence ~25% in Kenyan adults', 'Undiagnosed in ~50% of cases', 'More common in urban populations'],
  riskFactors: ['Family history of HTN', 'Obesity (BMI >30)', 'High sodium intake', 'Physical inactivity', 'Alcohol excess', 'Smoking', 'Diabetes', 'CKD', 'Stress', 'Age >40 years'],
  pathophysiology: 'Chronic elevation of systemic arterial pressure results from increased cardiac output and/or increased peripheral vascular resistance. Primary (essential) HTN accounts for 90-95% of cases. Pathophysiology involves dysregulation of the renin-angiotensin-aldosterone system, increased sympathetic activity, vascular endothelial dysfunction, and renal sodium handling abnormalities.',
  diagnosticCriteria: ['SBP ≥140 mmHg and/or DBP ≥90 mmHg on ≥2 separate readings', 'Ambulatory BP monitoring (ABPM) or home BP monitoring for confirmation', 'Target organ damage assessment: eyes (retinopathy), heart (LVH), kidneys (proteinuria), brain', 'Secondary causes screening if: age <30, resistant HTN, sudden onset, or specific features'],
  differentials: ['White coat hypertension', 'Masked hypertension', 'Secondary hypertension (renal artery stenosis, pheochromocytoma, primary aldosteronism, thyroid disease)', 'Pseudohypertension (Mönckeberg arteriosclerosis)'],
  severityScoring: ['ACC/AHA staging: Stage 1 (130-139/80-89), Stage 2 (≥140/90)', 'WHO/ISH risk stratification: low, moderate, high, very high', 'Framingham / ASCVD 10-year risk score'],
  complications: ['Stroke (ischemic and hemorrhagic)', 'Myocardial infarction', 'Heart failure', 'CKD / ESRD', 'Aortic aneurysm / dissection', 'Hypertensive retinopathy', 'Peripheral arterial disease', 'Dementia (vascular)'],
  references: ['Kenya HTN Guidelines (2023)', 'WHO HEARTS Technical Package', 'ACC/AHA HTN Guideline (2017)', 'ESC/ESH HTN Guidelines (2023)'],
}]

export const HTN_INVESTIGATION_BUNDLES: InvestigationBundle[] = [{
  id: 'htn_initial',
  label: 'Hypertension Initial Workup',
  diseaseId: 'hypertension',
  severity: 'moderate',
  bedside: ['BP both arms seated/standing', 'Pulse', 'BMI calculation', 'ECG'],
  laboratory: ['CBC', 'U&E / Creatinine', 'Fasting glucose', 'Lipid profile', 'Urinalysis', 'Urine albumin-to-creatinine ratio'],
  imaging: ['Chest X-ray (if symptoms/signs of LVH or failure)', 'Echocardiogram (if ECG abnormal or symptoms)'],
  microbiology: [],
  conditional: {
    if_severe: ['Chest X-ray', 'Echocardiogram', 'Troponin (if ACS suspected)'],
    if_renal_impairment: ['Renal ultrasound', 'Urine protein/creatinine ratio'],
    if_secondary_suspected: ['Renal artery Doppler', 'CT/MR angiography', 'Aldosterone/renin ratio', 'Urine metanephrines', 'Sleep study (if OSA suspected)'],
    if_diabetes: ['HbA1c', 'Urine albumin-to-creatinine', 'Fundoscopy'],
  },
}]

export const HTN_MEDICATIONS: MedicationProtocol[] = [
  { id: 'htn_amlodipine', diseaseId: 'hypertension', drug: 'Amlodipine', route: 'PO', dose: '5-10 mg', frequency: 'OD', duration: 'Long-term', contraindications: ['Severe aortic stenosis'], allergies: ['CCB allergy (rare)'], severity: 'moderate', alternativeIfAllergy: ['ACE inhibitor: Enalapril 10-20 mg PO BID'], notes: 'First-line in Kenya. Caution with hepatic impairment.' },
  { id: 'htn_enalapril', diseaseId: 'hypertension', drug: 'Enalapril', route: 'PO', dose: '10-20 mg', frequency: 'BID', duration: 'Long-term', contraindications: ['Pregnancy', 'Bilateral renal artery stenosis', 'History of angioedema'], allergies: ['ACE inhibitor allergy (cough, angioedema)'], severity: 'moderate', alternativeIfAllergy: ['ARB: Losartan 50 mg PO OD'], notes: 'Monitor creatinine and K+ at 1-2 weeks after initiation.' },
  { id: 'htn_hctz', diseaseId: 'hypertension', drug: 'Hydrochlorothiazide', route: 'PO', dose: '12.5-25 mg', frequency: 'OD', duration: 'Long-term', contraindications: ['Severe renal impairment (CrCl <30)', 'Sulfa allergy (cross-reactivity)'], allergies: ['Sulfa allergy syndrome'], severity: 'moderate', alternativeIfAllergy: ['Loop diuretic furosemide PRN'], notes: 'Monitor K+, Na+, glucose, uric acid at follow-up.' },
  { id: 'htn_losartan', diseaseId: 'hypertension', drug: 'Losartan', route: 'PO', dose: '50-100 mg', frequency: 'OD', duration: 'Long-term', contraindications: ['Pregnancy', 'Bilateral renal artery stenosis'], allergies: ['ARB allergy (rare)'], severity: 'moderate', alternativeIfAllergy: ['ACE inhibitor: Enalapril'], notes: 'Alternative when ACE inhibitor cough develops.' },
  { id: 'htn_bisoprolol', diseaseId: 'hypertension', drug: 'Bisoprolol', route: 'PO', dose: '2.5-10 mg', frequency: 'OD', duration: 'Long-term', contraindications: ['Asthma', 'Heart block (2nd/3rd degree)', 'Bradycardia <60', 'Decompensated HF'], allergies: ['Beta-blocker allergy (rare)'], severity: 'moderate', alternativeIfAllergy: ['Caution — do not stop abruptly'], notes: 'Start low, go slow. Useful in HF, CAD, tachyarrhythmia.' },
  { id: 'htn_hypertensive_urgency', diseaseId: 'hypertension', drug: 'Labetalol', route: 'PO', dose: '200-400 mg', frequency: 'Repeated after 2-3h', duration: '24-48h', contraindications: ['Asthma', 'Heart block', 'Bradycardia'], allergies: [], severity: 'severe', alternativeIfAllergy: ['Nifedipine 10-20 mg PO (short-acting — caution)'], notes: 'For hypertensive urgency (BP >180/120, no target organ damage). Gradual reduction over 24h.' },
  { id: 'htn_hypertensive_emergency', diseaseId: 'hypertension', drug: 'Sodium Nitroprusside', route: 'IV', dose: '0.25-10 mcg/kg/min', frequency: 'Continuous', duration: '24-48h', contraindications: ['Severe hepatic impairment'], allergies: [], severity: 'severe', alternativeIfAllergy: ['Labetalol IV 20-80 mg bolus then 2 mg/min infusion'], notes: 'For hypertensive emergency (BP >180/120 with target organ damage). ICU monitoring. Cover infusion from light.' },
]

export const HTN_NURSING: NursingProtocol[] = [{
  id: 'htn_nursing',
  diseaseId: 'hypertension',
  severity: 'moderate',
  monitoring: [
    { id: 'htn_ns_bp', parameter: 'Blood Pressure', frequency: 'Q6H initially then daily', notes: 'Seated after 5 min rest. Both arms first visit.' },
    { id: 'htn_ns_hr', parameter: 'Heart Rate and Rhythm', frequency: 'Daily' },
    { id: 'htn_ns_weight', parameter: 'Weight', frequency: 'Weekly' },
  ],
  care: [
    { id: 'htn_care_diet', parameter: 'Dietary Counseling', frequency: 'Once, then reinforce', notes: 'Low sodium (<5g salt/day), DASH diet, limit alcohol.' },
    { id: 'htn_care_exercise', parameter: 'Physical Activity', frequency: 'Once plan', notes: 'Recommend 150 min/week moderate activity.' },
    { id: 'htn_care_education', parameter: 'Patient Education', frequency: 'Once', notes: 'Explain HTN as a chronic condition requiring lifelong management. Discuss medication adherence.' },
    { id: 'htn_care_smoking', parameter: 'Smoking Cessation', frequency: 'At every visit', notes: 'Brief advice + refer to quit line if needed.' },
  ],
  escalation: [
    { id: 'htn_esc_crisis', condition: 'BP >180/120', threshold: 'Symptomatic or target organ damage', action: 'Urgent medical review. Assess for hypertensive emergency.', notify: ['Doctor'] },
    { id: 'htn_esc_side_effect', condition: 'Severe drug side effect', threshold: 'Angioedema, syncope, severe electrolyte disturbance', action: 'Hold medication. Medical review.', notify: ['Doctor'] },
  ],
}]

export const DIABETES_INVESTIGATION_BUNDLES: InvestigationBundle[] = [{
  id: 'dm_initial',
  label: 'Diabetes Initial Workup',
  diseaseId: 'diabetes',
  severity: 'moderate',
  bedside: ['Fingerstick glucose', 'BMI calculation', 'Foot exam', 'Fundoscopy'],
  laboratory: ['Fasting glucose', 'HbA1c', 'U&E / Creatinine', 'Lipid profile', 'Urinalysis', 'Urine albumin-to-creatinine ratio'],
  imaging: [],
  microbiology: [],
  conditional: {
    if_severe: ['ABG (if DKA/HHS suspected)', 'Beta-hydroxybutyrate', 'CXR (if infection suspected)'],
    if_renal_impairment: ['Renal ultrasound', 'eGFR trend'],
    if_foot_ulcer: ['Foot X-ray', 'Wound culture', 'Doppler arterial studies'],
  },
}]

export const DIABETES_MEDICATIONS: MedicationProtocol[] = [
  { id: 'dm_metformin', diseaseId: 'diabetes', drug: 'Metformin', route: 'PO', dose: '500-1000 mg', frequency: 'BID', duration: 'Long-term', contraindications: ['eGFR <30', 'Severe hepatic impairment', 'Acute illness with hypoperfusion'], allergies: [], severity: 'moderate', alternativeIfAllergy: ['SU: Glibenclamide 5 mg PO OD'], notes: 'First-line Type 2 DM. Hold during acute illness/surgery.' },
  { id: 'dm_insulin_rapid', diseaseId: 'diabetes', drug: 'Insulin (Rapid-acting analog)', route: 'SC', dose: 'Weight-based (0.3-0.5 u/kg/day)', frequency: 'TID (with meals)', duration: 'Long-term', contraindications: ['Hypoglycemia'], allergies: ['Insulin allergy (rare)'], severity: 'severe', alternativeIfAllergy: ['Switch insulin type'], notes: 'For Type 1 DM, DKA, hospitalized with poor control. Use sliding scale.' },
]

export const ASTHMA_INVESTIGATION_BUNDLES: InvestigationBundle[] = [{
  id: 'asthma_initial',
  label: 'Asthma Initial Workup',
  diseaseId: 'asthma',
  severity: 'moderate',
  bedside: ['Peak flow measurement', 'Pulse oximetry', 'Spirometry (if stable)'],
  laboratory: ['CBC (eosinophils)', 'CRP'],
  imaging: ['Chest X-ray'],
  microbiology: [],
  conditional: {
    if_severe: ['ABG (to assess PaCO2 — rising PaCO2 = decompensation)', 'ECG (to assess RV strain)'],
    if_allergic: ['Allergen-specific IgE', 'Skin prick testing (referral)'],
    if_difficult: ['CT chest (to rule out other diagnoses)', 'Bronchoscopy (if atypical features)'],
  },
}]

export const ASTHMA_MEDICATIONS: MedicationProtocol[] = [
  { id: 'asthma_salbutamol', diseaseId: 'asthma', drug: 'Salbutamol (Albuterol)', route: 'INH', dose: '100-200 mcg (1-2 puffs)', frequency: 'PRN (up to Q4H)', duration: 'As needed', contraindications: ['Tachyarrhythmia'], allergies: [], severity: 'mild', alternativeIfAllergy: [], notes: 'Short-acting beta-agonist (SABA). Rescue therapy for all steps.' },
  { id: 'asthma_ics', diseaseId: 'asthma', drug: 'Beclomethasone (ICS)', route: 'INH', dose: '100-400 mcg/day', frequency: 'BID', duration: 'Long-term daily', contraindications: ['Acute exacerbation — use as adjunct, not first-line'], allergies: [], severity: 'moderate', alternativeIfAllergy: ['Budesonide 200-400 mcg/day'], notes: 'First-line controller. Rinse mouth after use to prevent oral candidiasis.' },
  { id: 'asthma_formoterol', diseaseId: 'asthma', drug: 'Formoterol/Budesonide (SMART)', route: 'INH', dose: '160/4.5 mcg', frequency: 'BID maintenance + PRN', duration: 'Long-term', contraindications: ['Known hypersensitivity'], allergies: [], severity: 'moderate', alternativeIfAllergy: [], notes: 'SMART regimen — single inhaler for maintenance and relief.' },
  { id: 'asthma_prednisolone', diseaseId: 'asthma', drug: 'Prednisolone', route: 'PO', dose: '30-60 mg', frequency: 'OD', duration: '5-7 days', contraindications: ['Systemic fungal infection', 'Active TB'], allergies: [], severity: 'severe', alternativeIfAllergy: [], notes: 'For acute exacerbations. No need to taper if ≤7 days.' },
]

export const HIV_INVESTIGATION_BUNDLES: InvestigationBundle[] = [{
  id: 'hiv_initial',
  label: 'HIV Initial / Routine Workup',
  diseaseId: 'hiv',
  severity: 'moderate',
  bedside: ['Pulse oximetry', 'Weight', 'WHO Clinical Staging'],
  laboratory: ['CD4 count', 'HIV viral load', 'CBC', 'U&E / Creatinine', 'LFTs', 'CRP', 'RPR (syphilis screen)'],
  imaging: ['Chest X-ray'],
  microbiology: ['GeneXpert MTB/RIF (routine screening in Kenya)'],
  conditional: {
    if_severe: ['Lactate', 'Blood culture', 'CRAG (cryptococcal antigen) if CD4 <100'],
    if_cd4_below_350: ['Cryptococcal antigen', 'Fundoscopy'],
    if_cd4_below_200: ['PCP prophylaxis assessment', 'CMV PCR if visual symptoms', 'MAC prophylaxis assessment'],
    if_symptomatic: ['OIs-directed testing per presentation'],
    if_pregnant: ['Prevention-of-mother-to-child-transmission (PMTCT) workup'],
  },
}]

export const HIV_MEDICATIONS: MedicationProtocol[] = [
  { id: 'hiv_first_line', diseaseId: 'hiv', drug: 'TLD (TDF/3TC/DTG)', route: 'PO', dose: 'FDC — 1 tablet', frequency: 'OD', duration: 'Long-term', contraindications: ['eGFR <60 (consider TAF-based regimen)'], allergies: [], severity: 'moderate', alternativeIfAllergy: ['AZT/3TC/NVP', 'ABC/3TC/DTG'], notes: 'Kenya standard first-line ART. Monitor creatinine at 2wk, then q6mo.' },
  { id: 'hiv_ctz_prophylaxis', diseaseId: 'hiv', drug: 'CTZ (Cotrimoxazole)', route: 'PO', dose: '960 mg', frequency: 'OD', duration: 'Until CD4 >350 x6mo', contraindications: ['Severe sulfa allergy', 'G6PD deficiency'], allergies: ['Sulfa allergy'], severity: 'moderate', alternativeIfAllergy: ['Dapsone 100 mg PO OD'], notes: 'Prophylaxis for OIs. Reduces mortality by 50%.' },
]

export const SICKLE_CELL_INVESTIGATION_BUNDLES: InvestigationBundle[] = [{
  id: 'scd_initial',
  label: 'Sickle Cell Workup',
  diseaseId: 'sickle_cell',
  severity: 'moderate',
  bedside: ['Pulse oximetry', 'Pain assessment (0-10)', 'Temperature', 'Spleen palpation'],
  laboratory: ['CBC with reticulocyte count', 'Hb electrophoresis (if not already done)', 'Blood film', 'U&E / Creatinine', 'LDH', 'Bilirubin (total/direct)', 'CRP'],
  imaging: ['Chest X-ray (if chest symptoms / suspected ACS)'],
  microbiology: ['Blood culture (if febrile)', 'Urinalysis / urine culture'],
  conditional: {
    if_severe: ['ABG (if chest syndrome suspected)', 'Transfusion cross-match', 'ECG'],
    if_acute_chest: ['Chest X-ray (compare to baseline)', 'ABG', 'Blood culture', 'ECG'],
    if_stroke_suspected: ['CT head (non-contrast)', 'MRI brain', 'Transcranial Doppler (TCD) if child'],
    if_priapism: ['CBC', 'Urethral catheter', 'Urology consult'],
  },
}]

export const SICKLE_CELL_MEDICATIONS: MedicationProtocol[] = [
  { id: 'scd_hydroxyurea', diseaseId: 'sickle_cell', drug: 'Hydroxyurea', route: 'PO', dose: '10-20 mg/kg/day', frequency: 'OD', duration: 'Long-term', contraindications: ['Pregnancy', 'Bone marrow suppression (ANC <2000, platelets <150,000)'], allergies: [], severity: 'moderate', alternativeIfAllergy: [], notes: 'Reduces crisis frequency by 50%. Monitor CBC monthly for dose adjustment.' },
  { id: 'scd_folic_acid', diseaseId: 'sickle_cell', drug: 'Folic Acid', route: 'PO', dose: '5 mg', frequency: 'OD', duration: 'Long-term', contraindications: [], allergies: [], severity: 'mild', alternativeIfAllergy: [], notes: 'Essential supplement. Increased demand from chronic hemolysis.' },
  { id: 'scd_analgesia_mild', diseaseId: 'sickle_cell', drug: 'Paracetamol + Ibuprofen', route: 'PO', dose: '1 g + 400 mg', frequency: 'Q6H PRN', duration: 'As needed for pain', contraindications: [], allergies: [], severity: 'mild', alternativeIfAllergy: [], notes: 'First-line for mild pain crisis. Avoid NSAIDs if renal impairment.' },
  { id: 'scd_analgesia_severe', diseaseId: 'sickle_cell', drug: 'Morphine', route: 'IV', dose: '0.1 mg/kg', frequency: 'Q4H PRN', duration: 'For acute severe crisis', contraindications: ['Severe respiratory depression'], allergies: ['Opioid allergy (rare)'], severity: 'severe', alternativeIfAllergy: ['Pethidine (avoid if possible — seizure risk)'], notes: 'Adequate analgesia is critical. PCA if available. Monitor respiratory rate q1h.' },
]

export const HEART_DISEASE_INVESTIGATION_BUNDLES: InvestigationBundle[] = [{
  id: 'hd_initial',
  label: 'Heart Disease Initial Workup',
  diseaseId: 'heart_disease',
  severity: 'moderate',
  bedside: ['ECG 12-lead', 'Pulse oximetry', 'JVP assessment', 'BMI'],
  laboratory: ['CBC', 'U&E / Creatinine', 'Troponin (if ACS suspected)', 'BNP / NT-proBNP (if HF suspected)', 'Lipid profile', 'Fasting glucose'],
  imaging: ['Chest X-ray', 'Echocardiogram'],
  microbiology: [],
  conditional: {
    if_severe: ['ABG', 'Lactate', 'Serial troponins', 'Coronary angiography (if ACS)'],
    if_arrhythmia: ['Holter monitor', 'Electrophysiology referral'],
    if_surgery_candidate: ['Echocardiogram with Doppler', 'Coronary angiogram', 'CT coronary calcium score'],
  },
}]

// ── HTN Monitoring ──
export const HTN_MONITORING: MonitoringProtocol[] = [{
  id: 'htn_monitoring',
  diseaseId: 'hypertension',
  severity: 'moderate',
  vitals: ['BP', 'HR'],
  vitalsFrequency: 'Daily',
  urineOutput: false,
  fluidBalance: false,
  dailyWeight: true,
  painScore: false,
  consciousness: false,
  oxygenMonitoring: false,
  special: ['BP diary (AM/PM)', 'ECG annually', 'U&E / Creatinine 3-monthly', 'Lipid profile annually', 'Urine ACR annually'],
}]

export const HTN_SUPPORTIVE_CARE: SupportiveCareProtocol[] = [
  { id: 'htn_sc_diet', condition: 'hypertension', threshold: 'All HTN patients', action: 'DASH diet counseling — low sodium (<2g Na+/day), high potassium intake', details: 'Refer to dietitian. Reduce processed foods. Limit alcohol to 1-2 drinks/day.', monitoring: 'BP response. Dietary compliance at follow-up.' },
  { id: 'htn_sc_exercise', condition: 'hypertension', threshold: 'Stable HTN', action: 'Aerobic exercise 150 min/week moderate intensity', details: 'Brisk walking, cycling, swimming. Avoid isometric exercise if uncontrolled.', monitoring: 'Exercise diary. BP before/after exercise.' },
  { id: 'htn_sc_smoking', condition: 'hypertension', threshold: 'Current smoker', action: 'Smoking cessation counseling and pharmacotherapy', details: 'Nicotine replacement therapy. Refer to quitline. Follow up at each visit.', monitoring: 'Cessation progress. Carbon monoxide monitoring if available.' },
  { id: 'htn_sc_weight', condition: 'hypertension', threshold: 'BMI >25', action: 'Weight reduction program — target 5-10% weight loss', details: 'Caloric restriction + exercise. Target BMI <25. Consider bariatric referral if BMI >35.', monitoring: 'Weight weekly. BMI monthly. Waist circumference.' },
]

export const HTN_INFUSIONS: InfusionProtocol[] = [
  { id: 'htn_inf_labetalol', indication: 'Hypertensive urgency/emergency', solution: 'Labetalol IV 20-80 mg bolus', rate: '20 mg over 2 min, repeat q10min up to 300 mg total', monitoring: ['BP q5min during titration', 'HR continuous', 'ECG monitoring'], contraindications: ['Asthma', 'Heart block', 'Bradycardia'] },
  { id: 'htn_inf_nitroprusside', indication: 'Hypertensive emergency (ICU)', solution: 'Sodium Nitroprusside 0.25-10 mcg/kg/min continuous', rate: 'Start 0.25 mcg/kg/min, titrate q5min to target BP', monitoring: ['Arterial BP continuous', 'Cyanide/thiocyanate levels if >48h', 'Lactate'], contraindications: ['Severe hepatic impairment', 'Leber optic atrophy'] },
]

// ── Diabetes Nursing ──
export const DIABETES_NURSING: NursingProtocol[] = [{
  id: 'dm_nursing',
  diseaseId: 'diabetes',
  severity: 'moderate',
  monitoring: [
    { id: 'dm_ns_bg', parameter: 'Blood Glucose (bedside)', frequency: 'Q6H (AC+HS if on insulin)', target: '4-10 mmol/L', notes: 'More frequent if unstable or DKA' },
    { id: 'dm_ns_vitals', parameter: 'Vital Signs', frequency: 'Q6H' },
    { id: 'dm_ns_weight', parameter: 'Weight', frequency: 'Daily' },
    { id: 'dm_ns_foot', parameter: 'Foot Check', frequency: 'Daily', notes: 'Inspect for ulcers, calluses, infection' },
  ],
  care: [
    { id: 'dm_care_insulin', parameter: 'Insulin Administration', frequency: 'Per order', notes: 'Verify correct insulin type. Rotate injection sites. Monitor for hypo/hyperglycemia.' },
    { id: 'dm_care_diet', parameter: 'Diabetic Diet', frequency: 'Per meal', notes: 'Consistent carbohydrate meal plan. Dietitian referral.' },
    { id: 'dm_care_education', parameter: 'Diabetes Self-Management Education', frequency: 'Once then reinforce', notes: 'BG monitoring, insulin technique, hypo/hyperglycemia recognition, sick-day rules.' },
    { id: 'dm_care_hypo', parameter: 'Hypoglycemia Protocol', frequency: 'PRN', notes: 'BG <4 mmol/L: 15g fast-acting CHO, recheck in 15 min. If unable to take PO: 1 mg glucagon IM or 50 mL D50 IV.' },
  ],
  escalation: [
    { id: 'dm_esc_dka', condition: 'DKA suspected', threshold: 'BG >13.9, ketones positive, acidosis (pH <7.3, HCO3 <15)', action: 'DKA protocol. IV fluids. Insulin infusion. ICU if severe.', notify: ['Doctor', 'ICU team'] },
    { id: 'dm_esc_hhs', condition: 'HHS suspected', threshold: 'BG >33, serum osmolality >320, no ketosis', action: 'HHS protocol. Aggressive IV fluids. Monitor neurological status.', notify: ['Doctor', 'ICU team'] },
    { id: 'dm_esc_severe_hypo', condition: 'Severe hypoglycemia', threshold: 'BG <2.2 or unconscious', action: 'D50 50 mL IV or glucagon 1 mg IM. Recheck BG q15min.', notify: ['Doctor'] },
  ],
}]

export const DIABETES_MONITORING: MonitoringProtocol[] = [{
  id: 'dm_monitoring',
  diseaseId: 'diabetes',
  severity: 'moderate',
  vitals: ['BG', 'BP', 'HR', 'Temp'],
  vitalsFrequency: 'Q6H',
  urineOutput: true,
  fluidBalance: true,
  dailyWeight: true,
  painScore: false,
  consciousness: true,
  oxygenMonitoring: false,
  special: ['HbA1c q3 months', 'Foot exam at each visit', 'Fundoscopy annually', 'U&E / Creatinine 3-monthly', 'Urine ACR annually', 'Lipid profile annually'],
}]

export const DIABETES_SUPPORTIVE_CARE: SupportiveCareProtocol[] = [
  { id: 'dm_sc_diet', condition: 'diabetes', threshold: 'All DM patients', action: 'Medical nutrition therapy — consistent carbohydrate meal plan', details: 'Refer to dietitian. Focus on complex carbs, fiber, lean protein. Limit refined sugars.', monitoring: 'BG trends. Weight. HbA1c.' },
  { id: 'dm_sc_exercise', condition: 'diabetes', threshold: 'Stable DM', action: 'Exercise 150 min/week moderate aerobic + resistance training', details: 'Check BG before exercise. Carry fast-acting glucose. Avoid exercise if BG >16.7 or <5.5.', monitoring: 'Exercise diary. BG pre/post exercise.' },
  { id: 'dm_sc_foot', condition: 'diabetes', threshold: 'All DM patients', action: 'Daily foot inspection. Appropriate footwear. Podiatry referral if high risk.', details: 'Inspect for blisters, cuts, redness. Moisturize dry skin. Cut nails straight across.', monitoring: 'Foot exam at each visit. Monofilament testing annually.' },
]

// ── Asthma Nursing ──
export const ASTHMA_NURSING: NursingProtocol[] = [{
  id: 'asthma_nursing',
  diseaseId: 'asthma',
  severity: 'moderate',
  monitoring: [
    { id: 'asthma_ns_pef', parameter: 'Peak Expiratory Flow', frequency: 'Q6H (pre/post bronchodilator)', target: '>80% personal best', notes: 'Record best of 3 attempts' },
    { id: 'asthma_ns_spo2', parameter: 'SpO2', frequency: 'Continuous if acute, Q4H if stable', target: '>94%' },
    { id: 'asthma_ns_vitals', parameter: 'Vital Signs (RR, HR, BP, Temp)', frequency: 'Q4H' },
    { id: 'asthma_ns_symptoms', parameter: 'Respiratory symptom assessment', frequency: 'Q4H', notes: 'Wheeze, dyspnea, cough, accessory muscle use, chest tightness' },
  ],
  care: [
    { id: 'asthma_care_inhaler', parameter: 'Inhaler Technique Teaching', frequency: 'Daily while admitted', notes: 'Teach MDI +/- spacer technique. Observe and correct. Provide written action plan.' },
    { id: 'asthma_care_position', parameter: 'Positioning', frequency: 'Q2H', notes: 'Upright / tripod position to optimize breathing. Avoid supine.' },
    { id: 'asthma_care_triggers', parameter: 'Trigger Identification', frequency: 'Once', notes: 'Identify and document triggers (allergens, exercise, cold air, smoke). Provide avoidance counseling.' },
    { id: 'asthma_care_education', parameter: 'Asthma Education', frequency: 'Once', notes: 'Explain condition, medications (preventer vs reliever), red flags, when to seek help.' },
  ],
  escalation: [
    { id: 'asthma_esc_severe', condition: 'Severe asthma exacerbation', threshold: 'PEF <33% best, SpO2 <92%, RR >30, HR >120, unable to complete sentences', action: 'Immediate MD review. Consider IV bronchodilators, IV magnesium, NIV, ICU referral.', notify: ['Doctor', 'Respiratory team', 'ICU team'] },
    { id: 'asthma_esc_silent', condition: 'Silent chest / exhaustion', threshold: 'Decreased wheeze with worsening distress or rising PaCO2', action: 'IMPENDING RESPIRATORY ARREST. Immediate ICU referral for intubation.', notify: ['ICU team', 'Registrar', 'Consultant'] },
    { id: 'asthma_esc_no_response', condition: 'Poor response to initial therapy', threshold: 'No improvement after 3 back-to-back nebulizations', action: 'IV bronchodilators (salbutamol, aminophylline). IV magnesium sulfate 2 g over 20 min.', notify: ['Doctor', 'Respiratory team'] },
  ],
}]

export const ASTHMA_MONITORING: MonitoringProtocol[] = [{
  id: 'asthma_monitoring',
  diseaseId: 'asthma',
  severity: 'moderate',
  vitals: ['RR', 'HR', 'BP', 'Temp', 'SpO2', 'PEFR'],
  vitalsFrequency: 'Q4H (Q1H if acute)',
  urineOutput: false,
  fluidBalance: false,
  dailyWeight: false,
  painScore: false,
  consciousness: true,
  oxygenMonitoring: true,
  special: ['PEFR pre/post bronchodilator', 'Symptom diary (daytime/nighttime symptoms, reliever use)', 'ACT (Asthma Control Test) at follow-up', 'Spirometry (when stable)'],
}]

export const ASTHMA_SUPPORTIVE_CARE: SupportiveCareProtocol[] = [
  { id: 'asthma_sc_triggers', condition: 'asthma', threshold: 'All asthma patients', action: 'Trigger avoidance counseling', details: 'Identify personal triggers: allergens, smoke, cold air, exercise, NSAIDs, beta-blockers. Provide written avoidance plan.', monitoring: 'Symptom diary. Exacerbation frequency.' },
  { id: 'asthma_sc_allergy', condition: 'asthma', threshold: 'Allergic component suspected', action: 'Allergy testing referral. Consider allergen immunotherapy.', details: 'Skin prick testing or specific IgE. ENT assessment for allergic rhinitis (treat upper airway).', monitoring: 'Symptom improvement. Medication use reduction.' },
  { id: 'asthma_sc_smoking', condition: 'asthma', threshold: 'Current smoker', action: 'Smoking cessation strongly advised', details: 'Smoking worsens asthma control. Provide cessation counseling and pharmacotherapy (NRT, varenicline).', monitoring: 'Cessation progress. Exacerbation frequency.' },
  { id: 'asthma_sc_exercise', condition: 'asthma', threshold: 'Exercise-induced bronchoconstriction', action: 'Pre-exercise SABA. Warm-up and cool-down protocol.', details: 'Use reliever 15 min before exercise. Choose activities with short bursts (swimming, walking). Avoid cold-weather exercise.', monitoring: 'Exercise tolerance. Reliever use frequency.' },
]

// ── HIV Nursing ──
export const HIV_NURSING: NursingProtocol[] = [{
  id: 'hiv_nursing',
  diseaseId: 'hiv',
  severity: 'moderate',
  monitoring: [
    { id: 'hiv_ns_vitals', parameter: 'Vital Signs', frequency: 'Q6H' },
    { id: 'hiv_ns_weight', parameter: 'Weight', frequency: 'Weekly' },
    { id: 'hiv_ns_oi_screen', parameter: 'OI Symptom Screening', frequency: 'Daily', notes: 'Cough, fever, diarrhea, skin lesions, oral thrush, headache, visual changes' },
    { id: 'hiv_ns_adherence', parameter: 'ART Adherence Check', frequency: 'Daily', notes: 'Directly observed therapy if hospitalized. Pill count. Discuss barriers.' },
  ],
  care: [
    { id: 'hiv_care_art', parameter: 'ART Administration', frequency: 'Daily', notes: 'Administer per schedule. Document in ART register. Monitor for side effects (rash, nausea, headache).' },
    { id: 'hiv_care_infection', parameter: 'Infection Prevention', frequency: 'Continuous', notes: 'Standard precautions. Hand hygiene. Neutropenic precautions if low CD4. Screening for TB at each encounter.' },
    { id: 'hiv_care_counseling', parameter: 'Adherence Counseling', frequency: 'At each encounter', notes: 'Emphasize 95% adherence. Discuss disclosure, support system, pill reminders.' },
    { id: 'hiv_care_nutrition', parameter: 'Nutritional Support', frequency: 'Weekly', notes: 'High-protein, high-calorie diet. Multivitamins. Refer to dietitian if wasting.' },
    { id: 'hiv_care_oi_prophylaxis', parameter: 'OI Prophylaxis Administration', frequency: 'Per order', notes: 'CTZ (if CD4 <350 or WHO stage 3/4). Monitor for rash, neutropenia.' },
  ],
  escalation: [
    { id: 'hiv_esc_oi', condition: 'New OI suspected', threshold: 'Any new focal symptom or fever without source', action: 'OI diagnostic workup. Infectious disease referral.', notify: ['Doctor', 'ID team'] },
    { id: 'hiv_esc_iris', condition: 'IRIS suspected', threshold: 'Worsening symptoms after ART initiation with paradoxical inflammation', action: 'ART continuation (usually). Consider steroids if severe. ID referral.', notify: ['ID team', 'Doctor'] },
    { id: 'hiv_esc_severe_ae', condition: 'Severe ART side effect', threshold: 'Grade 3/4 toxicity (severe rash, LFT elevation, anemia)', action: 'Hold ART. Medical review. Regimen modification.', notify: ['Doctor', 'ID team'] },
  ],
}]

export const HIV_MONITORING: MonitoringProtocol[] = [{
  id: 'hiv_monitoring',
  diseaseId: 'hiv',
  severity: 'moderate',
  vitals: ['Temp', 'RR', 'HR', 'BP', 'SpO2'],
  vitalsFrequency: 'Q6H',
  urineOutput: false,
  fluidBalance: false,
  dailyWeight: true,
  painScore: true,
  consciousness: true,
  oxygenMonitoring: false,
  special: ['CD4 count q6 months', 'HIV viral load q6 months', 'CBC with differential', 'U&E / Creatinine 6-monthly', 'LFTs 6-monthly', 'RPR (syphilis) annually', 'Cervical cancer screening annually', 'TB screening at each visit'],
}]

export const HIV_SUPPORTIVE_CARE: SupportiveCareProtocol[] = [
  { id: 'hiv_sc_art', condition: 'hiv', threshold: 'All HIV patients', action: 'ART initiation/linkage to care. Same-day initiation preferred.', details: 'Refer to HIV comprehensive care clinic. Ensure CD4, VL, creatinine at baseline. Screen for OIs.', monitoring: 'ART adherence. Viral load suppression at 6 months. CD4 recovery.' },
  { id: 'hiv_sc_tb', condition: 'hiv', threshold: 'All HIV patients', action: 'TB screening at every encounter. TPT if active TB excluded.', details: 'Screen for cough, fever, night sweats, weight loss. GeneXpert if symptomatic. TPT (INH 300 mg + B6 25 mg daily x6mo) if no active TB.', monitoring: 'TB symptoms. TPT completion. LFTs monthly on INH.' },
  { id: 'hiv_sc_family', condition: 'hiv', threshold: 'All HIV patients', action: 'Partner notification and testing. Family planning counseling.', details: 'Offer HIV self-test kits for partners. Discuss PrEP for HIV-negative partners. Contraception options.', monitoring: 'Partner testing completion. Family planning uptake.' },
]

// ── Sickle Cell Nursing ──
export const SICKLE_CELL_NURSING: NursingProtocol[] = [{
  id: 'scd_nursing',
  diseaseId: 'sickle_cell',
  severity: 'moderate',
  monitoring: [
    { id: 'scd_ns_pain', parameter: 'Pain Score (0-10)', frequency: 'Q4H (Q1H if crisis)', target: '<3/10', notes: 'Use age-appropriate pain scale. Document pain location, quality, duration.' },
    { id: 'scd_ns_vitals', parameter: 'Vital Signs', frequency: 'Q4H' },
    { id: 'scd_ns_spo2', parameter: 'SpO2', frequency: 'Continuous if acute, Q4H if stable', target: '>95%' },
    { id: 'scd_ns_jaundice', parameter: 'Scleral Icterus / Jaundice Assessment', frequency: 'Daily' },
    { id: 'scd_ns_spleen', parameter: 'Spleen Palpation', frequency: 'Daily', notes: 'Assess for splenic enlargement (sequestration). Mark lower border.' },
    { id: 'scd_ns_temp', parameter: 'Temperature', frequency: 'Q4H', notes: 'Fever may indicate infection or acute chest syndrome' },
  ],
  care: [
    { id: 'scd_care_hydration', parameter: 'Hydration', frequency: 'Continuous', notes: 'IV fluids 1.5x maintenance if acute crisis. Encourage PO fluids 2-3 L/day.' },
    { id: 'scd_care_warmth', parameter: 'Warmth / Comfort Measures', frequency: 'PRN', notes: 'Warm blankets. Warm environment. Avoid cold exposure (triggers sickling).' },
    { id: 'scd_care_analgesia', parameter: 'Analgesia Administration', frequency: 'Per pain protocol', notes: 'Do not delay analgesia. Use scheduled + PRN. Reassess pain after each dose.' },
    { id: 'scd_care_o2', parameter: 'Oxygen Therapy', frequency: 'Continuous if SpO2 <95%', notes: 'Hypoxia triggers sickling. Target SpO2 >95%. Wean as tolerated.' },
    { id: 'scd_care_activity', parameter: 'Activity / Rest', frequency: 'As needed', notes: 'Balance rest during acute crisis with early mobilization as pain improves.' },
  ],
  escalation: [
    { id: 'scd_esc_acs', condition: 'Acute Chest Syndrome', threshold: 'New infiltrate on CXR + chest pain + fever + respiratory symptoms', action: 'Chest X-ray STAT. Blood culture. IV antibiotics (ceftriaxone + azithromycin). Simple/exchange transfusion. ICU if hypoxic.', notify: ['Doctor', 'ICU team', 'Hematologist'] },
    { id: 'scd_esc_sequestration', condition: 'Acute Splenic Sequestration', threshold: 'Sudden spleen enlargement + Hb drop >2 g/dL + reticulocytosis', action: 'STAT CBC and cross-match. IV fluids. Emergent transfusion. Assess for splenectomy.', notify: ['Doctor', 'Hematologist', 'Surgery'] },
    { id: 'scd_esc_stroke', condition: 'Acute Stroke', threshold: 'Focal neurological deficit, sudden headache, seizure, altered consciousness', action: 'CT head STAT. Urgent neurology review. Exchange transfusion protocol. TCD if child.', notify: ['Doctor', 'Neurologist', 'ICU team'] },
    { id: 'scd_esc_priapism', condition: 'Priapism', threshold: 'Erection >2 hours', action: 'Urology consult. Hydration. Analgesia. Aspiration/irrigation if no resolution in 4h.', notify: ['Urologist', 'Doctor'] },
    { id: 'scd_esc_aplastic', condition: 'Aplastic Crisis', threshold: 'Rapid Hb drop + reticulocytopenia', action: 'Parvovirus B19 testing. Transfusion. Infection control (droplet).', notify: ['Doctor', 'Hematologist'] },
  ],
}]

export const SICKLE_CELL_MONITORING: MonitoringProtocol[] = [{
  id: 'scd_monitoring',
  diseaseId: 'sickle_cell',
  severity: 'moderate',
  vitals: ['Temp', 'HR', 'BP', 'RR', 'SpO2'],
  vitalsFrequency: 'Q4H (Q1H if severe/acute)',
  urineOutput: true,
  urineOutputFrequency: 'Q8H',
  fluidBalance: true,
  dailyWeight: true,
  painScore: true,
  consciousness: true,
  oxygenMonitoring: true,
  special: ['Hb trend daily if acute crisis', 'Reticulocyte count', 'LDH / Bilirubin trend', 'Transfusion interval monitoring', 'TCD screening (children annually)', 'Fundoscopy annually', 'Renal function 6-monthly', 'Pulmonary hypertension screening (echo)'],
}]

export const SICKLE_CELL_SUPPORTIVE_CARE: SupportiveCareProtocol[] = [
  { id: 'scd_sc_hydroxyurea', condition: 'sickle_cell', threshold: '≥3 crises/year, ACS, or severe anemia', action: 'Hydroxyurea therapy initiation (10-20 mg/kg/day)', details: 'Counselling on benefits (50% crisis reduction) and risks (myelosuppression). Monitor CBC monthly. Increase by 5 mg/kg q8wk until response or toxicity.', monitoring: 'CBC monthly. HbF % q3-6 months. Crisis frequency.' },
  { id: 'scd_sc_vaccination', condition: 'sickle_cell', threshold: 'All SCD patients', action: 'Immunization: pneumococcal, meningococcal, Hib, influenza, COVID-19', details: 'Functional asplenia increases infection risk. Ensure up-to-date vaccines. Penicillin V prophylaxis (children <5).', monitoring: 'Vaccination record. Infection surveillance.' },
  { id: 'scd_sc_avoid_triggers', condition: 'sickle_cell', threshold: 'All SCD patients', action: 'Avoid sickling triggers: cold, dehydration, hypoxia, infection, alcohol, smoking', details: 'Patient education on crisis prevention. Maintain hydration. Avoid high altitude. Prompt treatment of infections.', monitoring: 'Crisis frequency. Hospitalizations. Patient knowledge.' },
  { id: 'scd_sc_folic_acid', condition: 'sickle_cell', threshold: 'All SCD patients', action: 'Folic acid 5 mg PO daily (lifelong)', details: 'Chronic hemolysis increases folate demand. Essential supplement to support erythropoiesis.', monitoring: 'CBC. Reticulocyte count. Compliance.' },
]

// ── Heart Disease Nursing ──
export const HEART_DISEASE_MEDICATIONS: MedicationProtocol[] = [
  { id: 'hd_furosemide', diseaseId: 'heart_disease', drug: 'Furosemide', route: 'IV/PO', dose: '20-80 mg', frequency: 'OD-BID', duration: 'Variable', contraindications: ['Anuria', 'Severe electrolyte depletion', 'Sulfonamide allergy (cross-reaction)'], allergies: ['Sulfa allergy (possible cross)'], severity: 'moderate', alternativeIfAllergy: ['Bumetanide 0.5-2 mg PO/IV'], notes: 'Monitor urine output, weight, K+, Na+, creatinine daily.' },
  { id: 'hd_ace_inhibitor', diseaseId: 'heart_disease', drug: 'Enalapril', route: 'PO', dose: '2.5-20 mg', frequency: 'BID', duration: 'Long-term', contraindications: ['Pregnancy', 'Bilateral renal artery stenosis', 'Angioedema history', 'K+ >5.5'], allergies: ['ACE-i cough (10-15%)'], severity: 'moderate', alternativeIfAllergy: ['ARB: Losartan 25-100 mg PO OD'], notes: 'First-line in HF with reduced EF. Monitor creatinine and K+ at 1-2 weeks.' },
  { id: 'hd_beta_blocker', diseaseId: 'heart_disease', drug: 'Bisoprolol', route: 'PO', dose: '1.25-10 mg', frequency: 'OD', duration: 'Long-term', contraindications: ['Asthma', '2nd/3rd degree heart block', 'Bradycardia <60', 'Decompensated HF'], allergies: [], severity: 'moderate', alternativeIfAllergy: [], notes: 'Start low, titrate slowly. Benefit in HF, CAD, arrhythmia. Do not stop abruptly.' },
  { id: 'hd_spironolactone', diseaseId: 'heart_disease', drug: 'Spironolactone', route: 'PO', dose: '12.5-50 mg', frequency: 'OD', duration: 'Long-term', contraindications: ['K+ >5.0', 'eGFR <30', 'Anuria'], allergies: [], severity: 'moderate', alternativeIfAllergy: ['Eplerenone 25-50 mg PO OD'], notes: 'For HF with EF <40%. Monitor K+ at 1, 4, 8 weeks then q6mo.' },
  { id: 'hd_digoxin', diseaseId: 'heart_disease', drug: 'Digoxin', route: 'PO/IV', dose: '0.125-0.25 mg', frequency: 'OD', duration: 'Long-term', contraindications: ['2nd/3rd degree heart block', 'WPW with AFib', 'VT/VF', 'Hypokalemia'], allergies: [], severity: 'moderate', alternativeIfAllergy: [], notes: 'Monitor levels (0.5-1.0 ng/mL). Renal adjustment needed. Watch for toxicity (anorexia, nausea, visual changes, arrhythmia).' },
  { id: 'hd_aspirin', diseaseId: 'heart_disease', drug: 'Aspirin', route: 'PO', dose: '75-325 mg', frequency: 'OD', duration: 'Long-term for secondary prevention', contraindications: ['Active peptic ulcer', 'Hemophilia', 'Severe hepatic failure', 'Children <16 (Reye)'], allergies: ['ASA allergy (aspirin-exacerbated respiratory disease)'], severity: 'moderate', alternativeIfAllergy: ['Clopidogrel 75 mg PO OD'], notes: 'Lifelong for all CAD patients. Start 325 mg if acute ACS then 81 mg maintenance.' },
  { id: 'hd_atorvastatin', diseaseId: 'heart_disease', drug: 'Atorvastatin', route: 'PO', dose: '20-80 mg', frequency: 'OD', duration: 'Long-term', contraindications: ['Active liver disease', 'Pregnancy'], allergies: ['Statin myopathy (rare)'], severity: 'moderate', alternativeIfAllergy: ['Rosuvastatin 10-40 mg PO OD'], notes: 'High-intensity for CAD. Target LDL <1.4 mmol/L (secondary prevention). Monitor LFTs and CK if symptoms.' },
  { id: 'hd_nitroglycerin', diseaseId: 'heart_disease', drug: 'Nitroglycerin', route: 'IV', dose: '0.3-0.6 mg SL or 5-200 mcg/min IV', frequency: 'Q5min SL PRN x3, IV continuous', duration: 'Acute use', contraindications: ['SBP <90', 'Right ventricular infarction', 'Severe bradycardia', 'PDE-5 inhibitor use <24-48h'], allergies: [], severity: 'severe', alternativeIfAllergy: [], notes: 'SL for angina. IV for ACS / acute HF. Monitor BP closely. Avoid in preload-dependent states.' },
  { id: 'hd_enoxaparin', diseaseId: 'heart_disease', drug: 'Enoxaparin', route: 'SC', dose: '1 mg/kg', frequency: 'BID', duration: 'Inpatient or up to 8 days', contraindications: ['Active bleeding', 'HIT history', 'Severe renal impairment (CrCl <30)', 'Spinal anesthesia (hold 24h)'], allergies: ['Heparin allergy / HIT'], severity: 'severe', alternativeIfAllergy: ['Fondaparinux 2.5 mg SC OD (if CrCl >30)'], notes: 'For ACS / anticoagulation bridge. Monitor for bleeding, HIT (platelets q2-3 days).' },
]

export const HEART_DISEASE_NURSING: NursingProtocol[] = [{
  id: 'hd_nursing',
  diseaseId: 'heart_disease',
  severity: 'moderate',
  monitoring: [
    { id: 'hd_ns_vitals', parameter: 'Vital Signs (BP, HR, RR, Temp, SpO2)', frequency: 'Q4H (Q1H if acute/ICU)', target: 'BP <140/90, HR 60-100, SpO2 >94%' },
    { id: 'hd_ns_cardiac_monitor', parameter: 'Cardiac Monitor (rhythm, rate, ectopy)', frequency: 'Continuous if acute' },
    { id: 'hd_ns_io', parameter: 'Strict Intake & Output', frequency: 'Q8H', notes: 'Negative balance target if HF. Daily weights.' },
    { id: 'hd_ns_oedema', parameter: 'Peripheral Oedema Assessment', frequency: 'Daily', notes: 'Legs, sacrum, presacral. 0-3+ pitting scale.' },
    { id: 'hd_ns_sob', parameter: 'Dyspnea / Orthopnea / PND Assessment', frequency: 'Q4H', notes: 'Assess for worsening HF — crackles, JVP, S3 gallop' },
    { id: 'hd_ns_angina', parameter: 'Chest Pain Assessment', frequency: 'Q4H and PRN', notes: 'If chest pain: STAT ECG, vitals, NTG SL, notify doctor' },
  ],
  care: [
    { id: 'hd_care_position', parameter: 'Positioning', frequency: 'Q2H', notes: 'Semi-recumbent / upright if dyspnea. Avoid supine in acute HF.' },
    { id: 'hd_care_o2', parameter: 'Oxygen Therapy', frequency: 'Continuous if SpO2 <94%', notes: 'Target SpO2 ≥94%. Titrate to maintain. Monitor for CO2 retention (COPD patients).' },
    { id: 'hd_care_fluid', parameter: 'Fluid Restriction (if applicable)', frequency: 'Per order', notes: '1.5-2 L/day if hyponatremic or refractory HF. Strict input/output chart.' },
    { id: 'hd_care_weight', parameter: 'Daily Weight', frequency: 'Daily before breakfast', notes: 'Same scale, same time, minimal clothing. >1 kg/day gain = concern.' },
    { id: 'hd_care_education', parameter: 'Heart Failure / CAD Education', frequency: 'Once then reinforce', notes: 'Low sodium diet (<2g/day). Med adherence. Symptom monitoring (daily weight, SOB, oedema). Red flags.' },
  ],
  escalation: [
    { id: 'hd_esc_pe', condition: 'Pulmonary edema / acute HF', threshold: 'Severe dyspnea at rest, SpO2 <90%, crackles >50% lung fields, respiratory distress', action: 'Semi-upright. High-flow O2. IV furosemide 40-80 mg. NTG SL/IV. CPAP/BiPAP. ICU referral.', notify: ['Doctor', 'ICU team'] },
    { id: 'hd_esc_cardiogenic_shock', condition: 'Cardiogenic shock', threshold: 'SBP <90, HR >100, altered mental status, cold periphery, lactate >2', action: 'IV fluids cautiously. Inotropes (dobutamine). Vasopressors (norepinephrine). ICU. Cardiology referral.', notify: ['Cardiology', 'ICU team', 'Consultant'] },
    { id: 'hd_esc_arrhythmia', condition: 'Life-threatening arrhythmia', threshold: 'VT, VF, AFib with RVR >150, heart block with bradycardia <40', action: 'ECG STAT. If unstable: cardioversion/defibrillation per ACLS. Antiarrhythmics. Cardiology referral.', notify: ['Code team', 'Cardiology', 'ICU team'] },
    { id: 'hd_esc_acs', condition: 'Acute coronary syndrome', threshold: 'Chest pain + ECG changes + elevated troponin', action: 'MONA: Morphine, O2, NTG, Aspirin 325 mg chew. ECG q15min. Troponin q3h. Cardiology referral for primary PCI.', notify: ['Cardiology', 'Code team', 'ICU team'] },
  ],
}]

export const HEART_DISEASE_MONITORING: MonitoringProtocol[] = [{
  id: 'hd_monitoring',
  diseaseId: 'heart_disease',
  severity: 'moderate',
  vitals: ['BP', 'HR', 'RR', 'SpO2', 'Temp'],
  vitalsFrequency: 'Q4H (Q1H if acute/ICU)',
  urineOutput: true,
  urineOutputFrequency: 'Q8H (Q1H if acute)',
  fluidBalance: true,
  dailyWeight: true,
  painScore: true,
  consciousness: true,
  oxygenMonitoring: true,
  special: ['Cardiac rhythm continuous (telemetry)', 'Troponin if ACS suspected (q3h x3)', 'BNP/NT-proBNP on admission', 'Echocardiogram during admission', 'Chest X-ray daily if HF', 'U&E / Creatinine daily during diuresis'],
}]

export const HEART_DISEASE_SUPPORTIVE_CARE: SupportiveCareProtocol[] = [
  { id: 'hd_sc_diet', condition: 'heart_disease', threshold: 'All heart disease patients', action: 'Heart-healthy diet — low sodium (<2g/day), low saturated fat, high fiber', details: 'Mediterranean or DASH diet. Limit processed foods, red meat, sugar. Increase fruits, vegetables, whole grains, fish.', monitoring: 'Dietary compliance. Weight. BP. Lipid profile.' },
  { id: 'hd_sc_exercise', condition: 'heart_disease', threshold: 'Stable patients', action: 'Cardiac rehabilitation program — supervised exercise training', details: 'Phase I (inpatient): early mobilization. Phase II (outpatient): monitored exercise 3x/week x12 weeks. Education on risk factor modification.', monitoring: 'Exercise tolerance. Symptoms during exertion. BP/HR response. Functional capacity.' },
  { id: 'hd_sc_smoking', condition: 'heart_disease', threshold: 'Current smoker', action: 'Smoking cessation — strongest single intervention to reduce CVD risk', details: 'Brief advice + pharmacotherapy (NRT, varenicline, bupropion). Refer to quitline. Follow up at each visit.', monitoring: 'Cessation progress. Carbon monoxide level if available.' },
  { id: 'hd_sc_med_adherence', condition: 'heart_disease', threshold: 'All heart disease patients', action: 'Medication adherence support and education', details: 'Explain each medication. Use pill organizers. Simplify regimen when possible. Address cost barriers.', monitoring: 'Adherence at each visit. Refill history.' },
]

export const COMMON_DISEASE_KNOWLEDGE: DiseaseKnowledge[] = [
  ...HTN_DISEASE_KNOWLEDGE,
  {
    id: 'diabetes',
    name: 'Diabetes Mellitus',
    mechanisms: ['metabolic_dysregulation'],
    epidemiology: ['Prevalence 3-12% in Kenyan adults', 'Increasing with urbanization', 'Type 2 accounts for >90% of cases'],
    riskFactors: ['Family history', 'Obesity (BMI >30)', 'Physical inactivity', 'Unhealthy diet', 'Age >40', 'History of GDM', 'Race (African, Asian, Hispanic)'],
    pathophysiology: 'Type 2 DM results from progressive insulin resistance and eventual beta-cell dysfunction. Excess visceral adiposity releases pro-inflammatory cytokines that impair insulin signaling. Initially, the pancreas compensates by increasing insulin production, but over time beta-cell decompensation occurs leading to hyperglycemia.',
    diagnosticCriteria: ['Fasting glucose ≥7.0 mmol/L', 'HbA1c ≥6.5% (48 mmol/mol)', 'Random glucose ≥11.1 mmol/L with symptoms', 'OGTT 2h glucose ≥11.1 mmol/L'],
    differentials: ['Type 1 DM', 'MODY', 'Secondary diabetes (Cushing, acromegaly, steroid-induced)', 'Stress hyperglycemia'],
    severityScoring: ['HbA1c: <7% (good control), 7-9% (moderate), >9% (poor)', 'ADA risk stratification based on complications'],
    complications: ['Diabetic ketoacidosis (DKA)', 'Hyperosmolar hyperglycemic state (HHS)', 'Retinopathy (leading cause of blindness)', 'Nephropathy (leading cause of ESRD)', 'Neuropathy (peripheral and autonomic)', 'Diabetic foot ulcers', 'CVD (MI, stroke, PAD)', 'Increased infection risk'],
    references: ['Kenya DM Guidelines (2023)', 'ADA Standards of Care (2023)', 'WHO Global Diabetes Compact'],
  },
  {
    id: 'asthma',
    name: 'Asthma',
    mechanisms: ['airway_inflammation'],
    epidemiology: ['Prevalence ~10% in Kenyan children', 'Associated with urbanization', 'Leading chronic disease in children'],
    riskFactors: ['Family history of asthma/atopy', 'Personal history of eczema/allergic rhinitis', 'Viral respiratory infections in early childhood', 'Smoke exposure', 'Obesity', 'Allergen exposure', 'Air pollution'],
    pathophysiology: 'Asthma is characterized by chronic airway inflammation leading to airway hyperresponsiveness, reversible airflow obstruction, and respiratory symptoms. Key cells include eosinophils, mast cells, and CD4+ T lymphocytes. Airway remodeling occurs over time if inflammation is untreated.',
    diagnosticCriteria: ['Episodic wheeze, dyspnea, chest tightness, cough', 'Symptoms vary over time and in intensity', 'Reversible airflow obstruction on spirometry (FEV1/FVC <0.7, FEV1 improves >12% with bronchodilator)', 'Peak flow variability >20%', 'Exclusion of alternative diagnoses'],
    differentials: ['COPD (usually later onset, irreversible)', 'Vocal cord dysfunction', 'Foreign body aspiration (especially children)', 'Bronchiectasis', 'Heart failure (cardiac asthma)', 'Allergic bronchopulmonary aspergillosis (ABPA)', 'Bronchiolitis (infants)'],
    severityScoring: ['GINA: Step 1-5 classification based on symptoms, exacerbations, lung function', 'ACT (Asthma Control Test): ≤15 uncontrolled, 16-19 partly controlled, ≥20 well controlled'],
    complications: ['Life-threatening exacerbation', 'Status asthmaticus', 'Respiratory failure (can be silent chest)', 'Pneumothorax', 'Pneumomediastinum', 'Chronic irreversible airflow limitation due to remodeling', 'Side effects of chronic steroid use if systemic'],
    references: ['GINA Report (2024)', 'Kenya Acute Asthma Guidelines', 'BTS/SIGN Asthma Guidelines (2023)'],
  },
  {
    id: 'hiv',
    name: 'HIV Infection',
    mechanisms: ['immunodeficiency'],
    epidemiology: ['Prevalence ~4% in Kenyan adults', 'Higher in women (especially ages 20-35)', 'Co-infection with TB is leading cause of death', 'Great progress toward 95-95-95 targets'],
    riskFactors: ['Unprotected sexual intercourse', 'Mother-to-child transmission (vertical)', 'Injecting drug use', 'Occupational needlestick injury', 'Blood transfusion (rare since screening)', 'Male circumcision reduces acquisition by 60%'],
    pathophysiology: 'HIV targets CD4+ T lymphocytes via surface CD4 receptor and co-receptors CCR5/CXCR4. Acute infection causes high-level viremia and massive CD4 depletion, particularly in gut-associated lymphoid tissue. Chronic infection leads to progressive immune destruction. Without ART, AIDS develops when CD4 count falls below 200 cells/μL.',
    diagnosticCriteria: ['Positive rapid antibody test (serial testing per Kenya algorithm)', 'Positive HIV-1/2 antibody differentiation test', 'HIV viral load >5,000 copies/mL', 'Positive HIV DNA PCR (infants <18 months)', 'WHO Clinical Staging: Stage 1 (asymptomatic), Stage 2 (mild), Stage 3 (advanced), Stage 4 (severe/AIDS)'],
    differentials: ['False-positive rapid test (rare — confirm with second test)', 'Advanced immunosuppression from other causes (leukemia, chemotherapy)'],
    severityScoring: ['CD4 count: >500 (good), 200-500 (moderate), <200 (AIDS-defining)', 'WHO Clinical Stage 1-4', 'HIV viral load: <1,000 (controlled), >10,000 (uncontrolled)'],
    complications: ['AIDS-defining illnesses (TB, PCP, cryptococcal meningitis, CMV, toxoplasmosis, KS)', 'IRIS (Immune Reconstitution Inflammatory Syndrome upon starting ART)', 'HIV-associated neurocognitive disorder (HAND)', 'HIV wasting syndrome', 'Increased CVD, renal, hepatic disease (chronic inflammation)', 'Malignancy (KS, NHL, cervical cancer)'],
    references: ['Kenya ARV Guidelines (2023)', 'WHO Consolidated HIV Guidelines (2023)', 'DHHS HIV Treatment Guidelines'],
  },
  {
    id: 'sickle_cell',
    name: 'Sickle Cell Disease',
    mechanisms: ['hemolytic', 'vaso_occlusive'],
    epidemiology: ['Highest prevalence in sub-Saharan Africa', 'HbAS (trait) in 15-20% of West Africans', 'HbSS homozygotes have reduced life expectancy'],
    riskFactors: ['Family history (autosomal recessive)', 'Parental consanguinity (increases risk)', 'Geographic origin (malaria-endemic regions)'],
    pathophysiology: 'Point mutation in beta-globin gene (GAG → GTG) produces HbS, which polymerizes under low oxygen tension causing red cell sickling. Sickled cells cause vaso-occlusion (ischemia-reperfusion injury) and hemolysis (intravascular and extravascular). Chronic hemolysis leads to endothelial dysfunction, pulmonary hypertension, and organ damage.',
    diagnosticCriteria: ['Positive newborn screening (heel prick — HbS on HPLC)', 'Hb electrophoresis: HbSS (homozygous), HbSC (compound heterozygote), HbS-beta-thal', 'Sickling test (sodium metabisulfite)', 'CBC: normocytic anemia with sickle cells, target cells, Howell-Jolly bodies'],
    differentials: ['HbS-beta-thalassemia', 'HbC disease', 'HbE disease', 'Hereditary spherocytosis', 'Autoimmune hemolytic anemia', 'Malaria (can coexist)'],
    severityScoring: ['Frequency of painful crises per year', 'TCD velocities (stroke risk in children)', 'Pulmonary hypertension risk (TR jet velocity on echo)'],
    complications: ['Acute: Vaso-occlusive pain crisis, Acute chest syndrome, Stroke (especially children), Splenic sequestration, Priapism, Aplastic crisis (parvovirus B19)', 'Chronic: Pulmonary hypertension, CKD, Avascular necrosis, Leg ulcers, Retinopathy, Gallstones, Functional asplenia → infection risk'],
    references: ['Kenya SCD Guidelines (2023)', 'WHO SCD Management Guidelines', 'NHLBI SCD Evidence-Based Guidelines'],
  },
  {
    id: 'heart_disease',
    name: 'Heart Disease (General)',
    mechanisms: ['cardiac_dysfunction'],
    epidemiology: ['Leading cause of death globally', 'Increasing prevalence in LMICs', 'HTN and DM are major contributors'],
    riskFactors: ['HTN', 'Diabetes', 'Smoking', 'Obesity', 'Family history', 'Sedentary lifestyle', 'Unhealthy diet', 'Age', 'Male sex'],
    pathophysiology: 'Heart disease encompasses multiple conditions affecting the heart muscle, valves, rhythm, or coronary arteries. The most common mechanisms include atherosclerotic plaque formation in coronary arteries leading to myocardial ischemia, hypertensive heart disease causing left ventricular hypertrophy, and valvular dysfunction from rheumatic or degenerative causes.',
    diagnosticCriteria: ['Depends on specific condition — see ACC/AHA and ESC guidelines per entity'],
    differentials: ['HF: COPD exacerbation, pneumonia, CKD, cirrhosis', 'CAD: Anxiety, GERD, costochondritis, PE, pericarditis'],
    severityScoring: ['NYHA Functional Class I-IV (HF)', 'Killip Class I-IV (AMI)', 'CCS Angina Class I-IV'],
    complications: ['Arrhythmias', 'Heart failure', 'Valvular dysfunction', 'Endocarditis', 'Cardiogenic shock', 'Sudden cardiac death'],
    references: ['ESC Guidelines for Heart Disease (2023)', 'ACC/AHA Guidelines for HF, CAD, Valvular Disease'],
  },
  {
    id: 'copd',
    name: 'COPD',
    mechanisms: ['airway_inflammation', 'alveolar_destruction'],
    epidemiology: ['Major cause of morbidity in smokers', 'Underdiagnosed in LMICs', 'Fourth leading cause of death'],
    riskFactors: ['Smoking (primary cause)', 'Biomass fuel exposure (especially women in LMICs)', 'Occupational dust and chemicals', 'Alpha-1 antitrypsin deficiency', 'Childhood respiratory infections', 'Low birth weight'],
    pathophysiology: 'COPD results from chronic inflammatory response to noxious particles (primarily tobacco smoke). This causes small airway disease (obstructive bronchiolitis) and parenchymal destruction (emphysema) leading to airflow limitation. Inflammation persists even after smoking cessation.',
    diagnosticCriteria: ['Chronic cough and sputum production', 'Progressive dyspnea', 'FEV1/FVC <0.70 post-bronchodilator', 'Smoking history ≥10 pack-years', 'Irreversible airflow obstruction on spirometry'],
    differentials: ['Asthma (reversible, earlier onset)', 'Bronchiectasis (more sputum, HRCT confirms)', 'Heart failure (no airflow obstruction)', 'TB-destroyed lung (TB history)', 'Bronchiolitis obliterans'],
    severityScoring: ['GOLD Stage: 1 (≥80% predicted), 2 (50-79%), 3 (30-49%), 4 (<30%)', 'GOLD ABCD group: A (low risk, less symptoms) to D (high risk, more symptoms)', 'CAT (COPD Assessment Test) or mMRC dyspnea scale'],
    complications: ['Acute exacerbations', 'Respiratory failure', 'Pulmonary hypertension', 'Cor pulmonale', 'Spontaneous pneumothorax', 'Cachexia', 'Increased cardiovascular risk', 'Lung cancer'],
    references: ['GOLD Report (2024)', 'BTS COPD Guidelines', 'Kenya COPD Guidelines'],
  },
  {
    id: 'ckd',
    name: 'Chronic Kidney Disease',
    mechanisms: ['glomerular_injury', 'tubulointerstitial_fibrosis'],
    epidemiology: ['Global prevalence ~10%', 'Underdiagnosed in early stages', 'DM and HTN are leading causes'],
    riskFactors: ['Diabetes', 'Hypertension', 'HTN', 'DM', 'HIV', 'Sickle cell', 'Glomerulonephritis', 'NSAID use', 'Family history of CKD', 'Age >65'],
    pathophysiology: 'CKD represents progressive loss of nephrons from various causes. Diabetic kidney disease involves hyperfiltration injury, mesangial expansion, and glomerulosclerosis. Hypertensive nephrosclerosis results from vascular damage and glomerular ischemia. Glomerulonephritides involve immune-mediated injury.',
    diagnosticCriteria: ['eGFR <60 mL/min/1.73m² for ≥3 months', 'Evidence of kidney damage (albuminuria, hematuria, abnormal imaging)', 'KDIGO classification by GFR category (G1-G5) and albuminuria category (A1-A3)'],
    differentials: ['AKI (acute, potentially reversible)', 'Hepatorenal syndrome', 'Congestive hepatopathy with renal congestion'],
    severityScoring: ['KDIGO stages G1-G5 based on eGFR', 'Albuminuria stages A1 (normal), A2 (microalbuminuria), A3 (macroalbuminuria)'],
    complications: ['ESRD requiring RRT', 'Cardiovascular disease (#1 cause of death in CKD)', 'Anemia (EPO deficiency)', 'Renal bone disease / CKD-MBD', 'Metabolic acidosis', 'Electrolyte abnormalities (K+, Ca++, PO4)', 'Volume overload / pulmonary edema', 'Uremic syndrome', 'Increased infection risk'],
    references: ['KDIGO Guidelines (2023)', 'Kenya CKD Guidelines', 'NKF KDOQI'],
  },
]
