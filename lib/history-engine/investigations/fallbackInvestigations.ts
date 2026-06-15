import type { InvestigationRecommendation } from './investigationRegistry';
import { getDiseaseCategory, getDiseaseName } from '../diseaseProfile';

const CATEGORY_INVESTIGATIONS: Record<string, InvestigationRecommendation[]> = {
  cardiology: [
    { id: 'fb_inv_ecg', name: '12-Lead Electrocardiogram (ECG)', category: 'bedside', priority: 'essential', rationale: 'Assess cardiac rhythm, ischemia, chamber enlargement', expectedFinding: 'Normal sinus rhythm or evidence of ischemia/arrhythmia', recommendedFor: [] },
    { id: 'fb_inv_troponin', name: 'High-sensitivity Troponin I/T', category: 'lab', priority: 'essential', rationale: 'Rule out acute coronary syndrome/myocarditis', expectedFinding: '<99th percentile upper reference limit', recommendedFor: [] },
    { id: 'fb_inv_echo', name: 'Transthoracic Echocardiogram', category: 'imaging', priority: 'essential', rationale: 'Assess cardiac structure and function', expectedFinding: 'Normal LVEF, wall motion, valve function', recommendedFor: [] },
    { id: 'fb_inv_cbc_card', name: 'Complete Blood Count', category: 'lab', priority: 'supportive', rationale: 'Assess for anemia, infection, or thrombocytopenia', expectedFinding: 'Within normal limits', recommendedFor: [] },
    { id: 'fb_inv_cxr_card', name: 'Chest X-ray (PA view)', category: 'imaging', priority: 'supportive', rationale: 'Assess cardiac silhouette, pulmonary congestion', expectedFinding: 'Normal cardiac silhouette, clear lung fields', recommendedFor: [] },
  ],
  respiratory: [
    { id: 'fb_inv_cxr', name: 'Chest X-ray (PA + Lateral)', category: 'imaging', priority: 'essential', rationale: 'Evaluate lung parenchyma, pleura, and mediastinum', expectedFinding: 'Normal lung fields with no consolidation or effusion', recommendedFor: [] },
    { id: 'fb_inv_pulse_ox', name: 'Pulse Oximetry', category: 'bedside', priority: 'essential', rationale: 'Baseline oxygen saturation', expectedFinding: 'SpO2 >= 95% on room air', recommendedFor: [] },
    { id: 'fb_inv_cbc_resp', name: 'Complete Blood Count', category: 'lab', priority: 'essential', rationale: 'Assess for infection, anemia', expectedFinding: 'Normal WBC, Hb, platelets', recommendedFor: [] },
    { id: 'fb_inv_crp', name: 'C-Reactive Protein', category: 'lab', priority: 'supportive', rationale: 'Assess inflammatory response', expectedFinding: '<5 mg/L', recommendedFor: [] },
    { id: 'fb_inv_abg', name: 'Arterial Blood Gas', category: 'lab', priority: 'supportive', rationale: 'Assess oxygenation, ventilation, acid-base status', expectedFinding: 'pH 7.35-7.45, PaO2 >80 mmHg, PaCO2 35-45 mmHg', recommendedFor: [] },
    { id: 'fb_inv_sputum', name: 'Sputum Culture and Sensitivity', category: 'lab', priority: 'supportive', rationale: 'Identify causative organism if pneumonia suspected', expectedFinding: 'No significant growth', recommendedFor: [] },
  ],
  neurology: [
    { id: 'fb_inv_ct_brain', name: 'CT Brain (non-contrast)', category: 'imaging', priority: 'essential', rationale: 'Rule out hemorrhage, mass, or acute infarct', expectedFinding: 'No acute intracranial pathology', recommendedFor: [] },
    { id: 'fb_inv_mri_brain', name: 'MRI Brain with contrast', category: 'imaging', priority: 'supportive', rationale: 'Detailed evaluation of brain parenchyma', expectedFinding: 'No significant abnormality', recommendedFor: [] },
    { id: 'fb_inv_eeg', name: 'Electroencephalogram (EEG)', category: 'procedure', priority: 'supportive', rationale: 'Evaluate for seizure activity or encephalopathy', expectedFinding: 'Normal background activity', recommendedFor: [] },
    { id: 'fb_inv_lp', name: 'Lumbar Puncture', category: 'procedure', priority: 'supportive', rationale: 'CSF analysis if meningitis or subarachnoid hemorrhage suspected', expectedFinding: 'Normal opening pressure, clear CSF, normal cell/protein/glucose', recommendedFor: [] },
  ],
  infectious: [
    { id: 'fb_inv_cbc_inf', name: 'Complete Blood Count', category: 'lab', priority: 'essential', rationale: 'Assess WBC count, differential for infection', expectedFinding: 'Normal or elevated WBC with left shift', recommendedFor: [] },
    { id: 'fb_inv_crp_inf', name: 'C-Reactive Protein', category: 'lab', priority: 'essential', rationale: 'Quantify inflammatory response', expectedFinding: '<5 mg/L', recommendedFor: [] },
    { id: 'fb_inv_blood_culture', name: 'Blood Cultures (aerobic + anaerobic)', category: 'lab', priority: 'essential', rationale: 'Identify causative organism in suspected bacteremia/sepsis', expectedFinding: 'No growth after 48 hours', recommendedFor: [] },
    { id: 'fb_inv_urine_culture', name: 'Urinalysis + Culture', category: 'lab', priority: 'supportive', rationale: 'Rule out urinary source of infection', expectedFinding: 'No significant bacteriuria', recommendedFor: [] },
    { id: 'fb_inv_rapid_test', name: 'Rapid Diagnostic Test (RDT) / Serology', category: 'lab', priority: 'supportive', rationale: 'Targeted testing based on suspected pathogen', expectedFinding: 'Negative', recommendedFor: [] },
    { id: 'fb_inv_imaging_inf', name: 'Targeted Imaging (US/X-ray/CT)', category: 'imaging', priority: 'supportive', rationale: 'Localize source of infection', expectedFinding: 'No focal collection or abscess', recommendedFor: [] },
  ],
  surgery: [
    { id: 'fb_inv_cbc_surg', name: 'Complete Blood Count', category: 'lab', priority: 'essential', rationale: 'Pre-operative baseline, assess for infection/anemia', expectedFinding: 'Normal range', recommendedFor: [] },
    { id: 'fb_inv_imaging_surg', name: 'Targeted Imaging (CT/US/X-ray)', category: 'imaging', priority: 'essential', rationale: 'Define surgical pathology', expectedFinding: 'Consistent with clinical diagnosis', recommendedFor: [] },
    { id: 'fb_inv_group_save', name: 'Blood Group + Crossmatch', category: 'lab', priority: 'essential', rationale: 'Prepare for potential blood transfusion', expectedFinding: 'ABO/Rh compatible', recommendedFor: [] },
    { id: 'fb_inv_ecg_surg', name: 'ECG', category: 'bedside', priority: 'essential', rationale: 'Pre-operative cardiac assessment', expectedFinding: 'Normal sinus rhythm', recommendedFor: [] },
    { id: 'fb_inv_renal_surg', name: 'Serum Electrolytes + Creatinine', category: 'lab', priority: 'essential', rationale: 'Pre-operative renal function assessment', expectedFinding: 'Normal range', recommendedFor: [] },
    { id: 'fb_inv_coags_surg', name: 'Coagulation Profile (PT/PTT/INR)', category: 'lab', priority: 'supportive', rationale: 'Assess bleeding risk', expectedFinding: 'Within normal limits', recommendedFor: [] },
  ],
  orthopaedics: [
    { id: 'fb_inv_xr', name: 'X-ray (AP + Lateral views)', category: 'imaging', priority: 'essential', rationale: 'Evaluate bone/joint pathology', expectedFinding: 'No fracture, dislocation, or degenerative change', recommendedFor: [] },
    { id: 'fb_inv_mri_msk', name: 'MRI (with/without contrast)', category: 'imaging', priority: 'supportive', rationale: 'Evaluate soft tissue, ligaments, cartilage', expectedFinding: 'No tear, edema, or mass', recommendedFor: [] },
    { id: 'fb_inv_crp_ortho', name: 'C-Reactive Protein', category: 'lab', priority: 'essential', rationale: 'Rule out septic arthritis or osteomyelitis', expectedFinding: '<5 mg/L', recommendedFor: [] },
    { id: 'fb_inv_ct_msk', name: 'CT Scan (for complex fractures)', category: 'imaging', priority: 'supportive', rationale: 'Detailed bony anatomy assessment', expectedFinding: 'Consistent with X-ray findings', recommendedFor: [] },
  ],
  psychiatry: [
    { id: 'fb_inv_psych_assess', name: 'Mental State Examination (MSE)', category: 'bedside', priority: 'essential', rationale: 'Structured assessment of mental status', expectedFinding: 'Within normal limits for age', recommendedFor: [] },
    { id: 'fb_inv_thyroid_psych', name: 'Thyroid Function Tests', category: 'lab', priority: 'supportive', rationale: 'Rule out organic cause (thyroid dysfunction)', expectedFinding: 'Normal TSH, FT4', recommendedFor: [] },
    { id: 'fb_inv_tox_screen', name: 'Urine Toxicology Screen', category: 'lab', priority: 'supportive', rationale: 'Rule out substance-induced presentation', expectedFinding: 'Negative', recommendedFor: [] },
    { id: 'fb_inv_vitamins_psych', name: 'Vitamin B12 + Folate', category: 'lab', priority: 'supportive', rationale: 'Rule out deficiency contributing to symptoms', expectedFinding: 'Within normal limits', recommendedFor: [] },
  ],
  endocrinology: [
    { id: 'fb_inv_hba1c', name: 'HbA1c / Fasting Blood Glucose', category: 'lab', priority: 'essential', rationale: 'Assess glycemic control', expectedFinding: '<5.7% (normal) or target for diabetes', recommendedFor: [] },
    { id: 'fb_inv_tsh', name: 'Thyroid Function Tests (TSH, FT4)', category: 'lab', priority: 'essential', rationale: 'Assess thyroid status', expectedFinding: 'TSH 0.5-4.5 mIU/L, FT4 normal', recommendedFor: [] },
    { id: 'fb_inv_electrolytes', name: 'Serum Electrolytes + Calcium', category: 'lab', priority: 'essential', rationale: 'Assess metabolic/electrolyte balance', expectedFinding: 'Within normal limits', recommendedFor: [] },
    { id: 'fb_inv_cortisol', name: 'Cortisol (AM) / ACTH Stimulation', category: 'lab', priority: 'supportive', rationale: 'Assess adrenal function', expectedFinding: 'Normal cortisol response', recommendedFor: [] },
  ],
  gastroenterology: [
    { id: 'fb_inv_lfts', name: 'Liver Function Tests', category: 'lab', priority: 'essential', rationale: 'Assess hepatic function', expectedFinding: 'Within normal limits', recommendedFor: [] },
    { id: 'fb_inv_abdominal_us', name: 'Abdominal Ultrasound', category: 'imaging', priority: 'essential', rationale: 'Evaluate abdominal organs', expectedFinding: 'Normal study', recommendedFor: [] },
    { id: 'fb_inv_endoscopy', name: 'Upper GI Endoscopy / Colonoscopy', category: 'procedure', priority: 'supportive', rationale: 'Direct visualization of GI tract', expectedFinding: 'Normal mucosa', recommendedFor: [] },
    { id: 'fb_inv_stool', name: 'Stool Studies (MCS, O&P, Calprotectin)', category: 'lab', priority: 'supportive', rationale: 'Evaluate for infection or inflammation', expectedFinding: 'No pathogens, normal calprotectin', recommendedFor: [] },
  ],
  urology: [
    { id: 'fb_inv_urinalysis', name: 'Urinalysis + Microscopy', category: 'lab', priority: 'essential', rationale: 'Assess for UTI, hematuria, proteinuria', expectedFinding: 'Normal', recommendedFor: [] },
    { id: 'fb_inv_renal_us', name: 'Renal Ultrasound', category: 'imaging', priority: 'essential', rationale: 'Evaluate kidneys, bladder, prostate', expectedFinding: 'Normal anatomy, no hydronephrosis', recommendedFor: [] },
    { id: 'fb_inv_creatinine', name: 'Serum Creatinine / eGFR', category: 'lab', priority: 'essential', rationale: 'Assess renal function', expectedFinding: 'Normal for age', recommendedFor: [] },
    { id: 'fb_inv_psa', name: 'PSA (if indicated)', category: 'lab', priority: 'supportive', rationale: 'Prostate cancer screening when indicated', expectedFinding: '<4 ng/mL', recommendedFor: [] },
    { id: 'fb_inv_ct_kub', name: 'CT KUB (if stone suspected)', category: 'imaging', priority: 'supportive', rationale: 'Evaluate for urolithiasis', expectedFinding: 'No stone or obstruction', recommendedFor: [] },
  ],
  gynecology: [
    { id: 'fb_inv_pelvic_us', name: 'Pelvic Ultrasound', category: 'imaging', priority: 'essential', rationale: 'Evaluate uterus, ovaries, adnexa', expectedFinding: 'Normal pelvic anatomy', recommendedFor: [] },
    { id: 'fb_inv_pregnancy', name: 'Pregnancy Test (urine/serum)', category: 'lab', priority: 'essential', rationale: 'Rule out pregnancy', expectedFinding: 'Negative', recommendedFor: [] },
    { id: 'fb_inv_pap', name: 'Pap Smear / Cervical Screening', category: 'procedure', priority: 'supportive', rationale: 'Cervical cancer screening', expectedFinding: 'Normal', recommendedFor: [] },
    { id: 'fb_inv_sti_screen', name: 'STI Screening (NAAT)', category: 'lab', priority: 'supportive', rationale: 'Rule out chlamydia, gonorrhea, etc.', expectedFinding: 'Negative', recommendedFor: [] },
  ],
  obstetrics: [
    { id: 'fb_inv_ob_us', name: 'Obstetric Ultrasound', category: 'imaging', priority: 'essential', rationale: 'Assess fetal viability, growth, anatomy', expectedFinding: 'Normal singleton intrauterine pregnancy', recommendedFor: [] },
    { id: 'fb_inv_cbc_ob', name: 'Complete Blood Count', category: 'lab', priority: 'essential', rationale: 'Assess for anemia, infection', expectedFinding: 'Normal pregnancy-adjusted ranges', recommendedFor: [] },
    { id: 'fb_inv_urine_ob', name: 'Urinalysis', category: 'lab', priority: 'essential', rationale: 'Screen for proteinuria, UTI', expectedFinding: 'No protein, no infection', recommendedFor: [] },
    { id: 'fb_inv_bp_ob', name: 'Blood Pressure Monitoring', category: 'bedside', priority: 'essential', rationale: 'Screen for pre-eclampsia', expectedFinding: '<140/90 mmHg', recommendedFor: [] },
  ],
  dermatology: [
    { id: 'fb_inv_skin_biopsy', name: 'Skin Biopsy (punch/excisional)', category: 'procedure', priority: 'supportive', rationale: 'Histopathological diagnosis', expectedFinding: 'Consistent with clinical diagnosis', recommendedFor: [] },
    { id: 'fb_inv_skin_scraping', name: 'Skin Scraping for KOH/Fungal', category: 'lab', priority: 'supportive', rationale: 'Rule out fungal infection', expectedFinding: 'Negative for hyphae/spores', recommendedFor: [] },
  ],
  ophthalmology: [
    { id: 'fb_inv_vision', name: 'Visual Acuity Test', category: 'bedside', priority: 'essential', rationale: 'Baseline visual function', expectedFinding: '6/6 or baseline', recommendedFor: [] },
    { id: 'fb_inv_slit_lamp', name: 'Slit Lamp Examination', category: 'bedside', priority: 'essential', rationale: 'Detailed anterior segment examination', expectedFinding: 'Normal anterior segment', recommendedFor: [] },
    { id: 'fb_inv_fundoscopy', name: 'Fundoscopy / Dilated Eye Exam', category: 'bedside', priority: 'essential', rationale: 'Evaluate retina and optic disc', expectedFinding: 'Normal fundus', recommendedFor: [] },
  ],
  ent: [
    { id: 'fb_inv_audiology', name: 'Audiometry / Tympanometry', category: 'procedure', priority: 'supportive', rationale: 'Assess hearing function', expectedFinding: 'Normal hearing thresholds', recommendedFor: [] },
    { id: 'fb_inv_nasal_endoscopy', name: 'Nasal Endoscopy', category: 'procedure', priority: 'supportive', rationale: 'Visualize nasal cavity and sinuses', expectedFinding: 'Normal nasal mucosa, no polyps/mass', recommendedFor: [] },
    { id: 'fb_inv_ct_sinus', name: 'CT Sinuses', category: 'imaging', priority: 'supportive', rationale: 'Evaluate sinus pathology', expectedFinding: 'Normal sinus anatomy', recommendedFor: [] },
  ],
  hematology: [
    { id: 'fb_inv_cbc_hem', name: 'Complete Blood Count + Differential', category: 'lab', priority: 'essential', rationale: 'Full hematological assessment', expectedFinding: 'Normal cell counts and morphology', recommendedFor: [] },
    { id: 'fb_inv_coags_hem', name: 'Coagulation Profile (PT/PTT/INR)', category: 'lab', priority: 'essential', rationale: 'Assess coagulation status', expectedFinding: 'Within normal limits', recommendedFor: [] },
    { id: 'fb_inv_peripheral_smear', name: 'Peripheral Blood Smear', category: 'lab', priority: 'supportive', rationale: 'Evaluate cell morphology', expectedFinding: 'Normal morphology', recommendedFor: [] },
    { id: 'fb_inv_iron_studies', name: 'Iron Studies / B12 / Folate', category: 'lab', priority: 'supportive', rationale: 'Assess for nutritional deficiencies', expectedFinding: 'Within normal limits', recommendedFor: [] },
  ],
  pediatrics: [
    { id: 'fb_inv_cbc_ped', name: 'Complete Blood Count', category: 'lab', priority: 'essential', rationale: 'Assess for infection, anemia, or leukemia', expectedFinding: 'Normal for age', recommendedFor: [] },
    { id: 'fb_inv_crp_ped', name: 'C-Reactive Protein', category: 'lab', priority: 'essential', rationale: 'Assess inflammatory response', expectedFinding: '<5 mg/L', recommendedFor: [] },
    { id: 'fb_inv_blood_culture_ped', name: 'Blood Cultures', category: 'lab', priority: 'essential', rationale: 'Rule out bacteremia/sepsis', expectedFinding: 'No growth', recommendedFor: [] },
    { id: 'fb_inv_cxr_ped', name: 'Chest X-ray', category: 'imaging', priority: 'supportive', rationale: 'Evaluate for pneumonia, cardiac size', expectedFinding: 'Normal', recommendedFor: [] },
    { id: 'fb_inv_growth_chart', name: 'Growth Chart (WHO/Z-score)', category: 'bedside', priority: 'essential', rationale: 'Assess nutritional status and growth trajectory', expectedFinding: 'Within normal percentiles', recommendedFor: [] },
  ],
  rheumatology: [
    { id: 'fb_inv_crp_rheum', name: 'CRP + ESR', category: 'lab', priority: 'essential', rationale: 'Assess systemic inflammation', expectedFinding: 'Normal or elevated', recommendedFor: [] },
    { id: 'fb_inv_rf', name: 'Rheumatoid Factor / Anti-CCP', category: 'lab', priority: 'supportive', rationale: 'Evaluate for rheumatoid arthritis', expectedFinding: 'Negative', recommendedFor: [] },
    { id: 'fb_inv_ana', name: 'Antinuclear Antibody (ANA)', category: 'lab', priority: 'supportive', rationale: 'Screen for autoimmune connective tissue disease', expectedFinding: 'Negative (titer <1:40)', recommendedFor: [] },
    { id: 'fb_inv_joint_imaging', name: 'Joint X-ray / Ultrasound', category: 'imaging', priority: 'supportive', rationale: 'Evaluate joint inflammation and damage', expectedFinding: 'No erosion/synovitis', recommendedFor: [] },
  ],
  emergency: [
    { id: 'fb_inv_ecg_em', name: 'ECG', category: 'bedside', priority: 'essential', rationale: 'Rapid cardiac assessment', expectedFinding: 'Normal sinus rhythm', recommendedFor: [] },
    { id: 'fb_inv_vbg', name: 'Venous Blood Gas', category: 'lab', priority: 'essential', rationale: 'Rapid acid-base and metabolic assessment', expectedFinding: 'Normal pH, lactate <2', recommendedFor: [] },
    { id: 'fb_inv_bedside_us', name: 'Point-of-Care Ultrasound (POCUS)', category: 'bedside', priority: 'supportive', rationale: 'Focused assessment for trauma/shock', expectedFinding: 'No free fluid, normal cardiac activity', recommendedFor: [] },
    { id: 'fb_inv_ct_trauma', name: 'CT Trauma Series', category: 'imaging', priority: 'supportive', rationale: 'Evaluate for traumatic injuries', expectedFinding: 'No acute injury', recommendedFor: [] },
  ],
  oncology: [
    { id: 'fb_inv_ct_staging', name: 'CT Chest/Abdomen/Pelvis (staging)', category: 'imaging', priority: 'essential', rationale: 'Assess disease extent and metastases', expectedFinding: 'No metastatic disease', recommendedFor: [] },
    { id: 'fb_inv_tumor_biopsy', name: 'Biopsy (core/FNA) for histology', category: 'procedure', priority: 'essential', rationale: 'Histopathological confirmation and grading', expectedFinding: 'Consistent with suspected malignancy', recommendedFor: [] },
    { id: 'fb_inv_tumor_markers', name: 'Tumor Markers (as indicated)', category: 'lab', priority: 'supportive', rationale: 'Baseline and monitoring', expectedFinding: 'Within normal limits', recommendedFor: [] },
    { id: 'fb_inv_pet_ct', name: 'PET-CT (if indicated)', category: 'imaging', priority: 'supportive', rationale: 'Metabolic staging and treatment response', expectedFinding: 'No FDG-avid disease', recommendedFor: [] },
  ],
  nephrology: [
    { id: 'fb_inv_creatinine_neph', name: 'Serum Creatinine / eGFR', category: 'lab', priority: 'essential', rationale: 'Assess renal function', expectedFinding: 'Normal for age', recommendedFor: [] },
    { id: 'fb_inv_urine_protein', name: 'Urine Protein/Creatinine Ratio', category: 'lab', priority: 'essential', rationale: 'Quantify proteinuria', expectedFinding: '<30 mg/mmol', recommendedFor: [] },
    { id: 'fb_inv_renal_biopsy', name: 'Renal Biopsy (if indicated)', category: 'procedure', priority: 'supportive', rationale: 'Histological diagnosis of renal disease', expectedFinding: 'Consistent with clinical diagnosis', recommendedFor: [] },
  ],
  hepatology: [
    { id: 'fb_inv_lft_hep', name: 'Liver Function Tests', category: 'lab', priority: 'essential', rationale: 'Assess hepatic synthetic function and injury', expectedFinding: 'Normal bilirubin, ALT, AST, ALP, albumin', recommendedFor: [] },
    { id: 'fb_inv_abdominal_us_hep', name: 'Abdominal Ultrasound', category: 'imaging', priority: 'essential', rationale: 'Assess liver parenchyma, portal system', expectedFinding: 'Normal liver echotexture', recommendedFor: [] },
    { id: 'fb_inv_viral_hep', name: 'Viral Hepatitis Serology (HBsAg, Anti-HCV)', category: 'lab', priority: 'supportive', rationale: 'Rule out viral hepatitis', expectedFinding: 'Negative', recommendedFor: [] },
  ],
  general_medicine: [
    { id: 'fb_inv_cbc_gm', name: 'Complete Blood Count', category: 'lab', priority: 'essential', rationale: 'Baseline hematological assessment', expectedFinding: 'Within normal limits', recommendedFor: [] },
    { id: 'fb_inv_basic_metab', name: 'Basic Metabolic Panel (Na, K, Urea, Cr)', category: 'lab', priority: 'essential', rationale: 'Baseline metabolic assessment', expectedFinding: 'Within normal limits', recommendedFor: [] },
    { id: 'fb_inv_crp_gm', name: 'C-Reactive Protein', category: 'lab', priority: 'supportive', rationale: 'Assess systemic inflammation', expectedFinding: '<5 mg/L', recommendedFor: [] },
    { id: 'fb_inv_ecg_gm', name: 'ECG', category: 'bedside', priority: 'supportive', rationale: 'Baseline cardiac assessment', expectedFinding: 'Normal sinus rhythm', recommendedFor: [] },
    { id: 'fb_inv_cxr_gm', name: 'Chest X-ray', category: 'imaging', priority: 'supportive', rationale: 'Baseline chest assessment', expectedFinding: 'Normal', recommendedFor: [] },
  ],
};

const _seen = new Set<string>();

/** Generate default investigation recommendations for a disease not in the static registry */
export function getFallbackInvestigations(diseaseIds: string[]): InvestigationRecommendation[] {
  const result: InvestigationRecommendation[] = [];
  const seen = new Set<string>();

  for (const did of diseaseIds) {
    const cat = getDiseaseCategory(did);
    const invs = CATEGORY_INVESTIGATIONS[cat] || CATEGORY_INVESTIGATIONS['general_medicine'];
    for (const inv of invs) {
      if (!seen.has(inv.id)) {
        seen.add(inv.id);
        result.push({
          ...inv,
          recommendedFor: [did],
          rationale: `${inv.rationale} — suggested for ${getDiseaseName(did)}`,
        });
      }
    }
  }

  return result;
}
