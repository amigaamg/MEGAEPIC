// ═══════════════════════════════════════════════════════════════
// AMEXAN CLINICAL CONSTITUTION — BOOK VI
// DISEASE REGISTRY — self-contained Disease Objects
// Each disease contains ALL its knowledge in one constitutional object.
// Symptoms reference diseases; diseases never embed in symptoms.
// ═══════════════════════════════════════════════════════════════

import type { DiseaseObject } from './clinical-knowledge-constitution';

// ── PNEUMONIA ─────────────────────────────────────────────────
export const PNEUMONIA: DiseaseObject = {
  id: 'pneumonia',
  name: 'Pneumonia',
  snomed: '233604007',
  icd10: 'J18.9',
  synonyms: ['Community-acquired pneumonia', 'CAP', 'Lobar pneumonia', 'Bronchopneumonia', 'Lower respiratory tract infection'],
  specialties: ['pulmonology', 'internal_medicine', 'infectious_disease', 'emergency_medicine', 'pediatrics', 'critical_care'],
  ageGroups: ['neonate', 'infant', 'child', 'adolescent', 'adult', 'older_adult'],
  emergencyLevel: 'orange',
  bodySystems: ['respiratory', 'immune'],
  mechanisms: ['infectious', 'inflammatory'],
  phenotypes: [
    { name: 'Typical pneumonia', features: ['fever', 'productive_cough', 'consolidation_on_imaging', 'elevated_crp'], prevalence: 0.6, typicalPresentation: 'Acute fever with productive cough and focal signs' },
    { name: 'Atypical pneumonia', features: ['dry_cough', 'fever', 'headache', 'myalgia', 'patchy_infiltrates'], prevalence: 0.2, typicalPresentation: 'Subacute onset with dry cough and systemic symptoms' },
    { name: 'Aspiration pneumonia', features: ['aspiration_risk', 'dependent_segments', 'anaerobic_organisms'], prevalence: 0.1, typicalPresentation: 'Post-aspiration in at-risk patient' },
    { name: 'Hospital-acquired pneumonia', features: ['onset_after_48h_hospitalization', 'multidrug_resistant_organisms', 'severe_disease'], prevalence: 0.05, typicalPresentation: 'New infiltrates after 48 hours in hospital' },
    { name: 'Necrotizing pneumonia', features: ['cavitary_lesions', 'prolonged_fever', 'severe_sepsis'], prevalence: 0.05, typicalPresentation: 'Severe pneumonia with cavitation' },
  ],
  etiologies: [
    { agent: 'Streptococcus pneumoniae', type: 'infectious', frequency: 'common', notes: 'Most common cause of CAP' },
    { agent: 'Haemophilus influenzae', type: 'infectious', frequency: 'common', notes: 'Common in COPD patients' },
    { agent: 'Klebsiella pneumoniae', type: 'infectious', frequency: 'common', notes: 'Common in alcoholics and diabetics' },
    { agent: 'Mycoplasma pneumoniae', type: 'infectious', frequency: 'uncommon', notes: 'Common cause of atypical pneumonia in young adults' },
    { agent: 'Chlamydia psittaci', type: 'infectious', frequency: 'rare', notes: 'Bird exposure' },
    { agent: 'Legionella pneumophila', type: 'infectious', frequency: 'uncommon', notes: 'Air conditioning, water systems' },
    { agent: 'Respiratory syncytial virus', type: 'infectious', frequency: 'common', notes: 'Common in infants and elderly' },
    { agent: 'SARS-CoV-2', type: 'infectious', frequency: 'common', notes: 'Viral pneumonia with atypical features' },
    { agent: 'Pneumocystis jirovecii', type: 'infectious', frequency: 'uncommon', notes: 'Immunocompromised patients' },
  ],
  riskFactors: [
    { factor: 'Age > 65 years', weight: 2.0, type: 'non_modifiable' },
    { factor: 'Smoking', weight: 1.8, type: 'modifiable' },
    { factor: 'COPD', weight: 2.5, type: 'non_modifiable' },
    { factor: 'Diabetes mellitus', weight: 1.5, type: 'non_modifiable' },
    { factor: 'HIV infection', weight: 3.0, type: 'non_modifiable' },
    { factor: 'Alcohol use disorder', weight: 2.0, type: 'modifiable' },
    { factor: 'Aspiration risk', weight: 2.5, type: 'non_modifiable' },
    { factor: 'Hospitalization', weight: 2.0, type: 'environmental' },
    { factor: 'Immunosuppression', weight: 3.0, type: 'non_modifiable' },
    { factor: 'Malnutrition', weight: 1.5, type: 'modifiable' },
  ],
  predispositions: ['Chronic lung disease', 'Heart failure', 'Renal failure', 'Liver disease', 'Malignancy', 'Stroke with dysphagia', 'Post-splenectomy'],
  naturalHistory: 'Acute onset over days, fever and cough develop, untreated leads to progressive respiratory distress and sepsis. Resolution over 1-3 weeks with appropriate treatment.',
  pathophysiology: [
    { step: 1, event: 'Pathogen reaches alveoli via inhalation or aspiration', mechanism: 'infectious', detail: 'Organisms bypass upper airway defenses' },
    { step: 2, event: 'Alveolar inflammation and exudate', mechanism: 'inflammatory', detail: 'Neutrophils and fluid fill alveoli' },
    { step: 3, event: 'Consolidation of lung tissue', mechanism: 'inflammatory', detail: 'Alveoli filled with inflammatory exudate, visible on imaging' },
    { step: 4, event: 'Ventilation-perfusion mismatch', mechanism: 'ventilatory', detail: 'Shunted blood leads to hypoxemia' },
    { step: 5, event: 'Systemic inflammatory response', mechanism: 'inflammatory', detail: 'Fever, leukocytosis, acute phase reactants' },
    { step: 6, event: 'Respiratory failure if severe', mechanism: 'ventilatory', detail: 'Hypoxemic respiratory failure requiring oxygen or ventilation' },
  ],
  complications: [
    { complication: 'Parapneumonic effusion', frequency: 'common', diseaseId: null, management: 'Thoracentesis, antibiotics' },
    { complication: 'Empyema', frequency: 'uncommon', diseaseId: null, management: 'Chest tube drainage, prolonged antibiotics' },
    { complication: 'Respiratory failure', frequency: 'uncommon', diseaseId: null, management: 'Oxygen therapy, non-invasive or mechanical ventilation' },
    { complication: 'Sepsis', frequency: 'uncommon', diseaseId: 'sepsis', management: 'IV fluids, vasopressors, broad-spectrum antibiotics' },
    { complication: 'Septic shock', frequency: 'rare', diseaseId: 'septic_shock', management: 'ICU admission, vasopressors, source control' },
    { complication: 'Lung abscess', frequency: 'rare', diseaseId: null, management: 'Prolonged antibiotics, drainage if needed' },
  ],
  symptoms: [
    { symptomId: 'cough', frequency: 'always', typicalCharacter: 'Productive with purulent sputum', typicalTimeline: 'Develops over 1-3 days', discriminatingValue: 0.8 },
    { symptomId: 'fever', frequency: 'always', typicalCharacter: 'High grade, continuous', typicalTimeline: 'Acute onset, persists until treatment', discriminatingValue: 0.7 },
    { symptomId: 'dyspnea', frequency: 'common', typicalCharacter: 'Exertional, progressive', typicalTimeline: 'Develops as consolidation spreads', discriminatingValue: 0.6 },
    { symptomId: 'chest_pain', frequency: 'common', typicalCharacter: 'Pleuritic, sharp on inspiration', typicalTimeline: 'Associated with pleural inflammation', discriminatingValue: 0.5 },
    { symptomId: 'hemoptysis', frequency: 'uncommon', typicalCharacter: 'Blood-streaked sputum', typicalTimeline: 'May occur with severe cough', discriminatingValue: 0.3 },
  ],
  signs: [
    { signId: 'crackles', frequency: 'always', description: 'Fine or coarse crackles over affected area' },
    { signId: 'bronchial_breathing', frequency: 'common', description: 'Bronchial breath sounds over consolidated area' },
    { signId: 'dull_percussion', frequency: 'common', description: 'Dullness over consolidated lung' },
    { signId: 'reduced_expansion', frequency: 'common', description: 'Unilateral reduced chest expansion' },
    { signId: 'tachypnea', frequency: 'common', description: 'Respiratory rate > 20/min' },
    { signId: 'tachycardia', frequency: 'common', description: 'Heart rate > 100/min' },
    { signId: 'fever_temperature', frequency: 'always', description: 'Temperature > 38.0°C' },
    { signId: 'hypoxia', frequency: 'uncommon', description: 'Oxygen saturation < 92%' },
  ],
  investigations: [
    { investigationId: 'cbc', purpose: 'Assess for leukocytosis', timing: 'initial', requiredForDiagnosis: false, expectedResult: 'WBC > 11,000 or < 4,000', sensitivity: 0.75, specificity: 0.65 },
    { investigationId: 'crp', purpose: 'Assess inflammation', timing: 'initial', requiredForDiagnosis: false, expectedResult: 'Elevated > 20 mg/L', sensitivity: 0.85, specificity: 0.7 },
    { investigationId: 'chest_xray', purpose: 'Confirm consolidation', timing: 'initial', requiredForDiagnosis: true, expectedResult: 'Air-space opacity, lobar consolidation, or interstitial infiltrates', sensitivity: 0.85, specificity: 0.9 },
    { investigationId: 'sputum_gram_stain', purpose: 'Identify organism', timing: 'initial', requiredForDiagnosis: false, expectedResult: 'PMNs and organisms', sensitivity: 0.6, specificity: 0.85 },
    { investigationId: 'sputum_culture', purpose: 'Identify pathogen', timing: 'initial', requiredForDiagnosis: false, expectedResult: 'Growth of pathogenic organism', sensitivity: 0.5, specificity: 0.9 },
    { investigationId: 'blood_culture', purpose: 'Identify bacteremia', timing: 'initial', requiredForDiagnosis: false, expectedResult: 'Growth of organism', sensitivity: 0.15, specificity: 0.95 },
    { investigationId: 'abg', purpose: 'Assess oxygenation', timing: 'initial', requiredForDiagnosis: false, expectedResult: 'PaO2 < 60 mmHg, PaCO2 normal/low', sensitivity: 0.8, specificity: 0.75 },
    { investigationId: 'ct_chest', purpose: 'Detailed lung evaluation', timing: 'confirmatory', requiredForDiagnosis: false, expectedResult: 'Consolidation, ground-glass opacities', sensitivity: 0.95, specificity: 0.9 },
  ],
  diagnosisRules: [
    { ruleId: 'pneumonia_clinical', description: 'Clinical diagnosis of pneumonia', criteria: ['Acute cough', 'Fever', 'Focal chest signs', 'Systemic symptoms'], requiredCount: 3, logic: 'or', threshold: 0.6 },
    { ruleId: 'pneumonia_radiologic', description: 'Radiologically confirmed pneumonia', criteria: ['New infiltrate on CXR', 'Consistent symptoms', 'Inflammatory markers elevated'], requiredCount: 2, logic: 'and', threshold: 0.8 },
    { ruleId: 'curb_65', description: 'Severity assessment for CAP', criteria: ['Confusion', 'Urea > 7 mmol/L', 'RR ≥ 30/min', 'BP < 90/60', 'Age ≥ 65'], requiredCount: 2, logic: 'weighted_score', threshold: 0.5 },
  ],
  treatments: [
    { treatmentId: 'amoxicillin', type: 'medication', firstLine: true, evidenceLevel: 'guideline', notes: 'First-line for mild-moderate CAP' },
    { treatmentId: 'doxycycline', type: 'medication', firstLine: true, evidenceLevel: 'guideline', notes: 'Alternative for atypical coverage' },
    { treatmentId: 'ceftriaxone', type: 'medication', firstLine: false, evidenceLevel: 'guideline', notes: 'For moderate-severe CAP' },
    { treatmentId: 'azithromycin', type: 'medication', firstLine: false, evidenceLevel: 'guideline', notes: 'Atypical coverage, add-on for severe' },
    { treatmentId: 'oxygen_therapy', type: 'supportive', firstLine: true, evidenceLevel: 'gold_standard', notes: 'If SpO2 < 92%' },
    { treatmentId: 'iv_fluids', type: 'supportive', firstLine: true, evidenceLevel: 'gold_standard', notes: 'For sepsis or inability to take oral' },
  ],
  monitoring: [
    { parameter: 'Temperature', frequency: '4-6 hourly', target: '< 37.5°C', actionIfAbnormal: 'Re-evaluate antibiotics, consider complications' },
    { parameter: 'Oxygen saturation', frequency: 'Continuous if hypoxic, then 4 hourly', target: '≥ 92%', actionIfAbnormal: 'Increase oxygen, assess for deterioration' },
    { parameter: 'Respiratory rate', frequency: '4 hourly', target: '12-20/min', actionIfAbnormal: 'Assess for deterioration' },
    { parameter: 'Heart rate', frequency: '4 hourly', target: '60-100/min', actionIfAbnormal: 'Assess for sepsis, dehydration' },
    { parameter: 'Blood pressure', frequency: '4-6 hourly', target: '≥ 90/60', actionIfAbnormal: 'IV fluids, assess for sepsis' },
    { parameter: 'CRP/WBC trend', frequency: '48 hourly', target: 'Trending down', actionIfAbnormal: 'Re-evaluate treatment' },
  ],
  disposition: {
    admissionRequired: true,
    icuRequired: false,
    specialtyReferral: 'pulmonology',
    followUpTiming: '1-2 weeks after discharge',
    dischargeCriteria: ['Afebrile 48 hours', 'Stable vital signs', 'Improving symptoms', 'Tolerating oral', 'Safe home environment'],
  },
  patientEducation: [
    'Complete the full course of antibiotics even if you feel better',
    'Return if fever recurs, breathing worsens, or chest pain develops',
    'Smoking cessation is strongly recommended',
    'Annual influenza and pneumococcal vaccination recommended',
  ],
  references: ['IDSA/ATS CAP Guidelines 2019', 'BTS Community Acquired Pneumonia Guideline 2023'],
  evidenceLevel: 'guideline',
  guidelines: ['IDSA/ATS CAP 2019', 'BTS CAP 2023', 'NICE Pneumonia 2022'],
  differentials: ['pulmonary_tuberculosis', 'bronchiectasis', 'lung_cancer', 'pulmonary_embolism', 'heart_failure'],
};

// ── PULMONARY TUBERCULOSIS ────────────────────────────────────
export const PULMONARY_TUBERCULOSIS: DiseaseObject = {
  id: 'pulmonary_tuberculosis',
  name: 'Pulmonary Tuberculosis',
  snomed: '154283005',
  icd10: 'A15.0',
  synonyms: ['TB', 'Pulmonary TB', 'Phthisis', 'Consumption', 'Mycobacterium tuberculosis infection'],
  specialties: ['pulmonology', 'infectious_disease', 'internal_medicine'],
  ageGroups: ['adolescent', 'adult', 'older_adult'],
  emergencyLevel: 'yellow',
  bodySystems: ['respiratory', 'immune'],
  mechanisms: ['infectious', 'inflammatory'],
  phenotypes: [
    { name: 'Primary TB', features: ['fever', 'cough', 'night_sweats', 'weight_loss', 'apical_infiltrates'], prevalence: 0.3, typicalPresentation: 'Gradual onset over weeks' },
    { name: 'Post-primary TB', features: ['cavitary_lesions', 'hemoptysis', 'chronic_cough', 'apical_disease'], prevalence: 0.5, typicalPresentation: 'Reactivation with cavitation' },
    { name: 'Miliary TB', features: ['disseminated_micronodules', 'severe_systemic_symptoms', 'extrapulmonary_involvement'], prevalence: 0.05, typicalPresentation: 'Disseminated disease with severe symptoms' },
    { name: 'TB pleural effusion', features: ['pleural_effusion', 'fever', 'chest_pain', 'exudative_fluid'], prevalence: 0.1, typicalPresentation: 'Unilateral pleural effusion with fever' },
  ],
  etiologies: [
    { agent: 'Mycobacterium tuberculosis', type: 'infectious', frequency: 'common', notes: 'Airborne transmission, slow-growing' },
    { agent: 'Mycobacterium bovis', type: 'infectious', frequency: 'rare', notes: 'Zoonotic transmission' },
  ],
  riskFactors: [
    { factor: 'HIV infection', weight: 5.0, type: 'non_modifiable' },
    { factor: 'Close contact with TB patient', weight: 4.0, type: 'environmental' },
    { factor: 'Immunosuppression', weight: 3.0, type: 'non_modifiable' },
    { factor: 'Malnutrition', weight: 2.0, type: 'modifiable' },
    { factor: 'Diabetes mellitus', weight: 2.0, type: 'non_modifiable' },
    { factor: 'Alcohol use disorder', weight: 1.8, type: 'modifiable' },
    { factor: 'Smoking', weight: 1.5, type: 'modifiable' },
    { factor: 'Crowded living conditions', weight: 2.0, type: 'environmental' },
    { factor: 'Health care worker', weight: 1.5, type: 'environmental' },
    { factor: 'Endemic region', weight: 2.0, type: 'environmental' },
  ],
  predispositions: ['HIV/AIDS', 'Silicosis', 'Chronic renal failure', 'Post-transplant', 'TNF-alpha inhibitor use', 'Gastrectomy', 'Jejunoileal bypass'],
  naturalHistory: 'Insidious onset over weeks to months. Primary infection may be asymptomatic or cause mild illness. Post-primary (reactivation) TB causes progressive apical disease with cavitation if untreated.',
  pathophysiology: [
    { step: 1, event: 'Inhalation of droplet nuclei containing M. tuberculosis', mechanism: 'infectious', detail: 'Organisms reach alveoli' },
    { step: 2, event: 'Alveolar macrophage phagocytosis', mechanism: 'inflammatory', detail: 'Macrophages ingest but cannot kill organisms' },
    { step: 3, event: 'Granuloma formation with caseous necrosis', mechanism: 'inflammatory', detail: 'Macrophages, lymphocytes, and giant cells form granulomas' },
    { step: 4, event: 'Ghon focus and Ranke complex formation', mechanism: 'infectious', detail: 'Primary complex in mid-lung zones' },
    { step: 5, event: 'Reactivation with cavitation', mechanism: 'infectious', detail: 'Apical cavitary lesions in post-primary TB' },
    { step: 6, event: 'Hematogenous dissemination in miliary TB', mechanism: 'infectious', detail: 'Widespread micronodular disease' },
  ],
  complications: [
    { complication: 'Hemoptysis', frequency: 'common', diseaseId: null, management: 'Bronchial artery embolization, surgery if massive' },
    { complication: 'Respiratory failure', frequency: 'uncommon', diseaseId: null, management: 'Ventilatory support' },
    { complication: 'Miliary TB', frequency: 'uncommon', diseaseId: null, management: 'Full anti-TB therapy, corticosteroids for severe' },
    { complication: 'TB meningitis', frequency: 'rare', diseaseId: null, management: 'Anti-TB therapy, corticosteroids' },
    { complication: 'Multidrug-resistant TB', frequency: 'uncommon', diseaseId: null, management: 'Second-line anti-TB agents, specialist referral' },
    { complication: 'Bronchiectasis', frequency: 'uncommon', diseaseId: 'bronchiectasis', management: 'Post-TB bronchiectasis management' },
  ],
  symptoms: [
    { symptomId: 'cough', frequency: 'always', typicalCharacter: 'Chronic > 3 weeks, initially dry then productive', typicalTimeline: 'Weeks to months', discriminatingValue: 0.9 },
    { symptomId: 'fever', frequency: 'always', typicalCharacter: 'Low-grade, evening rise', typicalTimeline: 'Persistent, weeks to months', discriminatingValue: 0.7 },
    { symptomId: 'night_sweats', frequency: 'common', typicalCharacter: 'Profuse, drenching', typicalTimeline: 'Nocturnal, weeks', discriminatingValue: 0.8 },
    { symptomId: 'weight_loss', frequency: 'common', typicalCharacter: 'Significant, progressive', typicalTimeline: 'Weeks to months', discriminatingValue: 0.7 },
    { symptomId: 'hemoptysis', frequency: 'uncommon', typicalCharacter: 'Blood-streaked sputum to massive hemoptysis', typicalTimeline: 'May occur at any stage', discriminatingValue: 0.6 },
    { symptomId: 'chest_pain', frequency: 'uncommon', typicalCharacter: 'Dull or pleuritic', typicalTimeline: 'With pleural involvement', discriminatingValue: 0.3 },
  ],
  signs: [
    { signId: 'apical_crackles', frequency: 'common', description: 'Fine crackles at lung apices' },
    { signId: 'wasting', frequency: 'common', description: 'Visible weight loss and muscle wasting' },
    { signId: 'lymphadenopathy', frequency: 'uncommon', description: 'Cervical lymphadenopathy (scrofula)' },
    { signId: 'fever_temperature', frequency: 'common', description: 'Low-grade evening pyrexia' },
    { signId: 'dull_percussion', frequency: 'uncommon', description: 'Over apical cavitation' },
  ],
  investigations: [
    { investigationId: 'chest_xray', purpose: 'Detect pulmonary involvement', timing: 'initial', requiredForDiagnosis: true, expectedResult: 'Apical infiltrates, cavitation, or miliary pattern', sensitivity: 0.85, specificity: 0.75 },
    { investigationId: 'sputum_afb', purpose: 'Detect acid-fast bacilli', timing: 'initial', requiredForDiagnosis: true, expectedResult: 'AFB seen on microscopy', sensitivity: 0.6, specificity: 0.98 },
    { investigationId: 'genexpert', purpose: 'Detect TB DNA and rifampicin resistance', timing: 'initial', requiredForDiagnosis: true, expectedResult: 'M. tuberculosis detected', sensitivity: 0.95, specificity: 0.99 },
    { investigationId: 'tb_culture', purpose: 'Confirm diagnosis and drug susceptibility', timing: 'confirmatory', requiredForDiagnosis: true, expectedResult: 'M. tuberculosis growth', sensitivity: 0.85, specificity: 0.99 },
    { investigationId: 'tst', purpose: 'Detect TB infection', timing: 'initial', requiredForDiagnosis: false, expectedResult: 'Induration ≥ 10mm', sensitivity: 0.8, specificity: 0.7 },
    { investigationId: 'igra', purpose: 'Detect TB infection', timing: 'initial', requiredForDiagnosis: false, expectedResult: 'Positive interferon-gamma release', sensitivity: 0.85, specificity: 0.85 },
    { investigationId: 'ct_chest', purpose: 'Detailed lung evaluation', timing: 'confirmatory', requiredForDiagnosis: false, expectedResult: 'Apical cavitation, tree-in-bud, miliary nodules', sensitivity: 0.95, specificity: 0.85 },
  ],
  diagnosisRules: [
    { ruleId: 'tb_clinical', description: 'Presumptive TB (clinical)', criteria: ['Cough > 3 weeks', 'Fever', 'Night sweats', 'Weight loss'], requiredCount: 2, logic: 'or', threshold: 0.5 },
    { ruleId: 'tb_bacteriologic', description: 'Confirmed TB', criteria: ['AFB positive', 'GeneXpert positive', 'Culture positive'], requiredCount: 1, logic: 'or', threshold: 0.95 },
    { ruleId: 'tb_radiologic', description: 'Radiologic TB', criteria: ['CXR consistent with TB', 'Symptoms', 'Exposure risk'], requiredCount: 2, logic: 'and', threshold: 0.7 },
  ],
  treatments: [
    { treatmentId: 'rifampicin', type: 'medication', firstLine: true, evidenceLevel: 'gold_standard', notes: 'Cornerstone of TB therapy, 6 months' },
    { treatmentId: 'isoniazid', type: 'medication', firstLine: true, evidenceLevel: 'gold_standard', notes: 'With pyridoxine supplementation' },
    { treatmentId: 'pyrazinamide', type: 'medication', firstLine: true, evidenceLevel: 'gold_standard', notes: 'First 2 months' },
    { treatmentId: 'ethambutol', type: 'medication', firstLine: true, evidenceLevel: 'gold_standard', notes: 'First 2 months' },
    { treatmentId: 'pyridoxine', type: 'medication', firstLine: true, evidenceLevel: 'gold_standard', notes: 'Prevent isoniazid neuropathy' },
  ],
  monitoring: [
    { parameter: 'Sputum AFB', frequency: 'Monthly until conversion', target: 'Negative', actionIfAbnormal: 'Assess adherence, consider drug resistance' },
    { parameter: 'Chest X-ray', frequency: 'At 2 months and end of treatment', target: 'Improvement', actionIfAbnormal: 'Assess for complications' },
    { parameter: 'LFT', frequency: 'Monthly', target: 'Normal', actionIfAbnormal: 'Adjust hepatotoxic drugs' },
    { parameter: 'Weight', frequency: 'Monthly', target: 'Stable or gaining', actionIfAbnormal: 'Assess for treatment failure or malnutrition' },
  ],
  disposition: {
    admissionRequired: false,
    icuRequired: false,
    specialtyReferral: 'pulmonology',
    followUpTiming: 'Monthly until sputum conversion, then at 6 months',
    dischargeCriteria: ['Clinically stable', 'Treatment initiated', 'Adherence plan established', 'Public health notification completed'],
  },
  patientEducation: [
    'Complete 6 months of treatment without interruption',
    'Take medications daily at the same time',
    'Report jaundice, vision changes, or rash immediately',
    'Cover mouth when coughing, open windows for ventilation',
    'Household contacts should be screened',
  ],
  references: ['WHO TB Treatment Guidelines 2022', 'ATS/IDSA TB Guidelines'],
  evidenceLevel: 'gold_standard',
  guidelines: ['WHO TB 2022', 'ATS/IDSA TB 2020', 'National TB Program Guidelines'],
  differentials: ['pneumonia', 'bronchiectasis', 'lung_cancer', 'sarcoidosis', 'fungal_pneumonia'],
};

// ── ASTHMA ────────────────────────────────────────────────────
export const ASTHMA: DiseaseObject = {
  id: 'asthma',
  name: 'Asthma',
  snomed: '195967001',
  icd10: 'J45.9',
  synonyms: ['Bronchial asthma', 'Reactive airway disease', 'Wheezy bronchitis'],
  specialties: ['pulmonology', 'pediatrics', 'internal_medicine', 'emergency_medicine', 'family_medicine'],
  ageGroups: ['infant', 'child', 'adolescent', 'adult', 'older_adult'],
  emergencyLevel: 'yellow',
  bodySystems: ['respiratory', 'immune'],
  mechanisms: ['obstructive', 'inflammatory', 'allergic'],
  phenotypes: [
    { name: 'Allergic asthma', features: ['early_onset', 'atopy', 'allergen_triggers', 'eosinophilia'], prevalence: 0.6, typicalPresentation: 'Childhood onset with allergic rhinitis' },
    { name: 'Non-allergic asthma', features: ['adult_onset', 'no_atopy', 'exercise_triggers', 'viral_triggers'], prevalence: 0.2, typicalPresentation: 'Adult onset without allergies' },
    { name: 'Exercise-induced asthma', features: ['bronchoconstriction_with_exercise', 'self_limiting', 'responds_to_bronchodilator'], prevalence: 0.1, typicalPresentation: 'Symptoms only during or after exercise' },
    { name: 'Aspirin-exacerbated asthma', features: ['nsid_sensitivity', 'nasal_polyps', 'severe_persistent'], prevalence: 0.05, typicalPresentation: 'Asthma worsened by NSAIDs' },
    { name: 'Occupational asthma', features: ['work_related_symptoms', 'improves_on_weekends_holidays', 'specific_sensitizers'], prevalence: 0.05, typicalPresentation: 'Symptoms related to workplace exposure' },
  ],
  etiologies: [
    { agent: 'Allergen exposure (dust mites, pollen, mold, pet dander)', type: 'environmental', frequency: 'common', notes: 'Most common trigger' },
    { agent: 'Viral respiratory infections', type: 'infectious', frequency: 'common', notes: 'RSV, rhinovirus common triggers' },
    { agent: 'Exercise', type: 'environmental', frequency: 'common', notes: 'Exercise-induced bronchoconstriction' },
    { agent: 'Air pollutants', type: 'environmental', frequency: 'uncommon', notes: 'Smoke, ozone, industrial pollutants' },
    { agent: 'Occupational sensitizers', type: 'environmental', frequency: 'uncommon', notes: 'Isocyanates, flour, latex' },
    { agent: 'Medications', type: 'iatrogenic', frequency: 'uncommon', notes: 'NSAIDs, beta-blockers' },
  ],
  riskFactors: [
    { factor: 'Family history of asthma or atopy', weight: 3.0, type: 'genetic' },
    { factor: 'Personal history of atopy (eczema, allergic rhinitis)', weight: 2.5, type: 'non_modifiable' },
    { factor: 'Parental smoking', weight: 2.0, type: 'environmental' },
    { factor: 'Low birth weight', weight: 1.5, type: 'non_modifiable' },
    { factor: 'Obesity', weight: 1.5, type: 'modifiable' },
    { factor: 'Occupational exposure', weight: 2.0, type: 'environmental' },
  ],
  predispositions: ['Atopic dermatitis', 'Allergic rhinitis', 'Eczema', 'Family history of asthma', 'Prematurity'],
  naturalHistory: 'Variable. Often begins in childhood with episodic wheezing. May improve with age or persist into adulthood. Exacerbations triggered by infections, allergens, or irritants.',
  pathophysiology: [
    { step: 1, event: 'Airway inflammation (eosinophils, mast cells, Th2 lymphocytes)', mechanism: 'inflammatory', detail: 'Chronic inflammatory process' },
    { step: 2, event: 'Bronchial hyperresponsiveness', mechanism: 'obstructive', detail: 'Airways narrow excessively to triggers' },
    { step: 3, event: 'Bronchoconstriction and airflow obstruction', mechanism: 'obstructive', detail: 'Reversible airflow limitation' },
    { step: 4, event: 'Mucus hypersecretion and airway edema', mechanism: 'obstructive', detail: 'Further narrows airways' },
    { step: 5, event: 'Airway remodeling in chronic untreated asthma', mechanism: 'obstructive', detail: 'Irreversible structural changes' },
  ],
  complications: [
    { complication: 'Acute severe asthma exacerbation', frequency: 'common', diseaseId: null, management: 'Bronchodilators, corticosteroids, oxygen, ICU if severe' },
    { complication: 'Status asthmaticus', frequency: 'uncommon', diseaseId: null, management: 'ICU, intubation, ventilation' },
    { complication: 'Pneumothorax', frequency: 'rare', diseaseId: null, management: 'Chest tube drainage' },
    { complication: 'Airway remodeling', frequency: 'uncommon', diseaseId: null, management: 'Prevent with controller therapy' },
  ],
  symptoms: [
    { symptomId: 'dyspnea', frequency: 'always', typicalCharacter: 'Episodic, with wheezing', typicalTimeline: 'Acute exacerbations, symptom-free between', discriminatingValue: 0.9 },
    { symptomId: 'wheeze', frequency: 'always', typicalCharacter: 'Expiratory, high-pitched', typicalTimeline: 'During exacerbations', discriminatingValue: 0.95 },
    { symptomId: 'cough', frequency: 'common', typicalCharacter: 'Non-productive, worse at night or early morning', typicalTimeline: 'Especially nocturnal', discriminatingValue: 0.7 },
    { symptomId: 'chest_tightness', frequency: 'common', typicalCharacter: 'Substernal tightness', typicalTimeline: 'During exacerbations', discriminatingValue: 0.6 },
  ],
  signs: [
    { signId: 'expiratory_wheeze', frequency: 'always', description: 'High-pitched expiratory wheeze on auscultation' },
    { signId: 'prolonged_expiration', frequency: 'common', description: 'Prolonged expiratory phase' },
    { signId: 'accessory_muscle_use', frequency: 'common', description: 'Use of sternocleidomastoid and intercostals during exacerbation' },
    { signId: 'tachypnea', frequency: 'common', description: 'Increased respiratory rate' },
    { signId: 'tachycardia', frequency: 'common', description: 'Increased heart rate during exacerbation' },
    { signId: 'hyperinflation', frequency: 'uncommon', description: 'Barrel chest in chronic severe asthma' },
    { signId: 'pulsus_paradoxus', frequency: 'uncommon', description: 'Drop in BP during inspiration in severe exacerbation' },
  ],
  investigations: [
    { investigationId: 'spirometry', purpose: 'Demonstrate reversible airflow obstruction', timing: 'initial', requiredForDiagnosis: true, expectedResult: 'FEV1/FVC < 0.7, FEV1 improves > 12% after bronchodilator', sensitivity: 0.85, specificity: 0.9 },
    { investigationId: 'peak_flow', purpose: 'Monitor variability', timing: 'initial', requiredForDiagnosis: false, expectedResult: 'Diurnal variability > 20%', sensitivity: 0.7, specificity: 0.8 },
    { investigationId: 'cbc_eosinophils', purpose: 'Assess eosinophilic inflammation', timing: 'initial', requiredForDiagnosis: false, expectedResult: 'Eosinophilia > 400 cells/µL', sensitivity: 0.5, specificity: 0.7 },
    { investigationId: 'ige', purpose: 'Assess atopic status', timing: 'initial', requiredForDiagnosis: false, expectedResult: 'Elevated total IgE', sensitivity: 0.6, specificity: 0.65 },
    { investigationId: 'allergy_skin_test', purpose: 'Identify allergens', timing: 'initial', requiredForDiagnosis: false, expectedResult: 'Positive to relevant allergens', sensitivity: 0.8, specificity: 0.75 },
    { investigationId: 'chest_xray', purpose: 'Exclude other causes', timing: 'initial', requiredForDiagnosis: false, expectedResult: 'Normal or hyperinflation', sensitivity: 0.2, specificity: 0.9 },
  ],
  diagnosisRules: [
    { ruleId: 'asthma_clinical', description: 'Clinical diagnosis of asthma', criteria: ['Episodic wheezing', 'Reversible with bronchodilator', 'Nocturnal symptoms', 'Trigger-related'], requiredCount: 2, logic: 'or', threshold: 0.6 },
    { ruleId: 'asthma_spirometry', description: 'Spirometry-confirmed asthma', criteria: ['FEV1/FVC < 0.7', 'Bronchodilator reversibility > 12%', 'Consistent symptoms'], requiredCount: 2, logic: 'and', threshold: 0.85 },
  ],
  treatments: [
    { treatmentId: 'salbutamol_inhaler', type: 'medication', firstLine: true, evidenceLevel: 'gold_standard', notes: 'Short-acting beta agonist for acute symptoms' },
    { treatmentId: 'budesonide_inhaler', type: 'medication', firstLine: true, evidenceLevel: 'gold_standard', notes: 'Inhaled corticosteroid for controller therapy' },
    { treatmentId: 'salmeterol_inhaler', type: 'medication', firstLine: false, evidenceLevel: 'guideline', notes: 'Long-acting beta agonist, add-on therapy' },
    { treatmentId: 'montelukast', type: 'medication', firstLine: false, evidenceLevel: 'guideline', notes: 'Leukotriene receptor antagonist, alternative controller' },
    { treatmentId: 'prednisolone_oral', type: 'medication', firstLine: false, evidenceLevel: 'gold_standard', notes: 'For acute severe exacerbations' },
    { treatmentId: 'oxygen_therapy', type: 'supportive', firstLine: true, evidenceLevel: 'gold_standard', notes: 'If SpO2 < 92% during exacerbation' },
  ],
  monitoring: [
    { parameter: 'Symptom control (ACT score)', frequency: 'Each visit', target: 'ACT ≥ 20 (well-controlled)', actionIfAbnormal: 'Step up therapy' },
    { parameter: 'Peak flow', frequency: 'Daily if persistent', target: '≥ 80% personal best', actionIfAbnormal: 'Increase controller, consider exacerbation' },
    { parameter: 'Inhaler technique', frequency: 'Each visit', target: 'Correct technique', actionIfAbnormal: 'Re-educate' },
    { parameter: 'Exacerbation frequency', frequency: 'Each visit', target: '< 2/year', actionIfAbnormal: 'Step up controller therapy' },
  ],
  disposition: {
    admissionRequired: false,
    icuRequired: false,
    specialtyReferral: 'pulmonology',
    followUpTiming: '1-3 months for stable, 1-2 weeks after exacerbation',
    dischargeCriteria: ['Stable symptoms', 'Adequate inhaler technique', 'Action plan provided', 'Follow-up arranged'],
  },
  patientEducation: [
    'Use preventer inhaler daily as prescribed',
    'Keep reliever inhaler available at all times',
    'Avoid known triggers',
    'Have a written asthma action plan',
    'Seek emergency care if reliever not working',
  ],
  references: ['GINA Global Strategy for Asthma Management 2023', 'BTS/SIGN Asthma Guideline'],
  evidenceLevel: 'gold_standard',
  guidelines: ['GINA 2023', 'BTS/SIGN 2022', 'NAEPP EPR-4'],
  differentials: ['copd', 'bronchiectasis', 'vocal_cord_dysfunction', 'gerd', 'heart_failure', 'foreign_body_aspiration'],
};

// ── DISEASE REGISTRY ──────────────────────────────────────────
export const DISEASE_REGISTRY: Record<string, DiseaseObject> = {
  pneumonia: PNEUMONIA,
  pulmonary_tuberculosis: PULMONARY_TUBERCULOSIS,
  asthma: ASTHMA,
};

export function getDisease(id: string): DiseaseObject | undefined {
  return DISEASE_REGISTRY[id];
}

export function getDiseasesByMechanism(mechanism: string): DiseaseObject[] {
  return Object.values(DISEASE_REGISTRY).filter(d => d.mechanisms.includes(mechanism as any));
}

export function getDiseasesBySymptom(symptomId: string): DiseaseObject[] {
  return Object.values(DISEASE_REGISTRY).filter(d =>
    d.symptoms.some(s => s.symptomId === symptomId),
  );
}

export function getDiseasesBySign(signId: string): DiseaseObject[] {
  return Object.values(DISEASE_REGISTRY).filter(d =>
    d.signs.some(s => s.signId === signId),
  );
}
