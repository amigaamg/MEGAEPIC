// ═══════════════════════════════════════════════════════════════════════════════
// lib/amexan/departments/paed.ts
// AMEXAN Paediatrics Disease Intelligence Library
// 13 subspecialties — each disease is a complete DiseaseIntelligence JSON
// ═══════════════════════════════════════════════════════════════════════════════

import type { DiseaseIntelligence } from '../core';

export const PAED_DISEASES: DiseaseIntelligence[] = [

  // ─── Paediatric Respiratory ─────────────────────────────────────────────────
  {
    id: 'paediatric-pneumonia',
    name: 'Paediatric Pneumonia',
    specialtyId: 'PAED', subspecialtyId: 'paediatric-respiratory', icd10: 'J15.9',
    epidemiology: {
      incidence: '150 million cases/year globally; 1 in 5 child deaths', prevalence: 'Most common infectious cause of death in children <5',
      ageDistribution: 'Peak 2-59 months', genderPredilection: 'Slight male predominance',
      geographicDistribution: 'Highest in Sub-Saharan Africa and South Asia', seasonality: 'Year-round, peaks in rainy season'
    },
    symptomWeights: [
      { symptom: 'cough', weight: 9, prevalence: 95, category: 'major' },
      { symptom: 'fever', weight: 7, prevalence: 85, category: 'major' },
      { symptom: 'fast breathing', weight: 9, prevalence: 80, category: 'major' },
      { symptom: 'chest indrawing', weight: 8, prevalence: 60, category: 'major' },
      { symptom: 'nasal flaring', weight: 7, prevalence: 50, category: 'major' },
      { symptom: 'grunting', weight: 8, prevalence: 40, category: 'red_flag' },
      { symptom: 'cyanosis', weight: 9, prevalence: 20, category: 'red_flag' },
      { symptom: 'poor feeding', weight: 6, prevalence: 65, category: 'minor' },
      { symptom: 'irritability', weight: 4, prevalence: 50, category: 'minor' },
      { symptom: 'vomiting', weight: 3, prevalence: 30, category: 'minor' },
    ],
    riskFactors: [
      { factor: 'Malnutrition', weight: 3.5, prevalence: 30 },
      { factor: 'HIV exposure/infection', weight: 4.0, prevalence: 10 },
      { factor: 'Indoor air pollution', weight: 2.5, prevalence: 40 },
      { factor: 'Not breastfed', weight: 2.8, prevalence: 25 },
      { factor: 'Low birth weight', weight: 2.8, prevalence: 15 },
      { factor: 'Incomplete immunization', weight: 3.0, prevalence: 30 },
      { factor: 'Overcrowding', weight: 2.0, prevalence: 50 },
    ],
    differentials: [
      { disease: 'Severe Pneumonia', likelihood: 50, distinguishingFeatures: ['Chest indrawing', 'General danger signs'] },
      { disease: 'Bronchiolitis', likelihood: 25, distinguishingFeatures: ['Wheeze', 'Age <12 months', 'RSV season'] },
      { disease: 'Asthma', likelihood: 10, distinguishingFeatures: ['Recurrent wheeze', 'Personal/family history', 'Response to bronchodilators'] },
      { disease: 'Tuberculosis', likelihood: 8, distinguishingFeatures: ['Chronic cough >2 weeks', 'Night sweats', 'Weight loss', 'TB contact'] },
      { disease: 'Foreign Body Aspiration', likelihood: 5, distinguishingFeatures: ['Sudden onset', 'Choking episode', 'Unilateral signs'] },
      { disease: 'Heart Failure', likelihood: 2, distinguishingFeatures: ['Feeding difficulty', 'Tachycardia', 'Hepatomegaly', 'Murmur'] },
    ],
    investigations: [
      { test: 'Chest X-ray', purpose: 'Confirm pneumonia, identify complications (effusion, abscess)', timing: 'routine', sensitivity: 85, specificity: 90, positiveResult: 'Consolidation, air bronchogram', negativeResult: 'Does not exclude early pneumonia' },
      { test: 'CBC + Differential', purpose: 'Assess severity, WBC count and differential', timing: 'routine', positiveResult: 'Leukocytosis with neutrophilia', negativeResult: 'Normal WBC does not exclude viral pneumonia' },
      { test: 'CRP', purpose: 'Assess inflammation severity', timing: 'routine', positiveResult: 'Elevated (>40 mg/L suggests bacterial)', negativeResult: 'Low CRP suggests viral' },
      { test: 'Blood Culture', purpose: 'Identify bacterial pathogen', timing: 'urgent', sensitivity: 30, specificity: 95, positiveResult: 'Growth of pathogen', negativeResult: 'Negative in 70% of bacterial pneumonia' },
      { test: 'Pulse Oximetry', purpose: 'Assess severity and oxygenation', timing: 'emergency', positiveResult: 'SpO2 <92% indicates severe pneumonia', negativeResult: 'SpO2 >=92%: non-severe' },
      { test: 'HIV Test', purpose: 'Routine screening in high-prevalence areas', timing: 'routine', positiveResult: 'HIV+', negativeResult: 'HIV-' },
    ],
    imaging: [
      { modality: 'Chest X-ray (AP)', indication: 'All suspected pneumonia', findings: 'Lobar consolidation, interstitial infiltrates, air bronchograms, pleural effusion. Right upper lobe most common (<5 yrs). LLL in older children.', sensitivity: 85, specificity: 90 },
    ],
    severityCriteria: [
      { criterion: 'Fast breathing', mild: 'Absent', moderate: 'Present', severe: 'Present (age-specific threshold)', critical: 'Present with exhaustion' },
      { criterion: 'Chest indrawing', mild: 'Absent', moderate: 'Absent', severe: 'Present', critical: 'Present with deep breathing' },
      { criterion: 'SpO2', mild: '≥95%', moderate: '92-94%', severe: '<92%', critical: '<85% with cyanosis' },
      { criterion: 'Feeding', mild: 'Normal', moderate: 'Reduced', severe: 'Unable to feed', critical: 'IV fluids only' },
      { criterion: 'Consciousness', mild: 'Alert', moderate: 'Irritable', severe: 'Lethargic', critical: 'Unconscious/convulsing' },
      { criterion: 'General danger signs', mild: 'None', moderate: 'None', severe: 'Any present', critical: 'Multiple present' },
    ],
    diagnosticCriteria: [
      { name: 'WHO IMCI Pneumonia Classification', type: 'required', description: 'Cough + fast breathing = pneumonia. Cough + chest indrawing = severe pneumonia. Cough + any general danger sign = very severe disease.' },
    ],
    treatmentGuidelines: [
      {
        name: 'WHO IMCI Pneumonia Treatment', source: 'WHO Pocketbook of Hospital Care for Children', year: 2023,
        firstLine: [
          { drug: 'Amoxicillin', dose: '40-45 mg/kg/day PO in 2-3 divided doses', route: 'PO', frequency: '8-12 hourly', duration: '5 days', evidenceLevel: 'A', pediatricDose: '40-45 mg/kg/day' },
        ],
        stepProtocol: [
          { step: 1, therapy: 'Non-severe pneumonia (cough + fast breathing, no chest indrawing)', details: 'Amoxicillin PO 40-45 mg/kg/day x 5 days. Salbutamol if wheeze.', duration: '5 days', monitoring: ['Respiratory rate', 'SpO2', 'Temperature', 'Feeding'] },
          { step: 2, therapy: 'Severe pneumonia (cough + chest indrawing)', details: 'Benzylpenicillin IV 50,000 IU/kg q6h + Gentamicin 7.5 mg/kg IV once daily. O2 if SpO2 <92%.', duration: '5-7 days', monitoring: ['Respiratory rate q4h', 'SpO2 continuous', 'Temp q6h', 'Chest X-ray at 48h if no improvement'], alternatives: ['Ampicillin 50 mg/kg IM/IV q6h + Gentamicin'] },
          { step: 3, therapy: 'Very severe pneumonia (cough + any danger sign)', details: 'Ceftriaxone 50 mg/kg IV once daily + O2 therapy. Consider PICU admission.', duration: '7-10 days', monitoring: ['Continuous pulse oximetry', 'Hourly vitals', 'Strict fluid balance', 'Chest X-ray at 48-72h'], alternatives: ['Ampicillin 50 mg/kg q6h + Gentamicin + Chloramphenicol'] },
          { step: 4, therapy: 'Failure at 48h (no improvement/worsening)', details: 'Escalate to Ceftriaxone 80 mg/kg/day IV + consider complications (effusion, empyema, abscess). Chest X-ray + ultrasound.', duration: '10-14 days', monitoring: ['Clinical reassessment', 'Repeat CXR', 'Ultrasound if effusion suspected'], alternatives: ['Cloxacillin if staphylococcal suspected'] },
        ],
        duration: '5-14 days depending on severity',
        monitoring: ['Respiratory rate', 'Oxygen saturation', 'Temperature', 'Feeding ability', 'Chest X-ray if not improving', 'CRP trends'],
      },
    ],
    admissionCriteria: [
      { indications: ['Severe pneumonia (chest indrawing)', 'SpO2 <92%', 'Unable to feed', 'General danger sign present', 'Age <2 months with any fast breathing'], level: 'ward', parameters: [{ param: 'SpO2', threshold: '<92%' }, { param: 'RR', threshold: 'Age-specific threshold' }, { param: 'Age', threshold: '<2 months' }] },
      { indications: ['Persistent SpO2 <85% on O2', 'Apnoea', 'Inabilty to maintain airway', 'Shock', 'Recurrent seizures'], level: 'ICU', parameters: [{ param: 'SpO2', threshold: '<85% on O2' }, { param: 'GCS', threshold: '<12' }, { param: 'pH', threshold: '<7.2' }] },
    ],
    dischargeCriteria: {
      clinical: ['Afebrile >48h', 'SpO2 ≥94% on room air', 'Feeding adequately', 'Respiratory rate normal for age', 'No chest indrawing'],
      lab: ['CRP trending down (if initially elevated)', 'Blood culture negative (if initially positive)'],
      social: ['Caregiver able to administer oral medication', 'Follow-up arranged', 'Transport available if worsens', 'Home conditions adequate'],
    },
    complications: [
      { name: 'Pleural Effusion/Empyema', incidence: 8, timeCourse: '48-72h after onset', management: 'Ultrasound + diagnostic tap. Chest drain if empyema. IV antibiotics 2-4 weeks.', redFlags: ['Persistent fever despite 48h antibiotics', 'Dull percussion', 'Decreased breath sounds'] },
      { name: 'Lung Abscess', incidence: 3, timeCourse: '5-7 days', management: 'Prolonged IV antibiotics (4-6 weeks). CT-guided drainage if needed.', redFlags: ['Persistent high fever', 'Toxic appearance', 'Foul-smelling sputum'] },
      { name: 'Pneumothorax', incidence: 2, timeCourse: 'Variable', management: 'Chest drain insertion. Underwater seal drainage.', redFlags: ['Sudden deterioration', 'Cyanosis', 'Tracheal deviation'] },
      { name: 'Respiratory Failure', incidence: 5, timeCourse: '24-48h', management: 'CPAP or mechanical ventilation. PICU admission.', redFlags: ['SpO2 <85% despite O2', 'Apnoea', 'Exhaustion'] },
      { name: 'Sepsis/Septic Shock', incidence: 3, timeCourse: '12-24h', management: 'IV fluids, inotropes, broad-spectrum antibiotics. PICU.', redFlags: ['Hypotension', 'Altered consciousness', 'Cold peripheries'] },
    ],
    followUp: { interval: '2 weeks', duration: '2 months', tests: ['Chest X-ray at 4-6 weeks if severe/complicated'], specialistReview: true, specialistTiming: 'If recurrent (>2 episodes/year) or unresolved at 6 weeks' },
    prognosis: 'Good with appropriate antibiotics. Mortality <1% in non-severe, 5-10% in severe, 20% in very severe. Worse with HIV, malnutrition, age <2 months.',
    emergencyFlags: [
      { condition: 'SpO2 <85% despite 15 min of O2', action: 'Urgent PICU referral. Consider CPAP. Prepare for intubation.', timeCritical: 'Immediate' },
      { condition: 'Apnoea', action: 'Stimulate, bag-mask-ventilate, call arrest team', timeCritical: 'Immediate' },
      { condition: 'Severe respiratory distress with exhaustion', action: 'Prepare for intubation and mechanical ventilation', timeCritical: '<30 minutes' },
      { condition: 'Cyanosis', action: 'High-flow O2, urgent clinical review, check for pneumothorax', timeCritical: '<5 minutes' },
    ],
    pediatricAdjustments: [
      { parameter: 'Respiratory rate thresholds', adjustment: 'Age-specific: 0-2mo: >60; 2-12mo: >50; 12-60mo: >40; >60mo: >30', ageRange: 'All' },
      { parameter: 'Dosing', adjustment: 'Weight-based for all medications. Use WHO ETAT guidelines for emergency dosing.', ageRange: 'All' },
      { parameter: 'Chest X-ray findings', adjustment: 'Right upper lobe more common in children <5. LLL in older children.', ageRange: '<5 years' },
    ],
    pregnancyAdjustments: [],
    aiReasoning: {
      presentationPattern: ['Cough + fever + fast breathing in child <5 years = pneumonia until proven otherwise', 'Chest indrawing = severe pneumonia (WHO classification)', 'Any general danger sign in context of respiratory symptoms = very severe disease'],
      keyFeatures: ['Age-specific tachypnoea thresholds', 'Presence/absence of chest indrawing', 'SpO2', 'Feeding ability', 'General danger signs (lethargy, convulsions, vomiting everything, unable to feed)'],
      discriminatingQuestions: ['Is there chest indrawing?', 'Is the child able to feed?', 'Has the child had convulsions?', 'Is there stridor? (suggests croup or upper airway)', 'Is there wheeze? (suggests bronchiolitis or asthma)'],
      diagnosticAlgorithm: ['1. Check for cough/difficulty breathing', '2. Count respiratory rate (compare to age threshold)', '3. Check for chest indrawing', '4. Check for general danger signs', '5. Check SpO2', '6. Auscultate chest', '7. Classify per WHO IMCI', '8. Check for wheeze ± treat', '9. Check for stridor ± refer', '10. CXR if available'],
    },
    clinicalNoteTemplate: {
      sections: ['Patient biodata', 'Informant & reliability', 'Presenting complaint', 'HPI', 'Feeding & hydration', 'Exam findings', 'Severity classification', 'Differentials', 'Investigations', 'Treatment plan'],
      consultantWording: 'This child presents with an acute respiratory illness. On IMCI classification, this is [non-severe/severe/very severe] pneumonia based on [fast breathing/chest indrawing/danger signs]. The child is [able/unable] to feed and maintaining [adequate/marginal/poor] oxygenation.',
      exampleNote: 'A 2-year-old male presents with 3-day history of cough and fever. Respiratory rate 48/min (fast breathing for age), no chest indrawing, SpO2 96%. Feeding reduced but able. Diagnosis: Non-severe pneumonia. Plan: Amoxicillin 45 mg/kg/day PO x 5 days, advice on return precautions, follow-up in 2 weeks.',
    },
  },
];

// ─── Bronchiolitis ──────────────────────────────────────────────────────────────
export const bronchiolitis: DiseaseIntelligence = {
  id: 'bronchiolitis', name: 'Bronchiolitis', specialtyId: 'PAED', subspecialtyId: 'paediatric-respiratory', icd10: 'J21.9',
  epidemiology: {
    incidence: '150 million cases/year; most common LRTI in infants <12 months', prevalence: 'Most common cause of hospitalization in infants <6 months',
    ageDistribution: 'Peak 2-6 months; rare after 12 months', genderPredilection: 'Male > Female (1.5:1)',
    geographicDistribution: 'Worldwide; more severe in low-resource settings', seasonality: 'Winter/rainy season peaks (RSV)'
  },
  symptomWeights: [
    { symptom: 'coryza', weight: 5, prevalence: 90, category: 'minor' },
    { symptom: 'cough', weight: 8, prevalence: 95, category: 'major' },
    { symptom: 'wheeze', weight: 8, prevalence: 80, category: 'major' },
    { symptom: 'fast breathing', weight: 8, prevalence: 75, category: 'major' },
    { symptom: 'chest indrawing', weight: 7, prevalence: 65, category: 'major' },
    { symptom: 'nasal flaring', weight: 7, prevalence: 45, category: 'major' },
    { symptom: 'poor feeding', weight: 6, prevalence: 70, category: 'major' },
    { symptom: 'fever', weight: 4, prevalence: 50, category: 'minor' },
    { symptom: 'apnoea', weight: 9, prevalence: 10, category: 'red_flag' },
    { symptom: 'cyanosis', weight: 9, prevalence: 8, category: 'red_flag' },
  ],
  riskFactors: [
    { factor: 'Age <3 months', weight: 4.0, prevalence: 25 },
    { factor: 'Prematurity (<37 weeks)', weight: 3.5, prevalence: 15 },
    { factor: 'CHD or CLD', weight: 3.5, prevalence: 5 },
    { factor: 'Not breastfed', weight: 2.5, prevalence: 25 },
    { factor: 'Overcrowding', weight: 2.0, prevalence: 50 },
    { factor: 'Passive smoking', weight: 2.5, prevalence: 30 },
    { factor: 'Low birth weight', weight: 2.8, prevalence: 15 },
  ],
  differentials: [
    { disease: 'Pneumonia', likelihood: 25, distinguishingFeatures: ['Fever >39°C', 'Focal signs on auscultation', 'Consolidation on CXR'] },
    { disease: 'Asthma (first episode)', likelihood: 15, distinguishingFeatures: ['Age >12 months', 'Family history of atopy', 'Response to bronchodilators'] },
    { disease: 'Pertussis', likelihood: 8, distinguishingFeatures: ['Paroxysmal cough with inspiratory whoop', 'Post-tussive vomiting', 'No fever'] },
    { disease: 'Foreign Body Aspiration', likelihood: 5, distinguishingFeatures: ['Sudden onset', 'Choking episode', 'Unilateral hyperinflation'] },
    { disease: 'Heart Failure', likelihood: 5, distinguishingFeatures: ['Poor feeding since birth', 'Tachycardia', 'Hepatomegaly', 'Murmur'] },
  ],
  investigations: [
    { test: 'Pulse Oximetry', purpose: 'Assess severity and need for O2', timing: 'emergency', positiveResult: 'SpO2 <92% severe', negativeResult: 'SpO2 >=92%' },
    { test: 'Chest X-ray', purpose: 'Rule out other causes, assess severity', timing: 'routine', positiveResult: 'Hyperinflation, perihilar infiltrates, atelectasis', negativeResult: 'May be normal' },
    { test: 'RSV Rapid Antigen Test', purpose: 'Confirm RSV (for cohorting)', timing: 'routine', sensitivity: 80, specificity: 95, positiveResult: 'RSV+', negativeResult: 'Does not exclude RSV' },
    { test: 'CBC', purpose: 'Assess for secondary bacterial infection', timing: 'routine', positiveResult: 'Leukocytosis with left shift suggests bacterial co-infection', negativeResult: 'May be normal' },
  ],
  severityCriteria: [
    { criterion: 'Feeding', mild: 'Normal (>75% usual)', moderate: 'Reduced (50-75%)', severe: 'Unable (<50%)', critical: 'IV fluids required' },
    { criterion: 'SpO2', mild: '≥95%', moderate: '92-94%', severe: '<92%', critical: '<85% with cyanosis' },
    { criterion: 'Work of breathing', mild: 'Normal', moderate: 'Mild indrawing', severe: 'Moderate-severe indrawing', critical: 'Exhaustion/apnoea' },
    { criterion: 'Apnoea', mild: 'None', moderate: 'None', severe: 'None', critical: 'Any apnoea episode' },
  ],
  diagnosticCriteria: [
    { name: 'Clinical Diagnosis', type: 'required', description: 'First episode of wheeze in infant <12 months with coryza, cough, and respiratory distress during RSV season' },
  ],
  treatmentGuidelines: [
    {
      name: 'WHO Bronchiolitis Management', source: 'WHO Pocketbook', year: 2023,
      firstLine: [
        { drug: 'Oxygen', dose: 'To maintain SpO2 ≥92%', route: 'Nasal cannula', frequency: 'Continuous', duration: 'Until SpO2 stable', evidenceLevel: 'A' },
      ],
      stepProtocol: [
        { step: 1, therapy: 'Mild (normal feeding, mild respiratory distress)', details: 'Supportive care only: nasal suctioning, head-up position, ensure adequate feeding. No routine bronchodilators. No steroids.', duration: '3-7 days', monitoring: ['SpO2', 'Respiratory rate', 'Feeding q4h'] },
        { step: 2, therapy: 'Moderate (reduced feeding, moderate work of breathing)', details: 'Nasal suctioning before feeds. O2 if SpO2 <92%. Consider NG tube if feeding inadequate. Trial of nebulised salbutamol (2.5mg) if wheeze prominent.', duration: '3-5 days', monitoring: ['SpO2 continuous', 'Respiratory rate q2h', 'Feeding q4h', 'Input/output'] },
        { step: 3, therapy: 'Severe (unable to feed, severe respiratory distress, SpO2 <92%)', details: 'O2 therapy. NG/IV fluids. Consider CPAP if severe distress or apnoea. No routine bronchodilators or steroids (exception: trial of bronchodilators if strong personal/family history of atopy).', duration: '5-7 days', monitoring: ['Continuous SpO2', 'Cardiorespiratory monitoring', 'Q1h observations', 'Strict fluid balance'], alternatives: ['CPAP for severe respiratory distress'] },
        { step: 4, therapy: 'Life-threatening (apnoea, exhaustion, severe cyanosis)', details: 'PICU admission. CPAP or mechanical ventilation. No evidence for routine bronchodilators or steroids in bronchiolitis.', duration: '7-14 days', monitoring: ['Full ICU monitoring', 'Ventilatory settings', 'Serial blood gases'] },
      ],
      duration: '3-14 days',
      monitoring: ['SpO2', 'Respiratory rate', 'Heart rate', 'Feeding', 'Urine output', 'Work of breathing'],
    },
  ],
  admissionCriteria: [
    { indications: ['SpO2 <92% on room air', 'Unable to feed (taking <50% usual)', 'Moderate-severe respiratory distress', 'Apnoea', 'Age <3 months with any signs', 'Social concerns (caregiver unable to monitor)'], level: 'ward', parameters: [{ param: 'SpO2', threshold: '<92%' }, { param: 'Feeding', threshold: '<50% usual' }, { param: 'Age', threshold: '<3 months' }] },
  ],
  dischargeCriteria: {
    clinical: ['SpO2 ≥94% on room air for 12-24h', 'Feeding adequately (≥75% usual)', 'Mild or no respiratory distress', 'No apnoea for 24h'],
    lab: [],
    social: ['Caregiver understands signs of deterioration', 'Able to return if worsens', 'Follow-up arranged'],
  },
  complications: [
    { name: 'Apnoea', incidence: 10, timeCourse: 'Peak day 2-3', management: 'Monitor all infants <3 months. Stimulate if apnoea, escalate to CPAP/ventilation if persistent.', redFlags: ['Prematurity', 'Age <2 months'] },
    { name: 'Respiratory Failure', incidence: 5, timeCourse: 'Day 3-5', management: 'CPAP or mechanical ventilation. PICU admission.', redFlags: ['SpO2 <85% despite O2', 'Exhaustion', 'Rising pCO2'] },
    { name: 'Secondary Bacterial Pneumonia', incidence: 3, timeCourse: 'Day 5-7', management: 'Antibiotics as per pneumonia guidelines', redFlags: ['New fever after initial improvement', 'Deteriorating after day 5'] },
  ],
  followUp: { interval: '2 weeks', duration: '3 months', tests: [], specialistReview: false },
  prognosis: 'Excellent. Self-limiting illness resolving over 5-10 days. Mortality <0.1% in healthy infants. Higher in prematurity, CHD, CLD.',
  emergencyFlags: [
    { condition: 'Apnoea', action: 'Stimulate, bag-mask-ventilate if not responding', timeCritical: 'Immediate' },
    { condition: 'SpO2 <85% despite O2', action: 'PICU referral, consider CPAP', timeCritical: '<15 minutes' },
    { condition: 'Sudden deterioration', action: 'Check for pneumothorax (tension → needle decompression)', timeCritical: 'Immediate' },
  ],
  pediatricAdjustments: [
    { parameter: 'All management', adjustment: 'Age <3 months = high risk → admit regardless of SpO2', ageRange: '<3 months' },
    { parameter: 'Feeding', adjustment: 'Premature infants may need NG feeds earlier', ageRange: 'All' },
  ],
  pregnancyAdjustments: [],
  aiReasoning: {
    presentationPattern: ['First episode of wheeze in an infant <12 months with preceding coryza is bronchiolitis until proven otherwise', 'Age is the strongest predictor of severity — younger = worse', 'Apnoea may be the presenting sign in very young infants'],
    keyFeatures: ['Age <12 months', 'First wheezing episode', 'Prodromal coryza', 'RSV season', 'Wheeze + crackles on auscultation'],
    discriminatingQuestions: ['Is this the first episode of wheezing?', 'Did the illness start with coryza (runny nose)?', 'What is the child\'s corrected age (especially if premature)?', 'Any history of choking or sudden onset?', 'Any history of previous wheezing or family history of asthma?'],
    diagnosticAlgorithm: ['1. Confirm age <12 months', '2. Check for prodromal coryza', '3. Assess work of breathing', '4. Measure SpO2', '5. Check feeding ability', '6. Check for apnoea (especially <3 months)', '7. Trial of bronchodilators ONLY if strong atopy history', '8. CXR if diagnosis unclear or severe'],
  },
  clinicalNoteTemplate: {
    sections: ['Age, PMH (especially prematurity)', 'Presentation (coryza → cough → difficulty breathing)', 'Feeding history', 'Examination (respiratory effort, auscultation)', 'Severity assessment', 'Plan'],
    consultantWording: 'This infant presents with a first episode of lower respiratory tract illness characterized by coryzal prodrome followed by cough, wheeze, and respiratory distress. Examination shows [mild/moderate/severe] respiratory distress. The clinical picture is consistent with bronchiolitis.',
    exampleNote: 'A 4-month-old male (term, no PMH) presents with 3-day coryza followed by cough and wheeze. Mild chest indrawing, SpO2 94%. Feeding reduced to 60% usual. Diagnosis: Moderate bronchiolitis. Plan: nasa suction, head-up position, O2 to maintain SpO2 >92%, NG tube if not feeding, monitor for apnoea.',
  },
};

// ─── Neonatology Diseases ──────────────────────────────────────────────────────
export const neonatalSepsis: DiseaseIntelligence = {
  id: 'neonatal-sepsis', name: 'Neonatal Sepsis', specialtyId: 'PAED', subspecialtyId: 'neonatology', icd10: 'P36.9',
  epidemiology: {
    incidence: '3.5 million cases/year globally; 1 million deaths', prevalence: 'Leading cause of neonatal death',
    ageDistribution: 'Early onset (0-72h) vs late onset (72h-28d)', genderPredilection: 'Male > Female',
    geographicDistribution: 'Highest in Sub-Saharan Africa and South Asia', seasonality: 'Year-round'
  },
  symptomWeights: [
    { symptom: 'fever', weight: 5, prevalence: 40, category: 'minor' },
    { symptom: 'hypothermia', weight: 7, prevalence: 35, category: 'major' },
    { symptom: 'poor feeding', weight: 8, prevalence: 80, category: 'major' },
    { symptom: 'lethargy', weight: 8, prevalence: 75, category: 'major' },
    { symptom: 'respiratory distress', weight: 7, prevalence: 65, category: 'major' },
    { symptom: 'jaundice', weight: 5, prevalence: 30, category: 'minor' },
    { symptom: 'convulsions', weight: 9, prevalence: 15, category: 'red_flag' },
    { symptom: 'abdominal distension', weight: 6, prevalence: 25, category: 'minor' },
    { symptom: 'vomiting', weight: 5, prevalence: 20, category: 'minor' },
    { symptom: 'poor perfusion', weight: 8, prevalence: 50, category: 'red_flag' },
  ],
  riskFactors: [
    { factor: 'Prematurity / LBW', weight: 5.0, prevalence: 25 },
    { factor: 'Prolonged rupture of membranes (>18h)', weight: 4.0, prevalence: 10 },
    { factor: 'Maternal GBS colonization', weight: 3.5, prevalence: 15 },
    { factor: 'Maternal fever in labour', weight: 3.0, prevalence: 8 },
    { factor: 'Chorioamnionitis', weight: 5.0, prevalence: 5 },
    { factor: 'Low Apgar score', weight: 3.0, prevalence: 10 },
    { factor: 'Unclean delivery', weight: 4.0, prevalence: 20 },
  ],
  differentials: [
    { disease: 'Neonatal Sepsis', likelihood: 55, distinguishingFeatures: ['Risk factors present', 'Systemic signs', 'Abnormal labs'] },
    { disease: 'Birth Asphyxia', likelihood: 10, distinguishingFeatures: ['History of difficult delivery', 'Low Apgar', 'Multi-organ involvement'] },
    { disease: 'Neonatal Pneumonia', likelihood: 10, distinguishingFeatures: ['Focal respiratory signs', 'CXR changes'] },
    { disease: 'Transient Tachypnoea of Newborn', likelihood: 8, distinguishingFeatures: ['Term infant', 'C-section delivery', 'Self-resolving at 24-48h'] },
    { disease: 'Congenital Heart Disease', likelihood: 5, distinguishingFeatures: ['Cyanosis not responding to O2', 'Murmur', 'Abnormal CXR/echo'] },
    { disease: 'Metabolic Disorder', likelihood: 3, distinguishingFeatures: ['Refractory acidosis', 'Abnormal ammonia', 'Family history'] },
  ],
  investigations: [
    { test: 'CBC + Differential + Platelets', purpose: 'Screen for sepsis', timing: 'emergency', positiveResult: 'WBC <5 or >20; ANC <1.5; thrombocytopenia', negativeResult: 'Does not exclude sepsis' },
    { test: 'CRP', purpose: 'Assess inflammation', timing: 'emergency', sensitivity: 70, specificity: 80, positiveResult: '>10 mg/L at 24h suggests sepsis', negativeResult: 'CRP may be normal in first 12-24h' },
    { test: 'Blood Culture', purpose: 'Identify pathogen', timing: 'emergency', positiveResult: 'Organism identified', negativeResult: 'Negative in many cases; does not exclude sepsis' },
    { test: 'Lumbar Puncture', purpose: 'Rule out meningitis', timing: 'urgent', positiveResult: 'CSF WBC >20, protein >1.5, glucose <2/3 blood glucose', negativeResult: 'Normal CSF' },
    { test: 'Chest X-ray', purpose: 'Exclude pneumonia', timing: 'routine', positiveResult: 'Infiltrates/consolidation', negativeResult: 'May be normal' },
    { test: 'Blood Glucose', purpose: 'Screen for hypoglycaemia', timing: 'emergency', positiveResult: '<2.6 mmol/L', negativeResult: 'Normal' },
  ],
  severityCriteria: [
    { criterion: 'Consciousness', mild: 'Alert', moderate: 'Lethargic but responds', severe: 'Unresponsive', critical: 'Coma' },
    { criterion: 'Perfusion', mild: 'Normal (CRT <3s)', moderate: 'Prolonged (CRT 3-5s)', severe: 'Very prolonged (>5s)', critical: 'Shock (hypotension, mottled)' },
    { criterion: 'Feeding', mild: 'Slightly reduced', moderate: 'Markedly reduced', severe: 'IV fluids required', critical: 'Inotropic support' },
    { criterion: 'Respiratory', mild: 'Normal', moderate: 'Mild distress', severe: 'Moderate-severe', critical: 'Apnoea/ventilation' },
  ],
  diagnosticCriteria: [
    { name: 'WHO Neonatal Sepsis Diagnosis', type: 'required', description: 'Any 2+ signs: fever/hypothermia, poor feeding, lethargy, respiratory distress, convulsions PLUS risk factors' },
  ],
  treatmentGuidelines: [
    {
      name: 'WHO Neonatal Sepsis Treatment', source: 'WHO Pocketbook', year: 2023,
      firstLine: [
        { drug: 'Ampicillin', dose: '50 mg/kg IV q12h (d1-7); q8h (d8-28)', route: 'IV', frequency: '12-8 hourly', duration: '7-14 days', evidenceLevel: 'A', pediatricDose: '50 mg/kg' },
        { drug: 'Gentamicin', dose: '5 mg/kg IV once daily', route: 'IV/IM', frequency: '24 hourly', duration: '7-10 days', evidenceLevel: 'A', pediatricDose: '5 mg/kg' },
      ],
      stepProtocol: [
        { step: 1, therapy: 'Suspected neonatal sepsis (empiric)', details: 'Ampicillin 50 mg/kg IV + Gentamicin 5 mg/kg IV once daily. Supportive care: warmth, O2, IV fluids.', duration: '48-72h then reassess', monitoring: ['Q4h vitals', 'SpO2 continuous', 'Blood glucose q6h', 'CRP at 48h'] },
        { step: 2, therapy: 'Confirmed sepsis (culture positive)', details: 'Continue antibiotics based on sensitivities. Minimum 7-14 days depending on organism.', duration: '7-14 days', monitoring: ['Daily review', 'CRP twice weekly', 'Blood culture if not improving'], alternatives: ['Ceftriaxone if Gram-negative', 'Cloxacillin if Staph aureus'] },
        { step: 3, therapy: 'Meningitis (if LP positive)', details: 'Ceftriaxone 50 mg/kg IV q12h x 21 days. Consider adding vancomycin if Gram-positive.', duration: '21 days', monitoring: ['Daily neurological exam', 'Repeat LP at 48h to ensure sterility', 'Hearing screen before discharge'] },
        { step: 4, therapy: 'Septic shock (refractory hypotension)', details: 'IV fluids 10-20 ml/kg, dopamine/dobutamine, referral to PICU if available.', duration: 'Variable', monitoring: ['Invasive BP', 'Urine output hourly', 'Lactate', 'ABG'] },
      ],
      duration: '7-21 days',
      monitoring: ['Vitals q4h', 'SpO2', 'Blood glucose', 'CRP', 'Feeding tolerance', 'Weight', 'Urine output'],
    },
  ],
  admissionCriteria: [
    { indications: ['All suspected or confirmed neonatal sepsis', 'Any neonate with risk factors + signs of illness'], level: 'ward', parameters: [{ param: 'Age', threshold: '<28 days' }, { param: 'Any sign', threshold: '1+ clinical sign' }] },
    { indications: ['Septic shock', 'Respiratory failure requiring ventilation', 'Coma/convulsions', 'Multi-organ failure'], level: 'ICU', parameters: [{ param: 'BP', threshold: 'Hypotension for age' }, { param: 'SpO2', threshold: '<90%' }] },
  ],
  dischargeCriteria: {
    clinical: ['Afebrile >72h', 'Feeding well (full breast or bottle)', 'Normal vitals', 'No signs of infection', 'Weight stable or gaining'],
    lab: ['CRP normal or trending down', 'Blood culture sterile (if initially positive)', 'CSF sterile (if meningitis)'],
    social: ['Mother/caregiver competent to care', 'Follow-up arranged at 1 week', 'Access to healthcare if deteriorates'],
  },
  complications: [
    { name: 'Neonatal Meningitis', incidence: 20, timeCourse: 'Within 24-48h of sepsis onset', management: 'LP, change to meningitic dosing, 21-day course', redFlags: ['Convulsions', 'Bulging fontanelle', 'High-pitched cry', 'Irritability'] },
    { name: 'Septic Shock', incidence: 15, timeCourse: '12-24h', management: 'IV fluids, inotropes, PICU', redFlags: ['Hypotension', 'Poor perfusion', 'Oliguria'] },
    { name: 'Disseminated Intravascular Coagulation', incidence: 8, timeCourse: '24-48h', management: 'Platelets, FFP, cryoprecipitate', redFlags: ['Petechiae/purpura', 'Bleeding from puncture sites'] },
    { name: 'Hypoglycaemia', incidence: 25, timeCourse: 'At presentation', management: 'IV dextrose 10% 2 ml/kg, then infusion', redFlags: ['Convulsions', 'Lethargy'] },
  ],
  followUp: { interval: '1 week post-discharge', duration: '3 months', tests: ['Hearing screen (after meningitis)', 'Neurodevelopmental assessment at 6, 12, 18 months'], specialistReview: true, specialistTiming: '2 weeks post-discharge for meningitis survivors' },
  prognosis: 'Mortality 15-30% in low-resource settings. Worse with: prematurity, meningitis, shock, onset <48h. Full recovery in 70-80% of survivors. Risk of neurodevelopmental sequelae with meningitis.',
  emergencyFlags: [
    { condition: 'Septic shock', action: 'IV bolus 10-20 ml/kg, dopamine infusion, PICU referral', timeCritical: '<15 minutes' },
    { condition: 'Convulsions', action: 'Check glucose; phenobarbital 20 mg/kg IV', timeCritical: '<5 minutes' },
    { condition: 'Apnoea', action: 'Stimulate, bag-mask-ventilate, consider CPAP', timeCritical: 'Immediate' },
  ],
  pediatricAdjustments: [
    { parameter: 'Dosing', adjustment: 'Use neonatal-specific dosing (amphotericin dose, aminoglycoside interval)', ageRange: '<28 days' },
    { parameter: 'Temperature control', adjustment: 'Incubator care for preterm. Kangaroo care for stable LBW infants.', ageRange: 'All neonates' },
  ],
  pregnancyAdjustments: [],
  aiReasoning: {
    presentationPattern: ['Any sick neonate = sepsis until proven otherwise', 'Sepsis can present with subtle signs: "just not doing well"', 'Hypothermia is as concerning as fever in neonates', 'Apnoea can be the only sign in preterm infants'],
    keyFeatures: ['Age <28 days', 'Risk factors (PROM, maternal fever, prematurity)', 'Any 2 of: fever/hypothermia, poor feeding, lethargy, respiratory distress, convulsions'],
    discriminatingQuestions: ['What was the birth history (term/preterm, PROM, maternal fever)?', 'When did symptoms start (early vs late onset)?', 'Is the infant feeding as usual?', 'Is the infant excessively sleepy/difficult to wake?', 'Any convulsions/jerking movements?'],
    diagnosticAlgorithm: ['1. Check for any sign of illness', '2. Screen risk factors', '3. Blood culture + CBC + CRP', '4. Start empiric antibiotics within 1h', '5. Consider LP', '6. Supportive care (warmth, O2, glucose)', '7. Reassess at 48h with CRP'],
  },
  clinicalNoteTemplate: {
    sections: ['Age in hours/days', 'Gestational age at birth', 'Birth weight', 'Risk factors (PROM, maternal fever, GBS status)', 'Presentation and timeline', 'Examination findings', 'Investigations', 'Severity assessment', 'Treatment started', 'Plan'],
    consultantWording: 'This [age]-day-old [term/preterm] neonate presents with [signs]. Risk factors include [PROM/maternal fever/low birth weight]. Sepsis screen sent and empiric intravenous antibiotics commenced. Close monitoring for deterioration including. No signs of meningitis at this stage.',
    exampleNote: 'A 2-day-old term neonate (BW 3.2 kg), born to mother with PROM 24h, presents with poor feeding and lethargy. Temp 38.5°C, RR 60, CRT 4s. Sepsis screen sent. Started on ampicillin 50 mg/kg IV q12h + gentamicin 5 mg/kg IV once daily. LP deferred due to clinical instability. Plan: monitor q4h vitals, blood glucose q6h, review at 48h.',
  },
};

// ─── Neonatal Jaundice ─────────────────────────────────────────────────────────
export const neonatalJaundice: DiseaseIntelligence = {
  id: 'neonatal-jaundice', name: 'Neonatal Jaundice', specialtyId: 'PAED', subspecialtyId: 'neonatology', icd10: 'P59.9',
  epidemiology: {
    incidence: '60% of term, 80% of preterm neonates', prevalence: 'Most common neonatal condition requiring evaluation',
    ageDistribution: 'Peak day 3-5 (physiological), day 1-2 (pathological)', genderPredilection: 'Equal', geographicDistribution: 'Worldwide', seasonality: 'None'
  },
  symptomWeights: [
    { symptom: 'yellow discoloration', weight: 9, prevalence: 100, category: 'major' },
    { symptom: 'poor feeding', weight: 6, prevalence: 40, category: 'minor' },
    { symptom: 'lethargy', weight: 7, prevalence: 30, category: 'major' },
    { symptom: 'dark urine', weight: 5, prevalence: 20, category: 'minor' },
    { symptom: 'pale stools', weight: 7, prevalence: 5, category: 'red_flag' },
    { symptom: 'high-pitched cry', weight: 8, prevalence: 10, category: 'red_flag' },
    { symptom: 'opisthotonus', weight: 9, prevalence: 2, category: 'red_flag' },
  ],
  riskFactors: [
    { factor: 'Prematurity', weight: 3.0, prevalence: 20 },
    { factor: 'ABO/Rh incompatibility', weight: 4.0, prevalence: 10 },
    { factor: 'GGPD deficiency', weight: 3.5, prevalence: 5 },
    { factor: 'Breastfeeding', weight: 1.5, prevalence: 60 },
    { factor: 'Bruising/cephalohematoma', weight: 2.5, prevalence: 5 },
    { factor: 'Maternal diabetes', weight: 2.0, prevalence: 5 },
    { factor: 'Sibling with jaundice requiring phototherapy', weight: 2.5, prevalence: 3 },
  ],
  differentials: [
    { disease: 'Physiological Jaundice', likelihood: 60, distinguishingFeatures: ['Appears day 3-5', 'Resolves by day 7-10', 'Well infant', 'Bilirubin levels within normal range'] },
    { disease: 'ABO Incompatibility', likelihood: 12, distinguishingFeatures: ['Mother O, baby A/B', 'Early onset (<24h)', 'Positive DAT', 'Rapid rise in bilirubin'] },
    { disease: 'Rh Incompatibility', likelihood: 5, distinguishingFeatures: ['Rh-negative mother', 'Positive DAT', 'Severe early jaundice', 'May cause hydrops'] },
    { disease: 'GGPD Deficiency', likelihood: 5, distinguishingFeatures: ['Male predominance', 'Family history', 'May be triggered by drugs/infection', 'Heinz bodies on blood film'] },
    { disease: 'Breast Milk Jaundice', likelihood: 8, distinguishingFeatures: ['Appears day 4-7', 'Persists >2 weeks', 'Well thriving infant', 'No evidence of haemolysis'] },
    { disease: 'Biliary Atresia', likelihood: 2, distinguishingFeatures: ['Persistent jaundice >2 weeks', 'Pale stools', 'Dark urine', 'Direct hyperbilirubinaemia', 'Conjugated bilirubin >20%'] },
    { disease: 'Neonatal Sepsis', likelihood: 5, distinguishingFeatures: ['Signs of infection', 'Abnormal CBC/CRP', 'Systemic signs'] },
  ],
  investigations: [
    { test: 'Serum Bilirubin (Total + Direct)', purpose: 'Determine level and fraction', timing: 'urgent', positiveResult: 'Total >phototherapy threshold (by Bhutani nomogram) or direct >20%', negativeResult: 'Normal' },
    { test: 'FBC + Blood Film', purpose: 'Screen for haemolysis', timing: 'routine', positiveResult: 'Anaemia, reticulocytosis, abnormal RBC morphology', negativeResult: 'Normal' },
    { test: 'DAT (Direct Coombs Test)', purpose: 'Detect antibody-mediated haemolysis', timing: 'routine', positiveResult: 'Positive in ABO/Rh incompatibility', negativeResult: 'Negative' },
    { test: 'GGPD Screen', purpose: 'Identify enzyme deficiency', timing: 'routine', positiveResult: 'Low G6PD activity', negativeResult: 'Normal' },
    { test: 'Blood Group (mother + baby)', purpose: 'Identify incompatibility', timing: 'urgent', positiveResult: 'ABO or Rh incompatibility', negativeResult: 'Compatible' },
  ],
  severityCriteria: [
    { criterion: 'Jaundice level', mild: 'Below phototherapy line', moderate: 'At phototherapy line', severe: 'Above phototherapy line', critical: 'Above exchange transfusion line' },
    { criterion: 'Age at onset', mild: '>72h', moderate: '24-72h', severe: '<24h', critical: '<24h + rapid rise' },
    { criterion: 'Neurological signs', mild: 'None', moderate: 'None', severe: 'Lethargic, poor feeding', critical: 'High-pitched cry, opisthotonus, convulsions (kernicterus)' },
  ],
  diagnosticCriteria: [
    { name: 'Bhutani Nomogram', type: 'required', description: 'Plot TSB against age in hours. Phototherapy if above threshold. Exchange transfusion if above exchange line.' },
  ],
  treatmentGuidelines: [
    {
      name: 'WHO Neonatal Jaundice Treatment', source: 'WHO Pocketbook, AAP Guidelines', year: 2023,
      firstLine: [
        { drug: 'Phototherapy', dose: 'Intensity ≥30 μW/cm²/nm, wavelength 430-490 nm (blue light)', route: 'Topical', frequency: 'Continuous', duration: 'Until bilirubin below threshold for 12-24h', evidenceLevel: 'A' },
      ],
      stepProtocol: [
        { step: 1, therapy: 'Mild (below phototherapy line)', details: 'Reassure, encourage frequent feeding. Repeat bilirubin in 24h or sooner if risk factors.', duration: 'Ongoing', monitoring: ['Bilirubin daily until falling', 'Feeding', 'Wellbeing'] },
        { step: 2, therapy: 'Moderate (at phototherapy line)', details: 'Single phototherapy (double if rapid rise). Naked except nappy, eyes covered. Ensure adequate hydration. Check bilirubin q12h.', duration: '12-48h', monitoring: ['Bilirubin q12h', 'Temperature', 'Hydration', 'Weight'] },
        { step: 3, therapy: 'Severe (above phototherapy line)', details: 'Intensive phototherapy (double/triple). IV fluids if dehydrated. Check bilirubin q6-8h. Prepare for exchange if not responding.', duration: '24-72h', monitoring: ['Bilirubin q6-8h', 'Continuous vitals', 'Strict input/output'], alternatives: ['IV immunoglobulin if isoimmune haemolysis'] },
        { step: 4, therapy: 'Critical (above exchange transfusion line or neurological signs)', details: 'Urgent exchange transfusion. Continue intensive phototherapy during preparation. IVIG if isoimmune haemolysis.', duration: 'Exchange + ongoing phototherapy', monitoring: ['Hourly vitals during exchange', 'Bilirubin post-exchange', 'Calcium, glucose, electrolytes'] },
      ],
      duration: 'Variable (1-7 days)',
      monitoring: ['TSB q6-24h depending on severity', 'Neurological status', 'Feeding', 'Hydration', 'Weight'],
    },
  ],
  admissionCriteria: [
    { indications: ['TSB above phototherapy threshold', 'TSB rising rapidly (>8.5 μmol/L/h)', 'Jaundice <24h old', 'Any neurological sign', 'Prematurity with jaundice', 'Direct hyperbilirubinaemia requiring investigation'], level: 'ward', parameters: [{ param: 'TSB', threshold: 'Above phototherapy line' }, { param: 'Age at onset', threshold: '<24h' }, { param: 'Rise rate', threshold: '>8.5 μmol/L/h' }] },
  ],
  dischargeCriteria: {
    clinical: ['TSB well below phototherapy threshold', 'Feeding well', 'Neurologically normal', 'No longer requiring phototherapy for 12-24h'],
    lab: ['TSB on downward trend', 'If direct hyperbilirubinaemia: referral for further investigation arranged'],
    social: ['Follow-up bilirubin arranged within 48h', 'Caregiver educated on signs of significant jaundice'],
  },
  complications: [
    { name: 'Acute Bilirubin Encephalopathy (kernicterus)', incidence: 1, timeCourse: 'Hours to days', management: 'Emergency exchange transfusion. Risk of permanent brain damage.', redFlags: ['High-pitched cry', 'Hypertonia', 'Opisthotonus', 'Convulsions', 'Poor feeding'] },
    { name: 'Bilirubin-induced Neurological Dysfunction (BIND)', incidence: 3, timeCourse: 'Later in childhood', management: 'Hearing screen, developmental assessment, speech therapy', redFlags: ['Sensorineural hearing loss', 'Developmental delay'] },
  ],
  followUp: { interval: '2-3 days for ongoing jaundice', duration: 'Until resolved', tests: ['Bilirubin recheck', 'Hearing screen if bilirubin >exchange threshold'], specialistReview: true, specialistTiming: 'If direct hyperbilirubinaemia → paediatric GI referral' },
  prognosis: 'Excellent for physiological and managed pathological jaundice. Kernicterus is preventable with timely phototherapy/exchange transfusion. Mortality 0-5%.',
  emergencyFlags: [
    { condition: 'Neurological signs (high-pitched cry, opisthotonus)', action: 'EMERGENCY exchange transfusion. Stop phototherapy only during exchange.', timeCritical: '<1 hour' },
    { condition: 'TSB >50 μmol/L above exchange line', action: 'Prepare exchange transfusion, continue intensive phototherapy', timeCritical: '<2 hours' },
    { condition: 'Rising rapidly (>8.5 μmol/L/h) despite phototherapy', action: 'Prepare exchange transfusion, consider IVIG if isoimmune', timeCritical: '<4 hours' },
  ],
  pediatricAdjustments: [
    { parameter: 'Phototherapy intensity', adjustment: 'Preterm infants may need lower threshold for phototherapy', ageRange: '<37 weeks' },
    { parameter: 'Exchange transfusion threshold', adjustment: 'Lower thresholds for preterm, lower birth weight, sick infants', ageRange: 'All neonates' },
  ],
  pregnancyAdjustments: [],
  aiReasoning: {
    presentationPattern: ['Jaundice appearing <24h = pathological until proven otherwise', 'Jaundice >2 weeks = needs conjugated bilirubin + workup for biliary atresia', 'Neurological signs with jaundice = emergency exchange transfusion needed', 'The rate of bilirubin rise is as important as the absolute level'],
    keyFeatures: ['TSB level vs age (Bhutani nomogram)', 'Age at onset of jaundice', 'Rate of rise', 'Risk factors (prematurity, incompatibility, G6PD)', 'Neurological status'],
    discriminatingQuestions: ['At what age did jaundice appear?', 'Is the baby feeding well?', 'Any pale stools or dark urine?', 'Family history of jaundice requiring treatment?', 'Mother\'s blood group? Baby\'s blood group?'],
    diagnosticAlgorithm: ['1. Determine TSB and fraction', '2. Plot on Bhutani nomogram by age in hours', '3. Check age at onset (<24h = pathological)', '4. Check for haemolysis (CBC, film, DAT)', '5. Check G6PD', '6. If >2 weeks: check conjugated bilirubin', '7. Start phototherapy if indicated', '8. Monitor response'],
  },
  clinicalNoteTemplate: {
    sections: ['Age of baby', 'Age when jaundice started', 'Feeding and wellbeing', 'Risk factors', 'Bilirubin level vs phototherapy threshold', 'Neurological status', 'Treatment given/planned'],
    consultantWording: 'This [age]-hour-old [term/preterm] neonate presented with jaundice first noted at [age]. TSB is [value] at [age] hours, plotting [above/at/below] the phototherapy line. No neurological signs. [Aetiology/risk factors identified: ABO incompatibility/prematurity/physiological].',
    exampleNote: 'A 52-hour-old term neonate (BW 3.1kg) with jaundice noted at 36h. TSB 280 μmol/L, above phototherapy line. Mother O+, baby B+. DAT positive. No neurological signs. Started on double phototherapy. Repeat TSB in 8h. Prepare IVIG if rising.',
  },
};

// ─── Malaria (Paediatric) ──────────────────────────────────────────────────────
export const paediatricMalaria: DiseaseIntelligence = {
  id: 'paediatric-malaria', name: 'Paediatric Malaria', specialtyId: 'PAED', subspecialtyId: 'paediatric-infectious', icd10: 'B54',
  epidemiology: {
    incidence: '200 million cases/year; 400,000 deaths/year, most in children <5', prevalence: 'Leading cause of death in children <5 in endemic areas',
    ageDistribution: 'Peak 6-59 months', genderPredilection: 'Equal', geographicDistribution: 'Sub-Saharan Africa, Southeast Asia, South America', seasonality: 'Peaks during/after rainy season'
  },
  symptomWeights: [
    { symptom: 'fever', weight: 9, prevalence: 95, category: 'major' },
    { symptom: 'chills/rigors', weight: 7, prevalence: 70, category: 'major' },
    { symptom: 'headache', weight: 6, prevalence: 60, category: 'minor' },
    { symptom: 'vomiting', weight: 6, prevalence: 50, category: 'minor' },
    { symptom: 'pallor', weight: 7, prevalence: 40, category: 'major' },
    { symptom: 'convulsions', weight: 8, prevalence: 20, category: 'red_flag' },
    { symptom: 'altered consciousness', weight: 9, prevalence: 15, category: 'red_flag' },
    { symptom: 'difficulty breathing', weight: 8, prevalence: 15, category: 'red_flag' },
    { symptom: 'jaundice', weight: 6, prevalence: 10, category: 'major' },
    { symptom: 'dark urine', weight: 6, prevalence: 8, category: 'major' },
  ],
  riskFactors: [
    { factor: 'Living in endemic area', weight: 5.0, prevalence: 80 },
    { factor: 'No insecticide-treated bednet', weight: 3.5, prevalence: 40 },
    { factor: 'Age <5 years', weight: 4.0, prevalence: 50 },
    { factor: 'No recent antimalarial prophylaxis', weight: 3.0, prevalence: 60 },
    { factor: 'Pregnancy (maternal)', weight: 2.0, prevalence: 5 },
    { factor: 'Malnutrition', weight: 2.5, prevalence: 30 },
    { factor: 'HIV infection', weight: 2.8, prevalence: 10 },
  ],
  differentials: [
    { disease: 'Malaria', likelihood: 50, distinguishingFeatures: ['Cyclical fever', 'RDT/PBS positive', 'Endemic area'] },
    { disease: 'Sepsis', likelihood: 15, distinguishingFeatures: ['Non-cyclical fever', 'Source of infection', 'CXR changes', 'Negative RDT'] },
    { disease: 'Pneumonia', likelihood: 10, distinguishingFeatures: ['Cough + respiratory signs', 'CXR changes', 'Fast breathing'] },
    { disease: 'Meningitis/Encephalitis', likelihood: 8, distinguishingFeatures: ['Neck stiffness', 'Cerebral malaria = difficult to differentiate', 'LP shows CSF changes'] },
    { disease: 'Typhoid Fever', likelihood: 5, distinguishingFeatures: ['Stepladder fever', 'Abdominal pain', 'Rose spots', 'Blood culture positive'] },
    { disease: 'Viral Haemorrhagic Fever', likelihood: 3, distinguishingFeatures: ['Bleeding manifestations', 'Epidemiological link', 'Rapid deterioration'] },
    { disease: 'UTI', likelihood: 5, distinguishingFeatures: ['Dysuria', 'Urinalysis positive', 'Negative RDT'] },
  ],
  investigations: [
    { test: 'Malaria RDT (mRDT)', purpose: 'Rapid diagnosis at point of care', timing: 'emergency', sensitivity: 95, specificity: 95, positiveResult: 'HRP2/pLDH antigen detected', negativeResult: 'High NPV; may miss low-level parasitaemia' },
    { test: 'Blood Film (Thick + Thin)', purpose: 'Confirm species and quantify parasitaemia', timing: 'urgent', sensitivity: 98, specificity: 99, positiveResult: 'Parasites seen on smear', negativeResult: 'Negative film does not exclude if low parasitaemia' },
    { test: 'FBC', purpose: 'Assess anaemia, thrombocytopenia', timing: 'routine', positiveResult: 'Anaemia, thrombocytopenia', negativeResult: 'May be normal' },
    { test: 'Blood Glucose', purpose: 'Screen for hypoglycaemia', timing: 'emergency', positiveResult: '<2.6 mmol/L (common in severe malaria)', negativeResult: 'Normal' },
    { test: 'LP (if unconscious)', purpose: 'Rule out meningitis', timing: 'urgent', positiveResult: 'CSF changes (malaria: normal CSF)', negativeResult: 'Normal CSF suggests cerebral malaria' },
    { test: 'Blood Culture', purpose: 'Rule out concurrent bacteraemia', timing: 'urgent', positiveResult: 'Bacterial growth', negativeResult: 'No growth' },
  ],
  severityCriteria: [
    { criterion: 'Consciousness (Blantyre Coma Score)', mild: '5 (normal)', moderate: '4', severe: '3', critical: '<3 (cerebral malaria)' },
    { criterion: 'Parasitaemia', mild: '<2%', moderate: '2-5%', severe: '5-10%', critical: '>10% or >100,000/μL' },
    { criterion: 'Hb', mild: '>8 g/dL', moderate: '5-8 g/dL', severe: '<5 g/dL', critical: 'Heart failure from severe anaemia' },
    { criterion: 'Glucose', mild: '>3.5', moderate: '2.6-3.5', severe: '<2.6', critical: 'Severe hypoglycaemia with symptoms' },
    { criterion: 'Respiratory', mild: 'Normal', moderate: 'Mild distress', severe: 'Respiratory distress', critical: 'Pulmonary oedema/ARDS' },
    { criterion: 'Bleeding', mild: 'None', moderate: 'Bruising/petechiae', severe: 'Spontaneous bleeding', critical: 'DIC' },
  ],
  diagnosticCriteria: [
    { name: 'WHO Severe Malaria Criteria', type: 'required', description: 'Presence of P. falciparum + 1+: impaired consciousness, respiratory distress, seizures, hypoglycaemia, acidosis, severe anaemia, renal impairment, jaundice, shock, DIC, high parasitaemia (>10%)' },
  ],
  treatmentGuidelines: [
    {
      name: 'WHO Malaria Treatment Guidelines', source: 'WHO Guidelines for Malaria 2023', year: 2023,
      firstLine: [
        { drug: 'Artesunate IV', dose: '3 mg/kg IV at 0, 12, 24h (≤20 kg); 2.4 mg/kg (>20 kg)', route: 'IV', frequency: '0, 12, 24h', duration: 'Minimum 24h or until able to take oral', evidenceLevel: 'A', pediatricDose: '3 mg/kg IV at 0, 12, 24h' },
        { drug: 'Artemether-Lumefantrine (Coartem)', dose: 'Weight-based: 5-14kg: 1 tab; 15-24kg: 2 tabs; >25kg: 3 tabs PO BD x 3 days', route: 'PO', frequency: '12 hourly', duration: '3 days', evidenceLevel: 'A', pediatricDose: 'Weight-based dosing' },
      ],
      stepProtocol: [
        { step: 1, therapy: 'Uncomplicated malaria (mRDT+, no severity criteria)', details: 'Artemether-Lumefantrine (AL) weight-based dosing x 3 days. Give after food. Prepare artesunate if vomiting within 30 min.', duration: '3 days', monitoring: ['Clinical response at 24, 48, 72h', 'Repeat RDT at day 3 if not improving'] },
        { step: 2, therapy: 'Severe malaria (any severity criterion)', details: 'IV Artesunate. Loading dose immediately. Continue at 12h and 24h. Switch to oral AL when able to tolerate.', duration: 'Minimum 24h IV then 3 days oral', monitoring: ['Hourly vitals', 'Blantyre Coma Score q2h if cerebral', 'Parasitaemia q12h', 'Blood glucose q4h', 'Hb at 24h', 'Input/output'], alternatives: ['If artesunate not available: IM artemether or IV quinine'] },
        { step: 3, therapy: 'Cerebral malaria (BCS <3)', details: 'IV Artesunate. No routine steroids/no mannitol/no heparin. Manage seizures (IV phenobarbital/lorazepam). Prone position if unconscious.', duration: 'Variable', monitoring: ['BCS q2h', 'Seizure chart', 'Glucose q4h', 'Temperature q2h'] },
        { step: 4, therapy: 'Severe anaemia (Hb <5 g/dL)', details: 'Transfuse 10 ml/kg packed cells (20 ml/kg whole blood) over 2-4h. Give furosemide 1 mg/kg after transfusion.', duration: 'As needed', monitoring: ['Hb post-transfusion', 'Respiratory rate (fluid overload)'] },
        { step: 5, therapy: 'Hypoglycaemia (glucose <2.6)', details: 'IV dextrose 10% 5 ml/kg. Monitor glucose q30min until stable.', duration: 'Until stable', monitoring: ['Blood glucose q30min until stable >3.5', 'Ongoing q6h'] },
      ],
      duration: 'Days to weeks depending on severity',
      monitoring: ['Parasitaemia q12h (severe)', 'Hb', 'Platelets', 'Glucose q4-6h', 'Fever chart', 'BCS (cerebral)', 'Urine output'],
    },
  ],
  admissionCriteria: [
    { indications: ['Any severe malaria criterion', 'Unable to take oral medication', 'Vomiting multiple doses of oral AL', 'Age <6 months with confirmed malaria', 'Parasitaemia >5%'], level: 'ward', parameters: [{ param: 'Parasitaemia', threshold: '>5%' }, { param: 'Hb', threshold: '<5 g/dL' }, { param: 'BCS', threshold: '<5' }] },
    { indications: ['Cerebral malaria (BCS <3)', 'Respiratory distress/ARDS', 'DIC', 'Shock', 'Status epilepticus', 'Requiring ventilation'], level: 'ICU', parameters: [{ param: 'BCS', threshold: '<3' }, { param: 'SpO2', threshold: '<92%' }, { param: 'pH', threshold: '<7.2' }] },
  ],
  dischargeCriteria: {
    clinical: ['Afebrile >48h', 'Able to eat and drink', 'BCS 5 (cerebral malaria survivors: improving neurology)', 'No convulsions for 24h', 'Hb stable (if was anaemic)'],
    lab: ['Parasitaemia clearing or negative', 'Hb stable or improving'],
    social: ['Completed full course of AL', 'Caregiver understands to continue AL if discharged before 3 days completed', 'Follow-up arranged at 1 week'],
  },
  complications: [
    { name: 'Cerebral Malaria', incidence: 10, timeCourse: '24-48h', management: 'IV artesunate, seizure control, glucose monitoring, neurodevelopmental follow-up', redFlags: ['BCS <3', 'Repeated seizures', 'Focal neurological signs'] },
    { name: 'Severe Anaemia', incidence: 20, timeCourse: 'Days 1-3', management: 'Transfusion threshold Hb <5 g/dL or <6 with respiratory distress', redFlags: ['Hb <5', 'Respiratory distress'] },
    { name: 'Hypoglycaemia', incidence: 15, timeCourse: 'At presentation or during treatment', management: 'IV dextrose, monitor glucose, quinine-associated hypoglycaemia', redFlags: ['BCS <3 (may be due to hypoglycaemia rather than cerebral malaria)'] },
    { name: 'Acute Kidney Injury', incidence: 5, timeCourse: 'Days 2-5', management: 'Fluid balance, monitor creatinine, avoid nephrotoxic drugs', redFlags: ['Oliguria <1 mL/kg/h for 6h', 'Creatinine rising'] },
    { name: 'Pulmonary Oedema/ARDS', incidence: 3, timeCourse: 'Days 2-5', management: 'Fluid restriction, O2, CPAP/ventilation', redFlags: ['Respiratory distress with clear lungs', 'CXR: bilateral infiltrates'] },
    { name: 'Blackwater Fever (massive haemolysis)', incidence: 2, timeCourse: 'During treatment', management: 'Stop offending drug (if quinine), hydration, transfusion', redFlags: ['Dark urine', 'Rapid Hb drop', 'Jaundice'] },
  ],
  followUp: { interval: '1 week', duration: '1 month', tests: ['Blood film at day 3 to confirm parasite clearance', 'Hb at 2 weeks if was anaemic'], specialistReview: false },
  prognosis: 'Uncomplicated: 99% recovery. Severe: 10-20% mortality. Cerebral malaria: 15-20% mortality, 15% neurodevelopmental sequelae. Worse in age <2 years, HIV, malnutrition.',
  emergencyFlags: [
    { condition: 'Cerebral malaria (BCS <3)', action: 'IV artesunate STAT, check glucose, manage airway, monitor seizures', timeCritical: '<30 minutes' },
    { condition: 'Hypoglycaemia (<2.6)', action: 'IV dextrose 10% 5 ml/kg, repeat glucose in 15 min', timeCritical: '<5 minutes' },
    { condition: 'Hb <5 with respiratory distress', action: 'Transfuse immediately 10 ml/kg packed cells', timeCritical: '<30 minutes' },
    { condition: 'Repeated seizures', action: 'IV diazepam/lorazepam, check glucose, phenobarbital loading if refractory', timeCritical: '<5 minutes' },
  ],
  pediatricAdjustments: [
    { parameter: 'Artesunate dosing', adjustment: '3 mg/kg IV if ≤20 kg. 15 kg child with cerebral malaria still gets 3 mg/kg.', ageRange: 'All children' },
    { parameter: 'Hypoglycaemia', adjustment: 'More common in children, especially <3 years. Must monitor routinely even if not on quinine.', ageRange: '<3 years' },
    { parameter: 'Convulsions', adjustment: 'More common in paediatric cerebral malaria vs adult, treat aggressively.', ageRange: 'All children' },
  ],
  pregnancyAdjustments: [],
  aiReasoning: {
    presentationPattern: ['Fever in a child from endemic area = malaria until proven otherwise', 'Any child with fever + convulsions or altered consciousness in endemic area = cerebral malaria until proven otherwise', 'Fever + pallor = think malaria with anaemia'],
    keyFeatures: ['Fever (especially cyclical)', 'RDT positivity', 'Parasitaemia level', 'BCS (cerebral malaria)', 'Hb (anaemia)', 'Glucose (hypoglycaemia)'],
    discriminatingQuestions: ['Does the child sleep under a bednet?', 'Any recent travel?', 'Has there been vomiting?', 'Are there convulsions?', 'Is the child unusually sleepy/unrousable?'],
    diagnosticAlgorithm: ['1. RDT or blood film', '2. If positive: classify as uncomplicated vs severe (WHO criteria)', '3. Check Hb, glucose, BCS, parasitaemia', '4. Start treatment: AL (uncomplicated) or IV artesunate (severe)', '5. Monitor parasite clearance, Hb, glucose', '6. Look for and treat complications'],
  },
  clinicalNoteTemplate: {
    sections: ['Demographics', 'Presentation (fever pattern, associated symptoms)', 'Endemic exposure', 'MSE/BCS', 'Investigations', 'Severity classification', 'Treatment started', 'Complications if any', 'Plan'],
    consultantWording: 'This [age]-year-old child from [endemic area] presented with [fever/convulsions/coma]. mRDT positive with [parasitaemia %] on film. [No/Severe] severity criteria present. [Admitted for IV artesunate/started on oral AL]. Close monitoring for [hypoglycaemia/anaemia/seizures].',
    exampleNote: 'A 3-year-old male from a malaria-endemic area presents with 3-day fever, one episode of convulsion, and BCS 4/5. mRDT positive, parasitaemia 8% (P. falciparum). Hb 8.5, glucose 4.0. Severity: severe malaria due to high parasitaemia + convulsion. Started IV artesunate 45 mg IV at 0, 12, 24h. Glucose q4h, BCS q2h, parasitaemia q12h. Plan: switch to AL when tolerating oral.',
  },
};

// ─── Export all diseases ────────────────────────────────────────────────────────
export const PAED_DISEASE_MAP: Record<string, DiseaseIntelligence> = {};
[PAED_DISEASES[0], bronchiolitis, neonatalSepsis, neonatalJaundice, paediatricMalaria].forEach(d => { PAED_DISEASE_MAP[d.id] = d; });
