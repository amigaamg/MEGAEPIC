// ═══════════════════════════════════════════════════════════════
// AMEXAN UCOS — COUGH DISEASE CONTEXT PROFILES (PART 2)
// 28 disease profiles: Pertussis, Bronchiolitis, COVID-19, FBA,
// PE, PCP, Croup, Influenza, Bronchitis, GERD, UACS, ACE-i,
// Post-infectious, Aspiration PNA, NTM, VCD, PF/ILD, CF,
// Fungal PNA, Epiglottitis, Pneumothorax, CMV, BO, Drug-induced,
// Sinusitis, LPR, Pulm HTN, Chlamydia PNA (infants)
// ═══════════════════════════════════════════════════════════════

import type { ContextAwareDiseaseProfile, ContextOverride } from './cough-context-architecture';

// ─────────────────────────────────────────────────────────────────
// SHARED HELPER OVERRIDES
// ─────────────────────────────────────────────────────────────────

const PEDIATRIC_AGE_ADAPT: Partial<ContextOverride> = {
  questionRemovals: ['cough_smoking', 'cough_occupational_exposure', 'cough_ace_inhibitor', 'cough_heartburn', 'cough_night_sweats', 'cough_weight_loss'],
  questionAdditions: ['cough_feeding_difficulty', 'cough_vaccination_history', 'cough_stridor'],
  examAdditions: ['respiratory_rate', 'chest_indrawing', 'feeding_observation', 'oxygen_saturation'],
  doseAdjustments: { all: 'weight_based_dosing_per_guidelines' },
  differentialRemovals: ['lung_cancer', 'copd_exacerbation'],
};

const PEDIATRIC_TODDLER_ADAPT: Partial<ContextOverride> = {
  questionRemovals: ['cough_smoking', 'cough_occupational_exposure', 'cough_ace_inhibitor'],
  questionAdditions: ['cough_vaccination_history', 'cough_stridor', 'cough_feeding_difficulty'],
  examAdditions: ['respiratory_rate', 'chest_indrawing', 'oxygen_saturation'],
  doseAdjustments: { all: 'weight_based_dosing' },
  differentialRemovals: ['lung_cancer', 'copd_exacerbation'],
};

const ICU_VENT_ADAPT_SHARED: Partial<ContextOverride> = {
  questionRemovals: ['cough_severity', 'cough_timing', 'cough_feeding_difficulty', 'cough_exercise_induced'],
  examAdditions: ['ventilator_assessment', 'hemodynamic_monitoring', 'sedation_assessment', 'secretions_character'],
  investigationAdditions: ['abg', 'procalcitonin', 'eta', 'bal'],
  dispositionChanges: { icuRequired: true },
  monitoringAdditions: ['hemodynamics_continuous', 'abg_6hourly'],
  urgencyOverride: 'red',
};

const HIV_CD4_LOW_ADAPT: Partial<ContextOverride> = {
  questionAdditions: ['cd4_count_most_recent', 'art_regimen', 'art_adherence', 'oi_prophylaxis'],
  examAdditions: ['oral_cavity_inspection', 'lymph_node_survey', 'skin_exam'],
  investigationAdditions: ['cd4_count', 'viral_load'],
  activationThresholdDelta: -0.1,
  differentialAdditions: [{ diseaseId: 'pcp', weight: 0.4 }, { diseaseId: 'tb', weight: 0.4 }, { diseaseId: 'fungal_pneumonia', weight: 0.3 }],
};

const PREGNANCY_CXR_SAFE_P2: Partial<ContextOverride> = {
  investigationAdditions: ['chest_xray_shielded'],
  investigationRemovals: ['ct_chest', 'ctpa'],
  contraindications: ['doxycycline', 'fluoroquinolones'],
  cxrInterpretationModifiers: ['pregnancy_physiological_changes_may_mimic_disease'],
};

const ELDERLY_ADAPT_P2: Partial<ContextOverride> = {
  questionAdditions: ['functional_status', 'caregiver_support', 'aspiration_risk', 'medication_list'],
  examAdditions: ['swallow_assessment', 'cognitive_assessment', 'functional_assessment'],
  monitoringAdditions: ['functional_status_daily'],
  activationThresholdDelta: -0.05,
};

const DIABETES_ADAPT_P2: Partial<ContextOverride> = {
  investigationAdditions: ['hba1c', 'blood_glucose_monitoring'],
  monitoringAdditions: ['blood_glucose_4hourly'],
};

const RENAL_ADAPT_P2: Partial<ContextOverride> = {
  contraindications: ['aminoglycosides', 'nsaids'],
  monitoringAdditions: ['renal_function_daily', 'fluid_balance', 'electrolytes_daily'],
  dispositionChanges: { specialtyReferral: 'nephrology' },
};

// ═══════════════════════════════════════════════════════════════
// PROFILE 1: PERTUSSIS
// ═══════════════════════════════════════════════════════════════
export const PERTUSSIS_CONTEXT_PROFILE: ContextAwareDiseaseProfile = {
  diseaseId: 'pertussis',
  diseaseName: 'Pertussis (Whooping Cough)',
  master: {
    organism: 'Bordetella pertussis',
    transmission: 'Droplet / airborne',
    corePathophysiology: 'Tracheobronchitis with lymphocytosis, toxin-mediated ciliary damage',
    naturalHistory: 'Catarrhal (1-2wk) → Paroxysmal (2-8wk) → Convalescent (wk-months). Most severe in infants <6mo.',
    universalComplications: ['Apnoea', 'Hypoxia', 'Pneumonia', 'Seizures', 'Encephalopathy', 'Death in infants'],
    universalMechanisms: ['airway_irritation', 'vagal_stimulation'],
    universalPhenotypes: ['cough_pertussis_syndrome', 'cough_paroxysmal'],
  },
  baseline: {
    epidemiology: '10-40M cases/yr. No herd immunity gap.',
    symptomOnset: 'Catarrhal 7-10d → Paroxysmal',
    typicalPresentation: 'Paroxysmal cough with inspiratory whoop, posttussive vomiting, apnoeic spells in infants',
    discriminatingFeatures: ['paroxysmal_cough', 'whoop', 'posttussive_vomiting', 'infant', 'vaccination_gap'],
    basePrevalence: 0.02,
    agePrevalenceModifiers: { neonate: 0.08, infant: 0.12, child: 0.04, adolescent: 0.02, adult: 0.01 },
    typicalPhenotypes: ['cough_pertussis_syndrome', 'cough_paroxysmal'],
    commonMechanisms: ['airway_irritation', 'vagal_stimulation'],
    requiredQuestions: ['cough_duration', 'cough_severity', 'cough_vaccination_history', 'cough_contacts', 'cough_paroxysmal_whoop'],
    requiredExams: ['oxygen_saturation', 'respiratory_rate', 'ent_exam'],
    initialInvestigations: ['pertussis_pcr'],
    confirmatoryInvestigations: ['pertussis_culture', 'serology'],
    treatmentLines: [
      { line: 1, regimen: 'Azithromycin 10mg/kg day1, 5mg/kg d2-5', medications: ['azithromycin'], duration: '5d' },
      { line: 2, regimen: 'Clarithromycin or Erythromycin for 7d', medications: ['clarithromycin', 'erythromycin'], duration: '7d' },
      { line: 3, regimen: 'TMP-SMX for macrolide-allergic', medications: ['tmp_smx'], duration: '7d' },
    ],
    supportiveCare: ['oxygen_if_hypoxic', 'suctioning', 'apnoea_monitoring', 'post_exposure_prophylaxis'],
    disposition: { admissionRequired: false, icuRequired: false, specialty: 'pediatrics', followUp: '2wk' },
    monitoring: [
      { parameter: 'Cough frequency', frequency: 'Daily', target: 'Decreasing' },
      { parameter: 'Oxygen saturation', frequency: 'If hypoxic', target: '>= 92%' },
    ],
    urgency: 'orange',
    activationThreshold: 0.25,
    guidelines: ['who_pertussis_2024'],
    hmisEvents: ['pertussis_notification'],
  },
  ageGroupToContext: {
    neonate: 'pediatric_infant', infant: 'pediatric_infant', toddler: 'pediatric_toddler',
    preschool: 'pediatric_preschool', school_age: 'pediatric_school', adolescent: 'pediatric_adolescent',
    adult: 'adult_immunocompetent', older_adult: 'elderly_\u003e65',
  },
  relevantContexts: [],
  excludedContexts: [],
  contextOverrides: [
    {
      context: 'pediatric_infant', applicabilityWeight: 1.0,
      questionRemovals: ['cough_smoking', 'cough_occupational_exposure', 'cough_ace_inhibitor'],
      questionAdditions: ['apnoea_monitoring', 'bradycardia_monitoring', 'cyanotic_spells', 'feeding_tolerance'],
      examAdditions: ['apnoea_bradycardia_monitoring', 'continuous_o2_sat', 'feeding_observation'],
      investigationAdditions: ['cbc_lymphocytosis', 'chest_xray'],
      monitoringAdditions: ['apnoea_monitoring_continuous', 'bradycardia_continuous'],
      dispositionChanges: { admissionRequired: true, icuRequired: false, specialtyReferral: 'pediatric_icu_if_apnoeic' },
      urgencyOverride: 'red',
      treatmentAdditions: [{ drugId: 'azithromycin', line: 1, notes: 'Infants <6mo: admit. IV if unable PO.' }],
      differentialAdditions: [{ diseaseId: 'rsv_bronchiolitis', weight: 0.5 }, { diseaseId: 'chlamydia_pneumonia', weight: 0.3 }],
      clinicalNotes: 'Neonatal pertussis: life-threatening. Apnoea may be only sign. Immediate isolation.',
    },
    {
      context: 'pregnancy', applicabilityWeight: 1.0,
      ...PREGNANCY_CXR_SAFE_P2,
      treatmentAdditions: [{ drugId: 'azithromycin', line: 1, notes: 'Safe in pregnancy. Also protects neonate.' }],
      monitoringAdditions: ['fetal_assessment'],
      clinicalNotes: 'Maternal pertussis: treat with azithromycin. Vaccinate postpartum.',
    },
    {
      context: 'hiv_cd4_low', applicabilityWeight: 0.6,
      ...HIV_CD4_LOW_ADAPT,
      clinicalNotes: 'Pertussis in HIV: typical presentation but prolonged course.',
    },
    {
      context: 'adult_immunocompetent', applicabilityWeight: 0.5,
      questionAdditions: ['vaccination_history_adult', 'contacts_infants'],
      clinicalNotes: 'Adult pertussis: atypical — just persistent cough. Whoop often absent.',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// PROFILE 2: BRONCHIOLITIS (RSV)
// ═══════════════════════════════════════════════════════════════
export const BRONCHIOLITIS_CONTEXT_PROFILE: ContextAwareDiseaseProfile = {
  diseaseId: 'bronchiolitis',
  diseaseName: 'Bronchiolitis (RSV)',
  master: {
    organism: 'Respiratory syncytial virus (RSV)',
    transmission: 'Droplet / contact / fomite',
    corePathophysiology: 'Acute inflammation of bronchioles → edema, mucus plugging, air trapping, wheeze',
    naturalHistory: 'Peak severity d3-5. Self-limiting 7-14d. Apnoea risk in preterm/young infants.',
    universalComplications: ['Apnoea', 'Respiratory failure', 'Secondary bacterial pneumonia', 'Dehydration'],
    universalMechanisms: ['bronchospasm', 'alveolar_inflammation'],
    universalPhenotypes: ['cough_wheezy', 'cough_acute_productive'],
  },
  baseline: {
    epidemiology: 'Most common LRTI in infants <2yr. RSV seasonal.',
    symptomOnset: 'Acute 24-48h',
    typicalPresentation: 'Coryza → cough → wheeze → increased work of breathing in infant <12mo',
    discriminatingFeatures: ['infant_<12months', 'wheeze', 'rsv_season', 'coryza', 'chest_indrawing'],
    basePrevalence: 0.15,
    agePrevalenceModifiers: { neonate: 0.1, infant: 0.3, child: 0.05, preterm: 0.2 },
    typicalPhenotypes: ['cough_wheezy', 'cough_acute_productive'],
    commonMechanisms: ['bronchospasm', 'alveolar_inflammation'],
    requiredQuestions: ['cough_duration', 'cough_fever', 'cough_feeding_difficulty', 'cough_vaccination_history', 'apnoea_history', 'work_of_breathing'],
    requiredExams: ['chest_auscultation', 'respiratory_rate', 'chest_indrawing', 'oxygen_saturation', 'nasal_secretions'],
    initialInvestigations: ['rsv_test'],
    confirmatoryInvestigations: [],
    treatmentLines: [
      { line: 1, regimen: 'Supportive care — oxygen, suction, hydration', medications: [], duration: '7-14d' },
      { line: 2, regimen: 'High-flow nasal cannula if hypoxic', medications: [], duration: 'Variable' },
      { line: 3, regimen: 'ICU: CPAP or mechanical ventilation', medications: [], duration: 'Variable' },
    ],
    supportiveCare: ['oxygen_if_spo2_<90', 'nasal_suction', 'iv_fluids_if_unable_to_feed', 'antipyretics'],
    disposition: { admissionRequired: false, icuRequired: false, specialty: 'pediatrics', followUp: '1wk' },
    monitoring: [
      { parameter: 'Oxygen saturation', frequency: 'Continuous if admitted', target: '>= 90%' },
      { parameter: 'Respiratory rate', frequency: '1-4 hourly', target: 'Age-appropriate' },
      { parameter: 'Feeding', frequency: 'Each feed', target: 'Tolerating oral feeds' },
    ],
    urgency: 'orange',
    activationThreshold: 0.3,
    guidelines: ['who_bronchiolitis_2024'],
    hmisEvents: ['bronchiolitis_admission'],
  },
  ageGroupToContext: {
    neonate: 'pediatric_infant', infant: 'pediatric_infant', toddler: 'pediatric_toddler',
    preschool: 'pediatric_preschool', child: 'pediatric_school',
  },
  relevantContexts: ['pediatric_infant', 'pediatric_toddler', 'pediatric_preschool'],
  excludedContexts: ['adult_immunocompetent', 'elderly_\u003e65'],
  contextOverrides: [
    {
      context: 'pediatric_infant', applicabilityWeight: 1.0,
      ...PEDIATRIC_AGE_ADAPT,
      questionAdditions: ['apnoea_history', 'prematurity', 'congenital_heart_disease'],
      examAdditions: ['nasal_secretion_suction', 'chest_indrawing_assessment'],
      investigationAdditions: ['chest_xray', 'cbc'],
      monitoringAdditions: ['apnoea_monitoring_if_preterm', 'feeding_volume_chart'],
      dispositionChanges: { admissionRequired: false, icuRequired: false, specialtyReferral: 'pediatric_if_complex' },
      urgencyOverride: 'orange',
      differentialAdditions: [{ diseaseId: 'chlamydia_pneumonia', weight: 0.3 }, { diseaseId: 'pertussis', weight: 0.3 }],
      clinicalNotes: 'RSV: Bronchodilators not routinely recommended. Palivizumab for high-risk.',
    },
    {
      context: 'pediatric_toddler', applicabilityWeight: 0.7,
      ...PEDIATRIC_TODDLER_ADAPT,
      clinicalNotes: 'Older infants: milder disease. Wheeze may persist weeks.',
    },
    {
      context: 'icu_ventilated', applicabilityWeight: 0.6,
      ...ICU_VENT_ADAPT_SHARED,
      treatmentAdditions: [{ drugId: 'high_flow_nasal_cannula', line: 2, notes: 'HFNC for initial respiratory support' }],
      clinicalNotes: 'ICU RSV: HFNC first. CPAP if fails. Ribavirin only for immunocompromised.',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// PROFILE 3: COVID-19
// ═══════════════════════════════════════════════════════════════
export const COVID19_CONTEXT_PROFILE: ContextAwareDiseaseProfile = {
  diseaseId: 'covid19',
  diseaseName: 'COVID-19',
  master: {
    organism: 'SARS-CoV-2',
    transmission: 'Droplet / airborne / fomite',
    corePathophysiology: 'ACE2 receptor-mediated entry → alveolar inflammation → cytokine storm → ARDS',
    naturalHistory: 'Incubation 2-14d. Mild 80%, severe 15%, critical 5%. Long COVID in 10-30%.',
    universalComplications: ['ARDS', 'Cytokine storm', 'Pulmonary embolism', 'Myocarditis', 'Long COVID', 'Secondary infection'],
    universalMechanisms: ['alveolar_inflammation', 'pulmonary_edema'],
    universalPhenotypes: ['cough_acute_dry', 'cough_acute_productive'],
  },
  baseline: {
    epidemiology: 'Pandemic. Seasonal patterns. Variants continue.',
    symptomOnset: 'Acute 2-14d incubation',
    typicalPresentation: 'Fever, dry cough, loss of smell/taste, fatigue, myalgia, sore throat',
    discriminatingFeatures: ['loss_smell', 'loss_taste', 'fever', 'contacts', 'pcr_positive'],
    basePrevalence: 0.12,
    agePrevalenceModifiers: { adult: 0.15, older_adult: 0.1 },
    typicalPhenotypes: ['cough_acute_dry', 'cough_acute_productive'],
    commonMechanisms: ['alveolar_inflammation', 'pulmonary_edema'],
    requiredQuestions: ['cough_fever', 'cough_duration', 'cough_dyspnea', 'loss_smell_taste', 'covid_contact', 'vaccination_status'],
    requiredExams: ['chest_auscultation', 'oxygen_saturation', 'temperature', 'respiratory_rate'],
    initialInvestigations: ['covid_pcr'],
    confirmatoryInvestigations: ['ct_chest'],
    treatmentLines: [
      { line: 1, regimen: 'Supportive care, antipyretics', medications: ['paracetamol'], duration: 'Symptom-based' },
      { line: 2, regimen: 'Antiviral (nirmatrelvir/ritonavir or remdesivir)', medications: ['nirmatrelvir_ritonavir', 'remdesivir'], duration: '5d' },
      { line: 3, regimen: 'Corticosteroids if hypoxic (dexamethasone 6mg IV/PO)', medications: ['dexamethasone'], duration: '10d' },
    ],
    supportiveCare: ['oxygen_if_spo2_<94', 'prone_positioning', 'anticoagulation_prophylaxis', 'isolation'],
    disposition: { admissionRequired: false, icuRequired: false, specialty: 'infectious_disease', followUp: '2wk' },
    monitoring: [
      { parameter: 'Oxygen saturation', frequency: '4 hourly', target: '>= 94%' },
      { parameter: 'CRP trend', frequency: '48 hourly', target: 'Trending down' },
      { parameter: 'Temperature', frequency: '6 hourly', target: '< 37.5°C' },
    ],
    urgency: 'orange',
    activationThreshold: 0.2,
    guidelines: ['who_covid19_2024'],
    hmisEvents: ['covid19_notification', 'isolation_order'],
  },
  ageGroupToContext: {
    infant: 'pediatric_infant', toddler: 'pediatric_toddler', preschool: 'pediatric_preschool',
    school_age: 'pediatric_school', adolescent: 'pediatric_adolescent',
    adult: 'adult_immunocompetent', older_adult: 'elderly_\u003e65',
  },
  relevantContexts: [],
  excludedContexts: [],
  contextOverrides: [
    {
      context: 'elderly_\u003e65', applicabilityWeight: 1.0,
      ...ELDERLY_ADAPT_P2,
      treatmentAdditions: [{ drugId: 'dexamethasone', line: 1, notes: 'Start if O2 < 94%' }],
      monitoringAdditions: ['cognition_screening', 'mobility_assessment', 'delirium_screening'],
      activationThresholdDelta: -0.1,
      urgencyOverride: 'orange',
      differentialAdditions: [{ diseaseId: 'bacterial_pneumonia', weight: 0.4 }, { diseaseId: 'pe', weight: 0.3 }],
      clinicalNotes: 'Elderly COVID: atypical — delirium, falls, hypoxia without dyspnea. Higher mortality.',
    },
    {
      context: 'pregnancy', applicabilityWeight: 1.0,
      ...PREGNANCY_CXR_SAFE_P2,
      monitoringAdditions: ['fetal_ultrasound', 'fetal_heart_rate_monitoring'],
      differentialAdditions: [{ diseaseId: 'pe', weight: 0.4 }],
      clinicalNotes: 'Pregnancy COVID: higher risk of severe disease. Antiviral safety must be verified.',
    },
    {
      context: 'hiv_cd4_low', applicabilityWeight: 0.7,
      ...HIV_CD4_LOW_ADAPT,
      activationThresholdDelta: -0.1,
      clinicalNotes: 'HIV-COVID: higher severe disease risk if low CD4.',
    },
    {
      context: 'diabetes', applicabilityWeight: 0.8,
      ...DIABETES_ADAPT_P2,
      activationThresholdDelta: -0.05,
      monitoringAdditions: ['glucose_4hourly', 'ketone_monitoring'],
      clinicalNotes: 'Diabetes-COVID: double risk severe. Steroids increase glucose.',
    },
    {
      context: 'icu_ventilated', applicabilityWeight: 0.9,
      ...ICU_VENT_ADAPT_SHARED,
      treatmentAdditions: [{ drugId: 'dexamethasone', line: 1, notes: '10d course standard' }],
      investigationAdditions: ['il6', 'd_dimer', 'ferritin'],
      clinicalNotes: 'ICU COVID: ARDS ventilation. Prone. Tocilizumab if cytokine storm.',
    },
    {
      context: 'renal_failure', applicabilityWeight: 0.7,
      ...RENAL_ADAPT_P2,
      doseAdjustments: { remdesivir: 'adjust_if_gfr_<30' },
      clinicalNotes: 'Renal COVID: dose adjust antivirals. Higher mortality with AKI.',
    },
    {
      context: 'resource_low', applicabilityWeight: 0.7,
      investigationRemovals: ['covid_pcr', 'ct_chest'],
      investigationAdditions: ['rapid_antigen_test', 'clinical_diagnosis'],
      clinicalNotes: 'Resource-limited: clinical diagnosis. Oxygen mainstay.',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// PROFILE 4: FOREIGN BODY ASPIRATION
// ═══════════════════════════════════════════════════════════════
export const FOREIGN_BODY_CONTEXT_PROFILE: ContextAwareDiseaseProfile = {
  diseaseId: 'foreign_body',
  diseaseName: 'Foreign Body Aspiration',
  master: {
    organism: 'N/A',
    transmission: 'Aspiration of foreign object',
    corePathophysiology: 'Mechanical obstruction of airway → atelectasis, hyperinflation, pneumonia distal to obstruction',
    naturalHistory: 'Acute choking → chronic cough depending on location. Complete obstruction = emergency.',
    universalComplications: ['Complete airway obstruction', 'Post-obstructive pneumonia', 'Bronchiectasis', 'Lung abscess', 'Death'],
    universalMechanisms: ['obstructive'],
    universalPhenotypes: ['cough_barking', 'cough_wheezy', 'cough_neonatal_feeding'],
  },
  baseline: {
    epidemiology: 'Peak 1-3yr. Peanuts most common.',
    symptomOnset: 'Sudden, during eating/playing',
    typicalPresentation: 'Sudden choking, coughing, unilateral wheeze, decreased breath sounds',
    discriminatingFeatures: ['choking_episode', 'sudden_onset', 'unilateral_signs', 'child', 'asymmetric_breath_sounds'],
    basePrevalence: 0.02,
    agePrevalenceModifiers: { infant: 0.05, child: 0.04, toddler: 0.08 },
    typicalPhenotypes: ['cough_barking', 'cough_wheezy', 'cough_neonatal_feeding'],
    commonMechanisms: ['obstructive'],
    requiredQuestions: ['choking_history', 'cough_sudden_onset', 'unilateral_symptoms', 'object_type'],
    requiredExams: ['chest_auscultation', 'respiratory_rate', 'oxygen_saturation', 'tracheal_deviation'],
    initialInvestigations: ['chest_xray', 'bronchoscopy'],
    confirmatoryInvestigations: ['ct_chest'],
    treatmentLines: [
      { line: 1, regimen: 'Rigid bronchoscopy for removal', medications: [], duration: 'Immediate' },
      { line: 2, regimen: 'Flexible bronchoscopy if distal', medications: [], duration: 'Urgent' },
      { line: 3, regimen: 'Thoracotomy for failure of bronchoscopy', medications: [], duration: 'Surgical' },
    ],
    supportiveCare: ['oxygen', 'positioning_good_lung_down', 'avoid_bronchodilators'],
    disposition: { admissionRequired: true, icuRequired: false, specialty: 'ent_or_respiratory', followUp: '1wk post-removal' },
    monitoring: [
      { parameter: 'Oxygen saturation', frequency: 'Continuous', target: '>= 92%' },
      { parameter: 'Respiratory distress', frequency: 'Continuous', target: 'Absent' },
    ],
    urgency: 'red',
    activationThreshold: 0.4,
    guidelines: ['es_foreign_body_guidelines'],
    hmisEvents: ['bronchoscopy_booking_urgent'],
  },
  ageGroupToContext: {
    neonate: 'pediatric_infant', infant: 'pediatric_infant', toddler: 'pediatric_toddler',
    preschool: 'pediatric_preschool', school_age: 'pediatric_school', adolescent: 'pediatric_adolescent',
    adult: 'adult_immunocompetent', older_adult: 'elderly_\u003e65',
  },
  relevantContexts: [],
  excludedContexts: [],
  contextOverrides: [
    {
      context: 'pediatric_infant', applicabilityWeight: 1.0,
      questionAdditions: ['choking_on_milk', 'cough_during_feeding', 'small_object_access'],
      examAdditions: ['complete_bronchoscopy_set'],
      investigationAdditions: ['chest_xray', 'virtual_bronchoscopy'],
      differentialAdditions: [{ diseaseId: 'laryngomalacia', weight: 0.4 }, { diseaseId: 'tracheoesophageal_fistula', weight: 0.3 }],
      clinicalNotes: 'Infant FBA: often no clear choking history. Recurrent pneumonia may be only clue.',
    },
    {
      context: 'elderly_\u003e65', applicabilityWeight: 0.7,
      ...ELDERLY_ADAPT_P2,
      questionAdditions: ['dysphagia_history', 'dental_status', 'neurological_disease'],
      examAdditions: ['swallow_assessment'],
      differentialAdditions: [{ diseaseId: 'aspiration_pneumonia', weight: 0.5 }],
      clinicalNotes: 'Elderly FBA: food bolus, dental prosthesis. Often right lower lobe.',
    },
    {
      context: 'resource_low', applicabilityWeight: 0.6,
      investigationRemovals: ['ct_chest', 'virtual_bronchoscopy'],
      clinicalNotes: 'Resource-limited: chest X-ray + rigid bronchoscopy. High clinical index.',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// PROFILE 5: PULMONARY EMBOLISM
// ═══════════════════════════════════════════════════════════════
export const PE_CONTEXT_PROFILE: ContextAwareDiseaseProfile = {
  diseaseId: 'pe',
  diseaseName: 'Pulmonary Embolism',
  master: {
    organism: 'N/A',
    transmission: 'N/A',
    corePathophysiology: 'Thrombus from DVT → pulmonary artery obstruction → V/Q mismatch → right heart strain → shock',
    naturalHistory: 'Acute onset. Massive PE = immediate life threat. Submassive = progressive right heart strain.',
    universalComplications: ['Cardiogenic shock', 'Cardiac arrest', 'Pulmonary infarction', 'Chronic thromboembolic PH', 'Death'],
    universalMechanisms: ['pleural_irritation', 'pulmonary_edema'],
    universalPhenotypes: ['cough_acute_dry', 'cough_hemoptysis'],
  },
  baseline: {
    epidemiology: 'Third most common cardiovascular cause of death.',
    symptomOnset: 'Sudden, minutes to hours',
    typicalPresentation: 'Sudden dyspnea, pleuritic chest pain, hemoptysis, cough, DVT signs, hypoxia',
    discriminatingFeatures: ['sudden_dyspnea', 'pleuritic_pain', 'dvt', 'risk_factors', 'hypoxia', 'tachycardia'],
    basePrevalence: 0.02,
    agePrevalenceModifiers: { adult: 0.02, older_adult: 0.04 },
    typicalPhenotypes: ['cough_acute_dry', 'cough_hemoptysis'],
    commonMechanisms: ['pleural_irritation', 'pulmonary_edema'],
    requiredQuestions: ['cough_dyspnea', 'cough_chest_pain', 'dvt_symptoms', 'immobilization', 'surgery_recent', 'cancer', 'pregnancy'],
    requiredExams: ['cardiac_auscultation', 'chest_auscultation', 'dvt_assessment', 'oxygen_saturation', 'jvp'],
    initialInvestigations: ['d_dimer', 'ecg'],
    confirmatoryInvestigations: ['ctpa', 'vq_scan'],
    treatmentLines: [
      { line: 1, regimen: 'Anticoagulation — LMWH or DOAC', medications: ['heparin_lmwh', 'rivaroxaban', 'apixaban'], duration: '3-6mo' },
      { line: 2, regimen: 'Thrombolysis for massive PE', medications: ['tpa'], duration: 'Single dose' },
      { line: 3, regimen: 'Embolectomy if thrombolysis contraindicated', medications: [], duration: 'Surgical' },
    ],
    supportiveCare: ['oxygen', 'analgesia', 'hemodynamic_support', 'bed_rest'],
    disposition: { admissionRequired: true, icuRequired: false, specialty: 'internal_medicine', followUp: '3mo' },
    monitoring: [
      { parameter: 'Oxygen saturation', frequency: 'Continuous', target: '>= 92%' },
      { parameter: 'Blood pressure', frequency: '1 hourly if unstable', target: '>= 90/60' },
      { parameter: 'ECG', frequency: 'Daily', target: 'No right heart strain' },
    ],
    urgency: 'red',
    activationThreshold: 0.4,
    guidelines: ['esc_pe_2024'],
    hmisEvents: ['ctpa_urgent', 'anticoagulation_start'],
  },
  ageGroupToContext: {
    adolescent: 'pediatric_adolescent', adult: 'adult_immunocompetent', older_adult: 'elderly_\u003e65',
  },
  relevantContexts: ['adult_immunocompetent', 'elderly_\u003e65', 'pregnancy', 'oncology_active', 'postoperative'],
  excludedContexts: ['pediatric_infant', 'pediatric_toddler', 'pediatric_preschool', 'pediatric_school'],
  contextOverrides: [
    {
      context: 'pregnancy', applicabilityWeight: 1.0,
      investigationRemovals: ['ctpa'],
      investigationAdditions: ['vq_scan_low_dose', 'leg_doppler', 'echocardiogram'],
      contraindications: ['warfarin', 'dabigatran'],
      treatmentAdditions: [{ drugId: 'lmwh', line: 1, notes: 'LMWH through pregnancy. Switch postpartum.' }],
      clinicalNotes: 'Pregnancy PE: VQ preferred over CTPA. LMWH only. DOACs contraindicated.',
    },
    {
      context: 'oncology_active', applicabilityWeight: 1.0,
      treatmentAdditions: [{ drugId: 'lmwh', line: 1, notes: 'First 6mo LMWH, then assess' }],
      clinicalNotes: 'Cancer PE: LMWH first-line. Higher recurrence risk.',
    },
    {
      context: 'postoperative', applicabilityWeight: 1.0,
      questionAdditions: ['surgery_type', 'days_post_op', 'mobilization_status', 'prophylaxis_status'],
      clinicalNotes: 'Postop PE: High suspicion. Often missed as atelectasis.',
    },
    {
      context: 'elderly_\u003e65', applicabilityWeight: 0.8,
      ...ELDERLY_ADAPT_P2,
      doseAdjustments: { anticoagulation: 'renal_function_dose_adjustment' },
      clinicalNotes: 'Elderly PE: Falls risk with anticoag. Dose adjust for renal function.',
    },
    {
      context: 'renal_failure', applicabilityWeight: 0.7,
      ...RENAL_ADAPT_P2,
      contraindications: ['rivaroxaban', 'apixaban_if_gfr_<15'],
      clinicalNotes: 'Renal PE: LMWH dose adjust. DOACs avoid if CrCl <15.',
    },
    {
      context: 'resource_middle', applicabilityWeight: 0.6,
      investigationRemovals: ['ctpa', 'vq_scan'],
      investigationAdditions: ['leg_doppler', 'clinical_wells_score', 'echo'],
      clinicalNotes: 'Resource-limited: clinical Wells score. Echo for right heart strain.',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// PROFILE 6: PNEUMOCYSTIS PNEUMONIA (PCP)
// ═══════════════════════════════════════════════════════════════
export const PCP_CONTEXT_PROFILE: ContextAwareDiseaseProfile = {
  diseaseId: 'pcp',
  diseaseName: 'Pneumocystis Pneumonia (PCP)',
  master: {
    organism: 'Pneumocystis jirovecii',
    transmission: 'Airborne (ubiquitous)',
    corePathophysiology: 'Alveolar inflammation with foamy exudate, impaired gas exchange, hypoxemia',
    naturalHistory: 'Subacute onset over 1-2wk. Rapid deterioration if untreated. Mortality 10-20%.',
    universalComplications: ['Respiratory failure', 'ARDS', 'Pneumothorax', 'Death'],
    universalMechanisms: ['alveolar_inflammation'],
    universalPhenotypes: ['cough_immunocompromised', 'cough_acute_dry'],
  },
  baseline: {
    epidemiology: 'CD4 <200 in HIV. Also transplant, steroids, chemo.',
    symptomOnset: 'Subacute 1-2wk',
    typicalPresentation: 'Dry cough, fever, progressive dyspnea, hypoxia (out of proportion to exam), bilateral interstitial infiltrates',
    discriminatingFeatures: ['hiv', 'cd4_<200', 'dry_cough', 'hypoxia', 'interstitial_cxr', 'minimal_crackles'],
    basePrevalence: 0.01,
    agePrevalenceModifiers: { adult: 0.01 },
    typicalPhenotypes: ['cough_immunocompromised', 'cough_acute_dry'],
    commonMechanisms: ['alveolar_inflammation'],
    requiredQuestions: ['cough_hiv_status', 'cd4_count', 'art_regimen', 'pcp_prophylaxis', 'cough_dyspnea', 'cough_fever'],
    requiredExams: ['chest_auscultation', 'oxygen_saturation', 'respiratory_rate', 'oral_thrush'],
    initialInvestigations: ['chest_xray', 'ct_chest'],
    confirmatoryInvestigations: ['bronchoscopy', 'pcr_pcp'],
    treatmentLines: [
      { line: 1, regimen: 'TMP-SMX 15-20mg/kg/d TMP component', medications: ['tmp_smx'], duration: '21d' },
      { line: 2, regimen: 'Pentamidine IV if TMP-SMX allergic', medications: ['pentamidine'], duration: '21d' },
      { line: 3, regimen: 'Clindamycin + Primaquine', medications: ['clindamycin', 'primaquine'], duration: '21d' },
    ],
    supportiveCare: ['oxygen_if_hypoxic', 'steroids_if_pao2_<70mmHg'],
    disposition: { admissionRequired: true, icuRequired: false, specialty: 'infectious_disease', followUp: '1wk' },
    monitoring: [
      { parameter: 'Oxygen saturation', frequency: '4 hourly', target: '>= 92%' },
      { parameter: 'ABG', frequency: 'Daily if hypoxic', target: 'PaO2 >= 70' },
      { parameter: 'CXR', frequency: 'Weekly', target: 'Improving' },
    ],
    urgency: 'red',
    activationThreshold: 0.4,
    guidelines: ['who_hiv_oi_2024'],
    hmisEvents: ['pcp_diagnosis', 'hiv_oi_notification'],
  },
  ageGroupToContext: {
    adolescent: 'pediatric_adolescent', adult: 'adult_immunocompetent', older_adult: 'elderly_\u003e65',
  },
  relevantContexts: ['hiv_cd4_very_low', 'hiv_cd4_low', 'transplant', 'oncology_chemo', 'autoimmune_steroids'],
  excludedContexts: ['pediatric_infant', 'pediatric_toddler', 'pediatric_preschool', 'pediatric_school'],
  contextOverrides: [
    {
      context: 'hiv_cd4_very_low', applicabilityWeight: 1.0,
      questionAdditions: ['cd4_trend', 'oi_history', 'art_status'],
      examAdditions: ['oral_hair_leukoplakia', 'skin_ks'],
      investigationAdditions: ['cd4', 'viral_load', 'lactate'],
      activationThresholdDelta: -0.15,
      treatmentAdditions: [{ drugId: 'prednisone', line: 1, notes: 'Add if PaO2 <70: prednisone 40mg BD d1-5, 40mg OD d6-10, 20mg OD d11-21' }],
      clinicalNotes: 'HIV-PCP: CD4<100 highest. ART within 2wk. Watch IRIS.',
    },
    {
      context: 'transplant', applicabilityWeight: 0.9,
      questionAdditions: ['transplant_type', 'immunosuppression_regimen', 'rejection_history'],
      investigationAdditions: ['cmv_pcr', 'ebv_pcr'],
      treatmentAdditions: [{ drugId: 'tmp_smx', line: 1, notes: 'All transplant on TMP-SMX prophylaxis' }],
      differentialAdditions: [{ diseaseId: 'cmv_pneumonitis', weight: 0.4 }],
      clinicalNotes: 'Transplant PCP: breakthrough if not on prophylaxis. CMV coinfection common.',
    },
    {
      context: 'autoimmune_steroids', applicabilityWeight: 0.8,
      questionAdditions: ['steroid_dose', 'steroid_duration', 'other_immunosuppressants'],
      differentialAdditions: [{ diseaseId: 'bacterial_pneumonia', weight: 0.4 }],
      clinicalNotes: 'Steroid PCP: typically >20mg prednisone >4wk. Prophylaxis indicated.',
    },
    {
      context: 'oncology_chemo', applicabilityWeight: 0.7,
      questionAdditions: ['chemo_regimen', 'neutrophil_count', 'lymphocyte_count'],
      differentialAdditions: [{ diseaseId: 'chemo_pneumonitis', weight: 0.4 }, { diseaseId: 'bacterial_pneumonia', weight: 0.3 }],
    },
    {
      context: 'icu_ventilated', applicabilityWeight: 0.8,
      ...ICU_VENT_ADAPT_SHARED,
      treatmentAdditions: [{ drugId: 'tmp_smx_iv', line: 1, notes: 'IV TMP-SMX if unable PO' }],
      clinicalNotes: 'ICU PCP: High mortality. Consider adjunctive steroids.',
    },
    {
      context: 'resource_low', applicabilityWeight: 0.6,
      investigationRemovals: ['bronchoscopy', 'pcr_pcp', 'ct_chest'],
      investigationAdditions: ['clinical_diagnosis', 'cxr_if_available', 'ldh_elevated'],
      clinicalNotes: 'Resource-limited: clinical diagnosis + LDH. TMP-SMX treatment.',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// PROFILE 7: CROUP
// ═══════════════════════════════════════════════════════════════
export const CROUP_CONTEXT_PROFILE: ContextAwareDiseaseProfile = {
  diseaseId: 'croup',
  diseaseName: 'Croup (Laryngotracheobronchitis)',
  master: {
    organism: 'Parainfluenza virus, RSV, influenza, adenovirus',
    transmission: 'Droplet / contact',
    corePathophysiology: 'Subglottic inflammation and edema → upper airway obstruction → stridor, barking cough',
    naturalHistory: 'Worse at night. Peaks d2-3. Self-limiting 3-7d. <5% require admission.',
    universalComplications: ['Respiratory failure', 'Intubation', 'Pneumonia', 'Bacterial tracheitis'],
    universalMechanisms: ['airway_irritation', 'upper_airway_stimulation'],
    universalPhenotypes: ['cough_barking', 'cough_croup'],
  },
  baseline: {
    epidemiology: 'Most common in children 6mo-3yr. Autumn/winter.',
    symptomOnset: 'Acute, worse at night',
    typicalPresentation: 'Barking cough, inspiratory stridor, hoarse voice, low-grade fever, worse at night',
    discriminatingFeatures: ['barking_cough', 'stridor_inspiratory', 'child_<5', 'fever', 'worse_night', 'westley_score'],
    basePrevalence: 0.08,
    agePrevalenceModifiers: { infant: 0.1, child: 0.12, toddler: 0.15 },
    typicalPhenotypes: ['cough_barking', 'cough_croup'],
    commonMechanisms: ['airway_irritation', 'upper_airway_stimulation'],
    requiredQuestions: ['cough_stridor', 'cough_fever', 'cough_vaccination_history', 'drooling', 'toxicity'],
    requiredExams: ['ent_exam', 'oxygen_saturation', 'stridor_assessment', 'respiratory_rate', 'chest_indrawing', 'westley_score'],
    initialInvestigations: [],
    confirmatoryInvestigations: ['lateral_neck_xray'],
    treatmentLines: [
      { line: 1, regimen: 'Single dose dexamethasone 0.15-0.6mg/kg PO', medications: ['dexamethasone'], duration: '1 dose' },
      { line: 2, regimen: 'Nebulized epinephrine for moderate-severe', medications: ['epinephrine_neb'], duration: 'PRN' },
      { line: 3, regimen: 'ICU: Heliox, intubation if failure', medications: [], duration: 'Variable' },
    ],
    supportiveCare: ['comfort_position', 'avoid_agitation', 'cool_mist', 'antipyretics'],
    disposition: { admissionRequired: false, icuRequired: false, specialty: 'pediatrics', followUp: '1wk' },
    monitoring: [
      { parameter: 'Westley croup score', frequency: '1 hourly if moderate', target: 'Improving' },
      { parameter: 'Oxygen saturation', frequency: 'Continuous if stridor at rest', target: '>= 92%' },
    ],
    urgency: 'orange',
    activationThreshold: 0.3,
    guidelines: ['who_croup_2024'],
    hmisEvents: ['croup_severity_score'],
  },
  ageGroupToContext: {
    neonate: 'pediatric_infant', infant: 'pediatric_infant', toddler: 'pediatric_toddler',
    preschool: 'pediatric_preschool', school_age: 'pediatric_school',
  },
  relevantContexts: ['pediatric_infant', 'pediatric_toddler', 'pediatric_preschool'],
  excludedContexts: ['adult_immunocompetent', 'elderly_\u003e65'],
  contextOverrides: [
    {
      context: 'pediatric_infant', applicabilityWeight: 1.0,
      ...PEDIATRIC_AGE_ADAPT,
      examAdditions: ['westley_score', 'stridor_severity_grading'],
      dispositionChanges: { admissionRequired: false, icuRequired: false, specialtyReferral: 'pediatric_if_severe' },
      differentialAdditions: [{ diseaseId: 'epiglottitis', weight: 0.6 }, { diseaseId: 'bacterial_tracheitis', weight: 0.5 }],
      clinicalNotes: 'Infant croup: Narrow airway — more severe. Always assess Westley score.',
    },
    {
      context: 'pediatric_toddler', applicabilityWeight: 1.0,
      ...PEDIATRIC_TODDLER_ADAPT,
      clinicalNotes: 'Typical age. Steroids and observation mainstay.',
    },
    {
      context: 'icu_ventilated', applicabilityWeight: 0.5,
      ...ICU_VENT_ADAPT_SHARED,
      clinicalNotes: 'Croup intubation: small ETT. Extubation when leak present.',
    },
    {
      context: 'resource_low', applicabilityWeight: 0.6,
      investigationRemovals: ['lateral_neck_xray'],
      clinicalNotes: 'Resource-limited: clinical diagnosis. Dexamethasone if available.',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// PROFILE 8: INFLUENZA
// ═══════════════════════════════════════════════════════════════
export const INFLUENZA_CONTEXT_PROFILE: ContextAwareDiseaseProfile = {
  diseaseId: 'influenza',
  diseaseName: 'Influenza',
  master: {
    organism: 'Influenza A, B',
    transmission: 'Droplet / airborne / fomite',
    corePathophysiology: 'Respiratory epithelial cell infection → inflammation → ciliary dysfunction → secondary infection risk',
    naturalHistory: 'Incubation 1-4d. Acute 3-7d. Cough may persist 2wk.',
    universalComplications: ['Pneumonia (viral or secondary bacterial)', 'ARDS', 'Myocarditis', 'Encephalitis', 'Death'],
    universalMechanisms: ['alveolar_inflammation'],
    universalPhenotypes: ['cough_acute_dry'],
  },
  baseline: {
    epidemiology: 'Seasonal epidemics. 3-5M severe cases/yr.',
    symptomOnset: 'Abrupt onset 1-4d incubation',
    typicalPresentation: 'Abrupt high fever, severe myalgia, dry cough, headache, sore throat, fatigue',
    discriminatingFeatures: ['high_fever', 'myalgia', 'seasonal', 'rapid_onset', 'cough', 'epidemic_contact'],
    basePrevalence: 0.1,
    agePrevalenceModifiers: { child: 0.12, adult: 0.1, older_adult: 0.08 },
    typicalPhenotypes: ['cough_acute_dry'],
    commonMechanisms: ['alveolar_inflammation'],
    requiredQuestions: ['cough_fever', 'cough_duration', 'cough_body_aches', 'cough_contacts', 'vaccination_status'],
    requiredExams: ['chest_auscultation', 'oxygen_saturation', 'temperature'],
    initialInvestigations: ['rapid_test'],
    confirmatoryInvestigations: ['pcr_influenza'],
    treatmentLines: [
      { line: 1, regimen: 'Supportive care, antipyretics', medications: ['paracetamol', 'ibuprofen'], duration: '3-7d' },
      { line: 2, regimen: 'Oseltamivir if high-risk or severe', medications: ['oseltamivir'], duration: '5d' },
      { line: 3, regimen: 'ICU care for severe disease', medications: ['oseltamivir'], duration: '5d+' },
    ],
    supportiveCare: ['rest', 'hydration', 'antipyretics', 'isolation'],
    disposition: { admissionRequired: false, icuRequired: false, specialty: 'primary_care', followUp: '1wk if not improving' },
    monitoring: [
      { parameter: 'Temperature', frequency: '6 hourly', target: '< 38°C' },
      { parameter: 'Oxygen saturation', frequency: 'If dyspnea', target: '>= 92%' },
    ],
    urgency: 'yellow',
    activationThreshold: 0.2,
    guidelines: ['who_influenza_2024'],
    hmisEvents: ['influenza_notification_if_severe'],
  },
  ageGroupToContext: {
    infant: 'pediatric_infant', toddler: 'pediatric_toddler', preschool: 'pediatric_preschool',
    school_age: 'pediatric_school', adolescent: 'pediatric_adolescent',
    adult: 'adult_immunocompetent', older_adult: 'elderly_\u003e65',
  },
  relevantContexts: [],
  excludedContexts: [],
  contextOverrides: [
    {
      context: 'elderly_\u003e65', applicabilityWeight: 1.0,
      ...ELDERLY_ADAPT_P2,
      treatmentAdditions: [{ drugId: 'oseltamivir', line: 1, notes: 'All elderly: treat regardless of duration' }],
      activationThresholdDelta: -0.1,
      differentialAdditions: [{ diseaseId: 'bacterial_pneumonia', weight: 0.5 }],
      clinicalNotes: 'Elderly influenza: atypical — confusion, falls, no fever. High complication rate.',
    },
    {
      context: 'pregnancy', applicabilityWeight: 1.0,
      ...PREGNANCY_CXR_SAFE_P2,
      treatmentAdditions: [{ drugId: 'oseltamivir', line: 1, notes: 'Safe and recommended in pregnancy' }],
      monitoringAdditions: ['fetal_assessment'],
      clinicalNotes: 'Pregnancy influenza: high risk severe. Treat early with oseltamivir.',
    },
    {
      context: 'asthma_known', applicabilityWeight: 0.8,
      monitoringAdditions: ['peak_flow_daily', 'asthma_symptom_diary'],
      treatmentAdditions: [{ drugId: 'oseltamivir', line: 1, notes: 'Asthma + flu: higher exacerbation risk' }],
      clinicalNotes: 'Asthma + influenza: high risk of exacerbation. Early antivirals.',
    },
    {
      context: 'copd_known', applicabilityWeight: 0.8,
      monitoringAdditions: ['peak_flow', 'sputum_monitoring'],
      treatmentAdditions: [{ drugId: 'oseltamivir', line: 1, notes: 'COPD + flu: high exacerbation risk' }],
      differentialAdditions: [{ diseaseId: 'copd_exacerbation', weight: 0.5 }],
    },
    {
      context: 'resource_low', applicabilityWeight: 0.6,
      investigationRemovals: ['rapid_test', 'pcr_influenza'],
      clinicalNotes: 'Resource-limited: clinical diagnosis during epidemic. Oseltamivir if available.',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// PROFILE 9: ACUTE BRONCHITIS
// ═══════════════════════════════════════════════════════════════
export const BRONCHITIS_CONTEXT_PROFILE: ContextAwareDiseaseProfile = {
  diseaseId: 'acute_bronchitis',
  diseaseName: 'Acute Bronchitis',
  master: {
    organism: 'Viral (90%): influenza, RSV, adenovirus, rhinovirus; Bacterial <10%',
    transmission: 'Droplet / contact',
    corePathophysiology: 'Acute inflammation of bronchial mucosa → mucus hypersecretion, cough, sputum production',
    naturalHistory: 'Self-limiting 1-3wk. Cough may persist 3wk.',
    universalComplications: ['Pneumonia (rare)', 'Exacerbation of underlying lung disease'],
    universalMechanisms: ['airway_irritation', 'mucus_hypersecretion'],
    universalPhenotypes: ['cough_acute_productive', 'cough_acute_dry'],
  },
  baseline: {
    epidemiology: 'Most common acute cough cause in adults.',
    symptomOnset: 'Acute 1-3d after URI',
    typicalPresentation: 'Cough (dry then productive), low-grade fever, sore throat, coryza, wheeze, self-limiting',
    discriminatingFeatures: ['acute_onset', 'viral_prodrome', 'self_limiting', 'no_consolidation', 'clear_sputum'],
    basePrevalence: 0.25,
    agePrevalenceModifiers: { child: 0.3, adult: 0.25, older_adult: 0.15 },
    typicalPhenotypes: ['cough_acute_productive', 'cough_acute_dry'],
    commonMechanisms: ['airway_irritation', 'mucus_hypersecretion'],
    requiredQuestions: ['cough_duration', 'cough_sputum', 'cough_fever', 'cough_dyspnea', 'cough_smoking'],
    requiredExams: ['chest_auscultation', 'oxygen_saturation', 'temperature'],
    initialInvestigations: [],
    confirmatoryInvestigations: [],
    treatmentLines: [
      { line: 1, regimen: 'Supportive care — no antibiotics routinely', medications: [], duration: 'Symptom-based' },
      { line: 2, regimen: 'Bronchodilators if wheeze', medications: ['salbutamol_inhaler'], duration: 'PRN' },
      { line: 3, regimen: 'Antibiotics only if pertussis confirmed', medications: ['azithromycin'], duration: '5d' },
    ],
    supportiveCare: ['rest', 'hydration', 'honey', 'antipyretics'],
    disposition: { admissionRequired: false, icuRequired: false, specialty: 'primary_care', followUp: '2wk if not resolved' },
    monitoring: [
      { parameter: 'Temperature', frequency: 'PRN', target: '< 38°C' },
      { parameter: 'Cough', frequency: 'Self-report', target: 'Improving by 3wk' },
    ],
    urgency: 'green',
    activationThreshold: 0.15,
    guidelines: ['nice_antibiotic_guidance'],
    hmisEvents: [],
  },
  ageGroupToContext: {
    infant: 'pediatric_infant', toddler: 'pediatric_toddler', preschool: 'pediatric_preschool',
    school_age: 'pediatric_school', adolescent: 'pediatric_adolescent',
    adult: 'adult_immunocompetent', older_adult: 'elderly_\u003e65',
  },
  relevantContexts: [],
  excludedContexts: [],
  contextOverrides: [
    {
      context: 'copd_known', applicabilityWeight: 1.0,
      questionAdditions: ['sputum_change', 'dyspnea_worsening', 'rescue_inhaler_use'],
      differentialAdditions: [{ diseaseId: 'copd_exacerbation', weight: 0.6 }],
      activationThresholdDelta: -0.05,
      clinicalNotes: 'COPD + bronchitis: exacerbation threshold low. Watch sputum purulence.',
    },
    {
      context: 'elderly_\u003e65', applicabilityWeight: 0.7,
      ...ELDERLY_ADAPT_P2,
      differentialAdditions: [{ diseaseId: 'pneumonia', weight: 0.4 }],
      clinicalNotes: 'Elderly bronchitis: low threshold for CXR. May be pneumonia.',
    },
    {
      context: 'resource_low', applicabilityWeight: 0.5,
      clinicalNotes: 'Antibiotic stewardship: most viral. Avoid antibiotics unless signs of pneumonia.',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// PROFILE 10: GASTROESOPHAGEAL REFLUX (GERD/LPR)
// ═══════════════════════════════════════════════════════════════
export const GERD_CONTEXT_PROFILE: ContextAwareDiseaseProfile = {
  diseaseId: 'gerd',
  diseaseName: 'GERD / Laryngopharyngeal Reflux',
  master: {
    organism: 'N/A',
    transmission: 'N/A',
    corePathophysiology: 'Reflux of gastric contents → esophageal mucosal injury / laryngeal irritation → vagal reflex cough',
    naturalHistory: 'Chronic. Worse with meals, supine position. Responds to PPI.',
    universalComplications: ['Reflux esophagitis', 'Stricture', 'Barrett esophagus', 'Aspiration pneumonia'],
    universalMechanisms: ['vagal_stimulation', 'upper_airway_stimulation'],
    universalPhenotypes: ['cough_gerd_related', 'cough_chronic', 'cough_nocturnal'],
  },
  baseline: {
    epidemiology: 'Most common cause of chronic cough (10-40%).',
    symptomOnset: 'Chronic, intermittent',
    typicalPresentation: 'Chronic cough, worse after meals/lying down, heartburn, regurgitation, throat clearing, dysphonia',
    discriminatingFeatures: ['heartburn', 'regurgitation', 'worse_lying', 'nocturnal', 'voice_change', 'ppi_response'],
    basePrevalence: 0.1,
    agePrevalenceModifiers: { adult: 0.12, older_adult: 0.1 },
    typicalPhenotypes: ['cough_gerd_related', 'cough_chronic', 'cough_nocturnal'],
    commonMechanisms: ['vagal_stimulation', 'upper_airway_stimulation'],
    requiredQuestions: ['cough_heartburn', 'cough_timing', 'cough_medication_list', 'voice_change', 'globus', 'dysphagia'],
    requiredExams: ['ent_exam', 'chest_auscultation', 'bmi'],
    initialInvestigations: ['ppi_trial'],
    confirmatoryInvestigations: ['ph_monitoring', 'laryngoscopy', 'upper_endoscopy'],
    treatmentLines: [
      { line: 1, regimen: 'PPI trial (omeprazole 20mg BD) 4-8wk', medications: ['omeprazole'], duration: '4-8wk' },
      { line: 2, regimen: 'Double-dose PPI + lifestyle modifications', medications: ['omeprazole_high_dose', 'lansoprazole'], duration: '8-12wk' },
      { line: 3, regimen: 'Anti-reflux surgery (fundoplication)', medications: [], duration: 'Surgical' },
    ],
    supportiveCare: ['head_of_bed_elevation', 'avoid_late_meals', 'weight_loss', 'avoid_refluxogenic_foods'],
    disposition: { admissionRequired: false, icuRequired: false, specialty: 'gastroenterology', followUp: '8wk' },
    monitoring: [
      { parameter: 'Symptom response', frequency: '4wk', target: '50% reduction' },
      { parameter: 'PPI compliance', frequency: 'Each visit', target: 'Taking as prescribed' },
    ],
    urgency: 'green',
    activationThreshold: 0.3,
    guidelines: ['acg_gerd_guidelines'],
    hmisEvents: [],
  },
  ageGroupToContext: {
    neonate: 'pediatric_infant', infant: 'pediatric_infant', toddler: 'pediatric_toddler',
    preschool: 'pediatric_preschool', adolescent: 'pediatric_adolescent',
    adult: 'adult_immunocompetent', older_adult: 'elderly_\u003e65',
  },
  relevantContexts: [],
  excludedContexts: [],
  contextOverrides: [
    {
      context: 'pediatric_infant', applicabilityWeight: 1.0,
      questionAdditions: ['regurgitation_volume', 'fussiness_after_feeds', 'arching', 'weight_gain'],
      investigationRemovals: ['ph_monitoring', 'laryngoscopy'],
      treatmentAdditions: [{ drugId: 'thickened_feeds', line: 1, notes: 'First-line in infants' }],
      differentialAdditions: [{ diseaseId: 'cow_milk_protein_allergy', weight: 0.4 }, { diseaseId: 'tracheoesophageal_fistula', weight: 0.3 }],
      clinicalNotes: 'Infant GERD: Most resolve spontaneously. PPIs not first-line in neonates.',
    },
    {
      context: 'pregnancy', applicabilityWeight: 0.8,
      ...PREGNANCY_CXR_SAFE_P2,
      treatmentAdditions: [{ drugId: 'omeprazole', line: 1, notes: 'Safe in pregnancy' }],
      clinicalNotes: 'Pregnancy GERD: common. Lifestyle first. PPIs safe.',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// PROFILE 11: UACS (Upper Airway Cough Syndrome)
// ═══════════════════════════════════════════════════════════════
export const UACS_CONTEXT_PROFILE: ContextAwareDiseaseProfile = {
  diseaseId: 'uacs',
  diseaseName: 'Upper Airway Cough Syndrome',
  master: {
    organism: 'N/A (allergic, non-allergic, sinusitis)',
    transmission: 'N/A',
    corePathophysiology: 'Postnasal drip of mucus → laryngeal/hypopharyngeal irritation → cough reflex',
    naturalHistory: 'Chronic, intermittent, seasonal. Responds to treatment of underlying cause.',
    universalComplications: ['Chronic sinusitis', 'Otitis media', 'Sleep disturbance'],
    universalMechanisms: ['upper_airway_stimulation'],
    universalPhenotypes: ['cough_uacs_postnasal', 'cough_chronic', 'cough_acute_dry'],
  },
  baseline: {
    epidemiology: 'Most common cause of chronic cough (20-40%).',
    symptomOnset: 'Chronic or seasonal',
    typicalPresentation: 'Chronic cough, throat clearing, nasal congestion, postnasal drip sensation, worse morning',
    discriminatingFeatures: ['nasal_symptoms', 'throat_clearing', 'postnasal_drip', 'seasonal', 'morning_cough'],
    basePrevalence: 0.1,
    agePrevalenceModifiers: { adult: 0.1, child: 0.08 },
    typicalPhenotypes: ['cough_uacs_postnasal', 'cough_chronic', 'cough_acute_dry'],
    commonMechanisms: ['upper_airway_stimulation'],
    requiredQuestions: ['cough_nasal_symptoms', 'cough_timing', 'allergy_history', 'seasonal_pattern', 'cough_heartburn'],
    requiredExams: ['ent_exam', 'nasal_endoscopy', 'throat_exam'],
    initialInvestigations: ['allergy_test', 'sinus_xray'],
    confirmatoryInvestigations: ['ct_sinus', 'nasal_endoscopy'],
    treatmentLines: [
      { line: 1, regimen: 'First-generation antihistamine + decongestant', medications: ['diphenhydramine', 'pseudoephedrine'], duration: '2-4wk' },
      { line: 2, regimen: 'Intranasal corticosteroid', medications: ['fluticasone_nasal'], duration: '4-8wk' },
      { line: 3, regimen: 'Intranasal antihistamine', medications: ['azelastine_nasal'], duration: '4-8wk' },
    ],
    supportiveCare: ['nasal_saline_irrigation', 'humidification', 'allergen_avoidance'],
    disposition: { admissionRequired: false, icuRequired: false, specialty: 'ent', followUp: '4wk' },
    monitoring: [
      { parameter: 'Symptom score', frequency: '2wk', target: 'Improvement' },
    ],
    urgency: 'green',
    activationThreshold: 0.3,
    guidelines: ['chest_guideline_uacs'],
    hmisEvents: [],
  },
  ageGroupToContext: {
    preschool: 'pediatric_preschool', school_age: 'pediatric_school', adolescent: 'pediatric_adolescent',
    adult: 'adult_immunocompetent', older_adult: 'elderly_\u003e65',
  },
  relevantContexts: [],
  excludedContexts: ['pediatric_infant', 'pediatric_toddler'],
  contextOverrides: [
    {
      context: 'pediatric_school', applicabilityWeight: 0.8,
      questionAdditions: ['snoring', 'adenoid_symptoms', 'school_performance'],
      differentialAdditions: [{ diseaseId: 'adenoid_hypertrophy', weight: 0.4 }],
      treatmentAdditions: [{ drugId: 'intranasal_steroid', line: 1, notes: 'First-line in children' }],
    },
    {
      context: 'pregnancy', applicabilityWeight: 0.7,
      treatmentAdditions: [{ drugId: 'nasal_saline', line: 1, notes: 'First-line in pregnancy. Avoid decongestants.' }],
      contraindications: ['pseudoephedrine'],
    },
    {
      context: 'elderly_\u003e65', applicabilityWeight: 0.7,
      ...ELDERLY_ADAPT_P2,
      interactions: ['antihistamines_may_confuse'],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// PROFILE 12: ACE INHIBITOR COUGH
// ═══════════════════════════════════════════════════════════════
export const ACEI_COUGH_CONTEXT_PROFILE: ContextAwareDiseaseProfile = {
  diseaseId: 'ace_inhibitor_cough',
  diseaseName: 'ACE Inhibitor Cough',
  master: {
    organism: 'N/A',
    transmission: 'N/A',
    corePathophysiology: 'ACE inhibition → bradykinin accumulation in lungs → cough receptor stimulation',
    naturalHistory: 'Onset days-months after starting ACEi. Reverses 1-4wk after discontinuation.',
    universalComplications: ['Non-compliance due to cough', 'Missed serious diagnosis'],
    universalMechanisms: ['chemical_stimulation'],
    universalPhenotypes: ['cough_ace_inhibitor', 'cough_chronic'],
  },
  baseline: {
    epidemiology: '5-35% of patients on ACE inhibitors.',
    symptomOnset: '1wk-6mo after ACEi start',
    typicalPresentation: 'Persistent dry cough, non-productive, no other symptoms, normal chest exam',
    discriminatingFeatures: ['on_ace_inhibitor', 'dry_cough', 'resolves_on_stop', 'normal_exam', 'no_other_symptoms'],
    basePrevalence: 0.05,
    agePrevalenceModifiers: { adult: 0.05, older_adult: 0.08 },
    typicalPhenotypes: ['cough_ace_inhibitor', 'cough_chronic'],
    commonMechanisms: ['chemical_stimulation'],
    requiredQuestions: ['cough_ace_inhibitor', 'cough_medication_list', 'cough_duration', 'cough_sputum'],
    requiredExams: ['chest_auscultation', 'oxygen_saturation'],
    initialInvestigations: [],
    confirmatoryInvestigations: [],
    treatmentLines: [
      { line: 1, regimen: 'Discontinue ACE inhibitor (switch to ARB)', medications: ['arb_substitution'], duration: 'N/A' },
      { line: 2, regimen: 'Trial of cromolyn if ACEi must continue', medications: ['cromolyn'], duration: 'While on ACEi' },
    ],
    supportiveCare: ['cough_suppressants_if_troublesome', 'reassurance'],
    disposition: { admissionRequired: false, icuRequired: false, specialty: 'primary_care', followUp: '4wk' },
    monitoring: [
      { parameter: 'Cough resolution', frequency: '2wk post-switch', target: 'Resolved within 4wk' },
      { parameter: 'Blood pressure', frequency: '1wk post-switch', target: 'Controlled on ARB' },
    ],
    urgency: 'green',
    activationThreshold: 0.5,
    guidelines: [],
    hmisEvents: [],
  },
  ageGroupToContext: {
    adult: 'adult_immunocompetent', older_adult: 'elderly_\u003e65',
  },
  relevantContexts: ['adult_immunocompetent', 'elderly_\u003e65', 'heart_failure_known', 'renal_failure', 'diabetes'],
  excludedContexts: ['pediatric_infant', 'pediatric_toddler', 'pediatric_preschool', 'pediatric_school', 'pediatric_adolescent'],
  contextOverrides: [
    {
      context: 'heart_failure_known', applicabilityWeight: 1.0,
      treatmentAdditions: [{ drugId: 'arb_substitution', line: 1, notes: 'Switch to ARB for HF' }],
      monitoringAdditions: ['hf_symptoms_monitoring', 'weight_daily'],
      clinicalNotes: 'HF patients: ACEi contraindicated if persistent cough. ARB is safe alternative.',
    },
    {
      context: 'renal_failure', applicabilityWeight: 0.8,
      ...RENAL_ADAPT_P2,
      treatmentAdditions: [{ drugId: 'arb_substitution', line: 1, notes: 'Monitor K+ and Cr after switch' }],
      clinicalNotes: 'Renal: ARB also nephroprotective. Monitor potassium.',
    },
    {
      context: 'diabetes', applicabilityWeight: 0.7,
      ...DIABETES_ADAPT_P2,
      treatmentAdditions: [{ drugId: 'arb_substitution', line: 1, notes: 'ARB also renoprotective in diabetes' }],
    },
    {
      context: 'elderly_\u003e65', applicabilityWeight: 0.8,
      ...ELDERLY_ADAPT_P2,
      clinicalNotes: 'Elderly: higher incidence. ARB switch well tolerated.',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// PROFILE 13: POST-INFECTIOUS COUGH
// ═══════════════════════════════════════════════════════════════
export const POSTINFECTIOUS_CONTEXT_PROFILE: ContextAwareDiseaseProfile = {
  diseaseId: 'post_infectious_cough',
  diseaseName: 'Post-Infectious Cough',
  master: {
    organism: 'Post-viral (URI trigger)',
    transmission: 'N/A',
    corePathophysiology: 'Transient airway hyperresponsiveness and inflammation persisting after acute infection clears',
    naturalHistory: 'Self-limiting 3-8wk after URI. Resolves spontaneously.',
    universalComplications: ['Sleep disturbance', 'Reduced quality of life'],
    universalMechanisms: ['airway_irritation', 'bronchospasm'],
    universalPhenotypes: ['cough_post_infectious', 'cough_acute_dry'],
  },
  baseline: {
    epidemiology: '10-20% of post-URI patients. Common cause of subacute cough.',
    symptomOnset: 'Following acute URI, cough persists 3-8wk',
    typicalPresentation: 'Persistent dry cough after URI, often self-limiting, normal exam, no systemic symptoms',
    discriminatingFeatures: ['post_viral', 'duration_3to8weeks', 'self_limiting', 'normal_cxr', 'no_systemic_symptoms'],
    basePrevalence: 0.08,
    agePrevalenceModifiers: { adult: 0.1, child: 0.06 },
    typicalPhenotypes: ['cough_post_infectious', 'cough_acute_dry'],
    commonMechanisms: ['airway_irritation', 'bronchospasm'],
    requiredQuestions: ['cough_duration', 'cough_sputum', 'prior_respiratory_infection', 'cough_fever_resolved'],
    requiredExams: ['chest_auscultation', 'ent_exam'],
    initialInvestigations: [],
    confirmatoryInvestigations: [],
    treatmentLines: [
      { line: 1, regimen: 'Reassurance, monitoring', medications: [], duration: 'Symptom-based' },
      { line: 2, regimen: 'Inhaled ipratropium or beta-agonist if bothersome', medications: ['ipratropium', 'salbutamol'], duration: '2-4wk PRN' },
      { line: 3, regimen: 'Consider ICS if features of asthma', medications: ['budesonide_inhaler'], duration: '4wk trial' },
    ],
    supportiveCare: ['honey', 'hydration', 'avoid_irritants'],
    disposition: { admissionRequired: false, icuRequired: false, specialty: 'primary_care', followUp: '4wk if not resolved' },
    monitoring: [
      { parameter: 'Cough duration', frequency: 'Self-report', target: 'Resolved by 8wk' },
    ],
    urgency: 'green',
    activationThreshold: 0.3,
    guidelines: [],
    hmisEvents: [],
  },
  ageGroupToContext: {
    adult: 'adult_immunocompetent', child: 'pediatric_school', adolescent: 'pediatric_adolescent',
    older_adult: 'elderly_\u003e65',
  },
  relevantContexts: [],
  excludedContexts: [],
  contextOverrides: [
    {
      context: 'elderly_\u003e65', applicabilityWeight: 0.7,
      ...ELDERLY_ADAPT_P2,
      differentialAdditions: [{ diseaseId: 'pneumonia', weight: 0.3 }, { diseaseId: 'aspiration', weight: 0.3 }],
      clinicalNotes: 'Elderly: ensure CXR to rule out pneumonia before diagnosing post-infectious cough.',
    },
    {
      context: 'asthma_known', applicabilityWeight: 0.8,
      differentialAdditions: [{ diseaseId: 'asthma_exacerbation', weight: 0.5 }],
      treatmentAdditions: [{ drugId: 'ics_formoterol', line: 2, notes: 'Consider asthma exacerbation' }],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// PROFILE 14: ASPIRATION PNEUMONIA
// ═══════════════════════════════════════════════════════════════
export const ASPIRATION_PNA_CONTEXT_PROFILE: ContextAwareDiseaseProfile = {
  diseaseId: 'aspiration_pneumonia',
  diseaseName: 'Aspiration Pneumonia',
  master: {
    organism: 'Mixed oral anaerobes, gram-negatives, S. pneumoniae, H. influenzae',
    transmission: 'Aspiration of oropharyngeal/gastric contents',
    corePathophysiology: 'Aspiration of contents → chemical pneumonitis → secondary bacterial infection → pneumonia',
    naturalHistory: 'Acute to subacute. Dependent on aspiration volume and bacterial load.',
    universalComplications: ['Lung abscess', 'Empyema', 'Necrotizing pneumonia', 'Bronchopleural fistula', 'Death'],
    universalMechanisms: ['aspiration', 'alveolar_inflammation'],
    universalPhenotypes: ['cough_aspiration', 'cough_acute_productive'],
  },
  baseline: {
    epidemiology: 'Highest in elderly, CVA, dementia, alcoholism, GERD.',
    symptomOnset: 'Acute to subacute (hours to days after aspiration)',
    typicalPresentation: 'Cough after feeding, dysphagia, fever, hypoxia, right lower lobe infiltrate on CXR',
    discriminatingFeatures: ['aspiration_risk', 'dysphagia', 'neurological_disease', 'recurrent', 'rll_cavitary'],
    basePrevalence: 0.03,
    agePrevalenceModifiers: { older_adult: 0.08, infant: 0.04 },
    typicalPhenotypes: ['cough_aspiration', 'cough_acute_productive'],
    commonMechanisms: ['aspiration', 'alveolar_inflammation'],
    requiredQuestions: ['cough_feeding_difficulty', 'swallowing_assessment', 'neurological_history', 'recurrent_pneumonia', 'gerd_symptoms'],
    requiredExams: ['swallow_screening', 'chest_auscultation', 'neurological_exam', 'oxygen_saturation'],
    initialInvestigations: ['chest_xray', 'cbc', 'crp'],
    confirmatoryInvestigations: ['ct_chest', 'sputum_culture', 'bronchoscopy'],
    treatmentLines: [
      { line: 1, regimen: 'Amoxicillin-clavulanate or clindamycin', medications: ['amoxicillin_clavulanate', 'clindamycin'], duration: '7-10d' },
      { line: 2, regimen: 'Piperacillin-tazobactam if severe', medications: ['piperacillin_tazobactam'], duration: '10-14d' },
      { line: 3, regimen: 'Swallow assessment + feeding modification', medications: [], duration: 'Long-term' },
    ],
    supportiveCare: ['oxygen', 'iv_fluids', 'npo_if_aspirating', 'speech_therapy_swallow'],
    disposition: { admissionRequired: true, icuRequired: false, specialty: 'internal_medicine', followUp: '2wk' },
    monitoring: [
      { parameter: 'Oxygen saturation', frequency: '4 hourly', target: '>= 92%' },
      { parameter: 'Temperature', frequency: '6 hourly', target: '< 37.5°C' },
      { parameter: 'Swallow', frequency: 'Before discharge', target: 'Safe swallow' },
    ],
    urgency: 'orange',
    activationThreshold: 0.3,
    guidelines: ['ida_aspiration_pna'],
    hmisEvents: ['speech_therapy_referral', 'swallow_assessment'],
  },
  ageGroupToContext: {
    neonate: 'pediatric_infant', infant: 'pediatric_infant', toddler: 'pediatric_toddler',
    adult: 'adult_immunocompetent', older_adult: 'elderly_\u003e65',
  },
  relevantContexts: ['elderly_\u003e65', 'elderly_frail', 'cerebrovascular_disease', 'dementia', 'pediatric_infant'],
  excludedContexts: [],
  contextOverrides: [
    {
      context: 'elderly_\u003e65', applicabilityWeight: 1.0,
      ...ELDERLY_ADAPT_P2,
      questionAdditions: ['dental_status', 'oral_hygiene', 'feeding_assistance'],
      investigationAdditions: ['swallow_evaluation_speech', 'dental_referral'],
      treatmentAdditions: [{ drugId: 'oral_care_protocol', line: 1, notes: 'Oral care reduces aspiration risk in elderly' }],
      differentialAdditions: [{ diseaseId: 'heart_failure', weight: 0.4 }, { diseaseId: 'tb', weight: 0.3 }],
      clinicalNotes: 'Elderly aspiration: often silent. Right lower lobe most common.',
    },
    {
      context: 'cerebrovascular_disease', applicabilityWeight: 1.0,
      questionAdditions: ['stroke_type', 'time_since_stroke', 'dysphagia_screening'],
      examAdditions: ['neurological_exam_comprehensive', 'swallow_screening_bedside'],
      treatmentAdditions: [{ drugId: 'speech_therapy', line: 1, notes: 'All post-stroke dysphagia: speech therapy' }],
      clinicalNotes: 'CVA aspiration: 50% have dysphagia post-stroke. NBM until swallow assessment.',
    },
    {
      context: 'dementia', applicabilityWeight: 0.9,
      questionAdditions: ['dementia_stage', 'feeding_independence', 'carer_support'],
      clinicalNotes: 'Dementia aspiration: feeding assistance critical. Consider PEG if recurrent.',
    },
    {
      context: 'pediatric_infant', applicabilityWeight: 0.8,
      ...PEDIATRIC_AGE_ADAPT,
      differentialAdditions: [{ diseaseId: 'tracheoesophageal_fistula', weight: 0.5 }, { diseaseId: 'laryngeal_cleft', weight: 0.4 }],
      clinicalNotes: 'Infant aspiration: always rule out TOF, laryngeal cleft, GERD.',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// PROFILE 15: NON-TUBERCULOUS MYCOBACTERIA (NTM)
// ═══════════════════════════════════════════════════════════════
export const NTM_CONTEXT_PROFILE: ContextAwareDiseaseProfile = {
  diseaseId: 'ntm',
  diseaseName: 'Non-Tuberculous Mycobacteria',
  master: {
    organism: 'M. avium complex, M. abscessus, M. kansasii, others',
    transmission: 'Environmental (water, soil). Not person-to-person.',
    corePathophysiology: 'Chronic granulomatous infection of lungs, often in setting of bronchiectasis or COPD',
    naturalHistory: 'Slowly progressive over months-years. Cavitation, bronchiectasis, fibrosis.',
    universalComplications: ['Bronchiectasis', 'Cavitation', 'Respiratory failure', 'Disseminated disease'],
    universalMechanisms: ['alveolar_inflammation', 'mucus_hypersecretion'],
    universalPhenotypes: ['cough_chronic', 'cough_hemoptysis'],
  },
  baseline: {
    epidemiology: 'Increasing. Elderly, post-menopausal women, bronchiectasis, CF.',
    symptomOnset: 'Chronic, insidious over months',
    typicalPresentation: 'Chronic cough, sputum, fatigue, weight loss, hemoptysis, night sweats',
    discriminatingFeatures: ['chronic_cough', 'bronchiectasis', 'immunocompromised', 'slow_progression', 'thin_walled_cavities'],
    basePrevalence: 0.01,
    agePrevalenceModifiers: { older_adult: 0.03, adult: 0.01 },
    typicalPhenotypes: ['cough_chronic', 'cough_hemoptysis'],
    commonMechanisms: ['alveolar_inflammation', 'mucus_hypersecretion'],
    requiredQuestions: ['cough_duration', 'cough_sputum', 'cough_hemoptysis', 'cough_night_sweats', 'cough_weight_loss', 'bronchiectasis_history'],
    requiredExams: ['chest_auscultation', 'clubbing', 'lymph_nodes', 'weight_assessment'],
    initialInvestigations: ['ct_chest', 'sputum_afb_culture'],
    confirmatoryInvestigations: ['bronchoscopy', 'ntm_genotyping'],
    treatmentLines: [
      { line: 1, regimen: 'MAC: Clarithromycin + Rifampicin + Ethambutol', medications: ['clarithromycin', 'rifampicin', 'ethambutol'], duration: '12-18mo' },
      { line: 2, regimen: 'M. abscessus: Multi-drug per sensitivities', medications: ['amikacin', 'cefoxitin', 'azithromycin'], duration: '12-18mo' },
      { line: 3, regimen: 'Surgical resection for localized disease', medications: [], duration: 'Surgical' },
    ],
    supportiveCare: ['airway_clearance', 'pulmonary_rehab', 'nutritional_support'],
    disposition: { admissionRequired: false, icuRequired: false, specialty: 'pulmonology', followUp: 'Monthly' },
    monitoring: [
      { parameter: 'Sputum culture', frequency: 'Monthly', target: 'Culture conversion' },
      { parameter: 'CT chest', frequency: '6 monthly', target: 'Stable or improving' },
      { parameter: 'Hearing (amikacin)', frequency: 'Monthly', target: 'No hearing loss' },
    ],
    urgency: 'yellow',
    activationThreshold: 0.4,
    guidelines: ['ats_ntm_guidelines'],
    hmisEvents: ['ntm_notification'],
  },
  ageGroupToContext: {
    adult: 'adult_immunocompetent', older_adult: 'elderly_\u003e65',
  },
  relevantContexts: ['elderly_\u003e65', 'bronchiectasis', 'cystic_fibrosis', 'hiv_cd4_low'],
  excludedContexts: ['pediatric_infant', 'pediatric_toddler', 'pediatric_preschool', 'pediatric_school'],
  contextOverrides: [
    {
      context: 'hiv_cd4_low', applicabilityWeight: 1.0,
      ...HIV_CD4_LOW_ADAPT,
      investigationAdditions: ['cd4', 'blood_ntm_culture'],
      differentialAdditions: [{ diseaseId: 'tb', weight: 0.5 }, { diseaseId: 'fungal_pneumonia', weight: 0.3 }],
      clinicalNotes: 'HIV-NTM: MAC most common. Disseminated more likely with low CD4.',
    },
    {
      context: 'elderly_\u003e65', applicabilityWeight: 0.8,
      ...ELDERLY_ADAPT_P2,
      doseAdjustments: { all: 'monitor_for_drug_toxicity' },
      clinicalNotes: 'Elderly NTM: Tolerability concerns with multi-drug regimens.',
    },
    {
      context: 'bronchiectasis', applicabilityWeight: 0.9,
      investigationAdditions: ['ct_bronchiectasis_surveillance'],
      clinicalNotes: 'NTM + bronchiectasis: common association. Treat underlying bronchiectasis.',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// PROFILE 16: VOCAL CORD DYSFUNCTION
// ═══════════════════════════════════════════════════════════════
export const VCD_CONTEXT_PROFILE: ContextAwareDiseaseProfile = {
  diseaseId: 'vocal_cord_dysfunction',
  diseaseName: 'Vocal Cord Dysfunction',
  master: {
    organism: 'N/A',
    transmission: 'N/A',
    corePathophysiology: 'Paradoxical adduction of vocal cords during inspiration → upper airway obstruction, stridor, cough',
    naturalHistory: 'Episodic. Mimics asthma. Often misdiagnosed for years.',
    universalComplications: ['Unnecessary asthma treatment', 'Tracheostomy (rare)', 'Emergency visits'],
    universalMechanisms: ['bronchospasm', 'upper_airway_stimulation'],
    universalPhenotypes: ['cough_wheezy', 'cough_exercise_induced'],
  },
  baseline: {
    epidemiology: '2-3% of refractory asthma. Young females. Athletes.',
    symptomOnset: 'Episodic, sudden',
    typicalPresentation: 'Inspiratory stridor/wheeze, throat tightness, voice change, cough, no response to asthma tx',
    discriminatingFeatures: ['stridor_inspiratory', 'no_response_asthma_tx', 'voice_change', 'anxiety', 'young_female'],
    basePrevalence: 0.02,
    agePrevalenceModifiers: { adolescent: 0.04, adult: 0.03 },
    typicalPhenotypes: ['cough_wheezy', 'cough_exercise_induced'],
    commonMechanisms: ['bronchospasm', 'upper_airway_stimulation'],
    requiredQuestions: ['cough_wheeze_inspiratory', 'cough_voice_change', 'asthma_medication_response', 'exercise_triggers', 'anxiety'],
    requiredExams: ['laryngoscopy', 'spirometry_flow_loop', 'chest_auscultation'],
    initialInvestigations: ['laryngoscopy', 'spirometry_flow_loop'],
    confirmatoryInvestigations: ['provocative_challenge_laryngoscopy'],
    treatmentLines: [
      { line: 1, regimen: 'Speech therapy, breathing exercises', medications: [], duration: '4-8 sessions' },
      { line: 2, regimen: 'CPAP or heliox during acute episode', medications: [], duration: 'PRN' },
      { line: 3, regimen: 'Botulinum toxin if severe/refractory', medications: ['botox'], duration: '3-6mo' },
    ],
    supportiveCare: ['reassurance', 'avoid_triggers', 'anxiety_management'],
    disposition: { admissionRequired: false, icuRequired: false, specialty: 'ent', followUp: '2wk' },
    monitoring: [
      { parameter: 'Symptom episodes', frequency: 'Self-report', target: 'Decreasing frequency' },
    ],
    urgency: 'yellow',
    activationThreshold: 0.3,
    guidelines: [],
    hmisEvents: [],
  },
  ageGroupToContext: {
    adolescent: 'pediatric_adolescent', adult: 'adult_immunocompetent',
  },
  relevantContexts: ['adult_immunocompetent', 'pediatric_adolescent'],
  excludedContexts: ['pediatric_infant', 'pediatric_toddler', 'pediatric_preschool', 'pediatric_school', 'elderly_\u003e65'],
  contextOverrides: [
    {
      context: 'pediatric_adolescent', applicabilityWeight: 0.7,
      questionAdditions: ['sport_participation', 'performance_anxiety', 'peer_stress'],
      clinicalNotes: 'Adolescent VCD: high association with anxiety. Differentiate from exercise-induced asthma.',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// PROFILE 17: PULMONARY FIBROSIS / ILD
// ═══════════════════════════════════════════════════════════════
export const PULMONARY_FIBROSIS_CONTEXT_PROFILE: ContextAwareDiseaseProfile = {
  diseaseId: 'pulmonary_fibrosis',
  diseaseName: 'Pulmonary Fibrosis / Interstitial Lung Disease',
  master: {
    organism: 'N/A (UIP, NSIP, HP, CTD-ILD, etc.)',
    transmission: 'N/A',
    corePathophysiology: 'Progressive scarring of lung interstitium → restrictive physiology → impaired gas exchange → cough, dyspnea',
    naturalHistory: 'Progressive over years. Median survival 3-5yr in IPF.',
    universalComplications: ['Respiratory failure', 'Pulmonary hypertension', 'Lung cancer', 'Acute exacerbation', 'Death'],
    universalMechanisms: ['alveolar_inflammation'],
    universalPhenotypes: ['cough_chronic', 'cough_exercise_induced'],
  },
  baseline: {
    epidemiology: 'IPF 3-9/100k. Older adults, male, smokers.',
    symptomOnset: 'Insidious, progressive over months-years',
    typicalPresentation: 'Chronic dry cough, progressive exertional dyspnea, Velcro crackles, clubbing, restrictive PFTs',
    discriminatingFeatures: ['progressive_dyspnea', 'basal_crackles_velcro', 'clubbing', 'restrictive_pft', 'hrct_uip'],
    basePrevalence: 0.01,
    agePrevalenceModifiers: { older_adult: 0.03, adult: 0.01 },
    typicalPhenotypes: ['cough_chronic', 'cough_exercise_induced'],
    commonMechanisms: ['alveolar_inflammation'],
    requiredQuestions: ['cough_duration', 'cough_dyspnea', 'cough_smoking', 'occupational_exposure', 'connective_tissue_disease', 'family_history'],
    requiredExams: ['chest_auscultation', 'clubbing', 'oxygen_saturation_exertion', 'pft_screening'],
    initialInvestigations: ['ct_chest_hrct', 'pft'],
    confirmatoryInvestigations: ['bronchoscopy_bal', 'lung_biopsy'],
    treatmentLines: [
      { line: 1, regimen: 'Antifibrotic (pirfenidone or nintedanib)', medications: ['pirfenidone', 'nintedanib'], duration: 'Long-term' },
      { line: 2, regimen: 'Antacid therapy if GERD present', medications: ['omeprazole'], duration: 'Long-term' },
      { line: 3, regimen: 'Lung transplant evaluation', medications: [], duration: 'Surgical' },
    ],
    supportiveCare: ['oxygen_long_term', 'pulmonary_rehab', 'vaccinations', 'cough_suppressants'],
    disposition: { admissionRequired: false, icuRequired: false, specialty: 'pulmonology', followUp: '3-6 monthly' },
    monitoring: [
      { parameter: 'FVC', frequency: '3-6 monthly', target: 'Stable' },
      { parameter: 'DLCO', frequency: '6-12 monthly', target: 'Stable' },
      { parameter: '6-min walk', frequency: '6 monthly', target: 'Stable distance' },
      { parameter: 'Oxygen saturation', frequency: 'Each visit', target: '>= 90%' },
    ],
    urgency: 'orange',
    activationThreshold: 0.4,
    guidelines: ['ats_ers_ipf_guidelines'],
    hmisEvents: ['pulmonary_rehab_referral'],
  },
  ageGroupToContext: {
    adult: 'adult_immunocompetent', older_adult: 'elderly_\u003e65',
  },
  relevantContexts: ['elderly_\u003e65', 'autoimmune_steroids'],
  excludedContexts: ['pediatric_infant', 'pediatric_toddler', 'pediatric_preschool', 'pediatric_school'],
  contextOverrides: [
    {
      context: 'elderly_\u003e65', applicabilityWeight: 1.0,
      ...ELDERLY_ADAPT_P2,
      doseAdjustments: { pirfenidone: 'lower_dose_if_tolerability_issues' },
      clinicalNotes: 'Elderly IPF: antifibrotic tolerability challenging. Monitor for GI side effects.',
    },
    {
      context: 'autoimmune_steroids', applicabilityWeight: 0.9,
      questionAdditions: ['ctd_type', 'steroid_dose', 'other_immunomodulators'],
      differentialAdditions: [{ diseaseId: 'ctd_ild', weight: 0.6 }, { diseaseId: 'hp', weight: 0.4 }],
      clinicalNotes: 'CTD-ILD: Consider connective tissue disease evaluation.',
    },
    {
      context: 'heart_failure_known', applicabilityWeight: 0.7,
      differentialAdditions: [{ diseaseId: 'heart_failure', weight: 0.5 }],
      clinicalNotes: 'Differentiate HF from ILD: BNP, echo, HRCT.',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// PROFILE 18: CYSTIC FIBROSIS
// ═══════════════════════════════════════════════════════════════
export const CYSTIC_FIBROSIS_CONTEXT_PROFILE: ContextAwareDiseaseProfile = {
  diseaseId: 'cystic_fibrosis',
  diseaseName: 'Cystic Fibrosis',
  master: {
    organism: 'CFTR mutation → defective chloride channel',
    transmission: 'Autosomal recessive',
    corePathophysiology: 'CFTR mutation → thick mucus → impaired mucociliary clearance → chronic infection → bronchiectasis → respiratory failure',
    naturalHistory: 'Progressive. Median survival ~50yr. Lung disease main cause of morbidity/mortality.',
    universalComplications: ['Bronchiectasis', 'Recurrent pneumonia', 'Respiratory failure', 'Cor pulmonale', 'CFRD', 'Liver disease'],
    universalMechanisms: ['mucus_hypersecretion', 'alveolar_inflammation'],
    universalPhenotypes: ['cough_chronic', 'cough_failure_to_thrive', 'cough_acute_productive'],
  },
  baseline: {
    epidemiology: '1/3000-4000 births. Most common in Caucasian populations.',
    symptomOnset: 'Childhood, often infancy',
    typicalPresentation: 'Chronic productive cough, recurrent pneumonia, failure to thrive, steatorrhea, salty skin',
    discriminatingFeatures: ['childhood_onset', 'recurrent_infections', 'failure_to_thrive', 'sweat_test_positive', 'cf_mutation'],
    basePrevalence: 0.001,
    agePrevalenceModifiers: { infant: 0.003, child: 0.003, adolescent: 0.002 },
    typicalPhenotypes: ['cough_chronic', 'cough_failure_to_thrive', 'cough_acute_productive'],
    commonMechanisms: ['mucus_hypersecretion', 'alveolar_inflammation'],
    requiredQuestions: ['cough_duration', 'cough_recurrent_infections', 'cough_failure_to_thrive', 'steatorrhea', 'family_history', 'sweat_test_result'],
    requiredExams: ['chest_auscultation', 'clubbing', 'anthropometry', 'oxygen_saturation'],
    initialInvestigations: ['sweat_test', 'genetic_testing', 'chest_xray'],
    confirmatoryInvestigations: ['ct_chest', 'sputum_culture', 'bronchoscopy'],
    treatmentLines: [
      { line: 1, regimen: 'CFTR modulators (elexacaftor/tezacaftor/ivacaftor)', medications: ['elexacaftor', 'tezacaftor', 'ivacaftor'], duration: 'Long-term' },
      { line: 2, regimen: 'Airway clearance + dornase alfa + hypertonic saline', medications: ['dornase_alfa', 'hypertonic_saline'], duration: 'Daily' },
      { line: 3, regimen: 'Antibiotics for exacerbations', medications: ['tobramycin_inhaled', 'aztreonam_inhaled'], duration: 'Individualized' },
    ],
    supportiveCare: ['airway_clearance_physiotherapy', 'pancreatic_enzymes', 'fat_soluble_vitamins', 'nutritional_support', 'cfrd_screening'],
    disposition: { admissionRequired: false, icuRequired: false, specialty: 'cf_center', followUp: '1-3 monthly' },
    monitoring: [
      { parameter: 'FEV1', frequency: '3 monthly', target: 'Stable or improving' },
      { parameter: 'Sputum culture', frequency: '3 monthly', target: 'No new pathogens' },
      { parameter: 'Weight/BMI', frequency: '3 monthly', target: '>= 50th percentile' },
    ],
    urgency: 'orange',
    activationThreshold: 0.4,
    guidelines: ['cff_guidelines'],
    hmisEvents: ['cf_center_referral'],
  },
  ageGroupToContext: {
    neonate: 'pediatric_infant', infant: 'pediatric_infant', toddler: 'pediatric_toddler',
    preschool: 'pediatric_preschool', school_age: 'pediatric_school', adolescent: 'pediatric_adolescent',
    adult: 'adult_immunocompetent',
  },
  relevantContexts: [],
  excludedContexts: [],
  contextOverrides: [
    {
      context: 'pediatric_infant', applicabilityWeight: 1.0,
      ...PEDIATRIC_AGE_ADAPT,
      questionAdditions: ['newborn_screening_result', 'meconium_ileus', 'steatorrhea'],
      differentialAdditions: [{ diseaseId: 'primary_ciliary_dyskinesia', weight: 0.4 }, { diseaseId: 'immunodeficiency', weight: 0.3 }],
      clinicalNotes: 'Infant CF: newborn screening now standard. Sweat test confirmatory.',
    },
    {
      context: 'diabetes', applicabilityWeight: 0.9,
      ...DIABETES_ADAPT_P2,
      clinicalNotes: 'CFRD: Annual OGTT screening from age 10. Insulin therapy mainstay.',
    },
    {
      context: 'liver_disease', applicabilityWeight: 0.7,
      monitoringAdditions: ['lft_3monthly', 'us_liver_annually'],
      clinicalNotes: 'CF liver disease: 30% develop cirrhosis. Ursodeoxycholic acid may help.',
    },
    {
      context: 'resource_low', applicabilityWeight: 0.7,
      investigationRemovals: ['genetic_testing', 'cftr_modulators'],
      clinicalNotes: 'Resource-limited CF: clinical diagnosis + sweat test. CFTR modulators often unavailable.',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// PROFILE 19: FUNGAL PNEUMONIA
// ═══════════════════════════════════════════════════════════════
export const FUNGAL_PNA_CONTEXT_PROFILE: ContextAwareDiseaseProfile = {
  diseaseId: 'fungal_pneumonia',
  diseaseName: 'Fungal Pneumonia',
  master: {
    organism: 'Histoplasma, Coccidioides, Blastomyces, Aspergillus, Cryptococcus',
    transmission: 'Inhalation of spores from environment (soil, bird/bat droppings)',
    corePathophysiology: 'Inhalation → conidia in alveoli → yeast phase → granulomatous inflammation → parenchymal disease',
    naturalHistory: 'Acute to chronic. Depends on host immunity. Dissemination in immunocompromised.',
    universalComplications: ['Disseminated disease', 'Meningitis (cryptococcus)', 'ARDS', 'Death'],
    universalMechanisms: ['alveolar_inflammation'],
    universalPhenotypes: ['cough_chronic', 'cough_immunocompromised', 'cough_miliary'],
  },
  baseline: {
    epidemiology: 'Endemic in specific regions. Immunocompromised at highest risk.',
    symptomOnset: 'Subacute to chronic',
    typicalPresentation: 'Chronic cough, fever, night sweats, weight loss, dyspnea, hemoptysis (aspergilloma)',
    discriminatingFeatures: ['immunosuppressed', 'endemic_area', 'chronic_course', 'eosinophilia', 'cavitary_lesions'],
    basePrevalence: 0.005,
    agePrevalenceModifiers: { adult: 0.005, older_adult: 0.01 },
    typicalPhenotypes: ['cough_chronic', 'cough_immunocompromised', 'cough_miliary'],
    commonMechanisms: ['alveolar_inflammation'],
    requiredQuestions: ['cough_duration', 'cough_fever', 'cough_dyspnea', 'cough_hiv_status', 'immunosuppression', 'travel_endemic', 'bird_exposure'],
    requiredExams: ['chest_auscultation', 'oxygen_saturation', 'lymph_nodes', 'skin_exam'],
    initialInvestigations: ['ct_chest', 'fungal_culture', 'antigen_test'],
    confirmatoryInvestigations: ['bronchoscopy', 'biopsy', 'serology'],
    treatmentLines: [
      { line: 1, regimen: 'Itraconazole or voriconazole', medications: ['itraconazole', 'voriconazole'], duration: '6-12mo' },
      { line: 2, regimen: 'Amphotericin B if severe/disseminated', medications: ['amphotericin_b'], duration: '2-4wk' },
      { line: 3, regimen: 'Surgical resection for aspergilloma', medications: [], duration: 'Surgical' },
    ],
    supportiveCare: ['oxygen', 'antipyretics', 'reduce_immunosuppression_if_possible'],
    disposition: { admissionRequired: true, icuRequired: false, specialty: 'infectious_disease', followUp: 'Monthly' },
    monitoring: [
      { parameter: 'CT chest', frequency: '3 monthly', target: 'Improving' },
      { parameter: 'Fungal antigen', frequency: 'Monthly', target: 'Declining' },
      { parameter: 'LFT (azole toxicity)', frequency: 'Monthly', target: 'Normal' },
    ],
    urgency: 'orange',
    activationThreshold: 0.4,
    guidelines: ['idsa_fungal_guidelines'],
    hmisEvents: ['fungal_notification'],
  },
  ageGroupToContext: {
    adult: 'adult_immunocompetent', older_adult: 'elderly_\u003e65',
  },
  relevantContexts: ['hiv_cd4_low', 'hiv_cd4_very_low', 'transplant', 'oncology_chemo', 'endemic_fungal'],
  excludedContexts: [],
  contextOverrides: [
    {
      context: 'hiv_cd4_very_low', applicabilityWeight: 1.0,
      questionAdditions: ['cd4', 'oi_history'],
      investigationAdditions: ['cryptococcal_antigen', 'histoplasma_antigen'],
      differentialAdditions: [{ diseaseId: 'tb', weight: 0.5 }, { diseaseId: 'pcp', weight: 0.4 }, { diseaseId: 'cmv', weight: 0.3 }],
      clinicalNotes: 'HIV-fungal: consider disseminated. Cryptococcal antigen screening important.',
    },
    {
      context: 'transplant', applicabilityWeight: 1.0,
      questionAdditions: ['transplant_type', 'rejection_history', 'immunosuppression_protocol'],
      differentialAdditions: [{ diseaseId: 'cmv_pneumonitis', weight: 0.4 }],
      clinicalNotes: 'Transplant fungal: Aspergillus most common. Voriconazole first-line.',
    },
    {
      context: 'endemic_fungal', applicabilityWeight: 0.8,
      activationThresholdDelta: -0.1,
      clinicalNotes: 'Endemic area: consider fungal even in immunocompetent with subacute pneumonia.',
    },
    {
      context: 'resource_low', applicabilityWeight: 0.6,
      investigationRemovals: ['bronchoscopy', 'antigen_test'],
      clinicalNotes: 'Resource-limited: clinical + CXR diagnosis. Itraconazole if available.',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// PROFILE 20: EPIGLOTTITIS
// ═══════════════════════════════════════════════════════════════
export const EPIGLOTTITIS_CONTEXT_PROFILE: ContextAwareDiseaseProfile = {
  diseaseId: 'epiglottitis',
  diseaseName: 'Epiglottitis',
  master: {
    organism: 'H. influenzae type b (Hib), S. pneumoniae, S. pyogenes',
    transmission: 'Droplet / contact',
    corePathophysiology: 'Acute inflammation of epiglottis and supraglottic structures → rapid airway compromise',
    naturalHistory: 'Rapid progression (hours). Airway emergency.',
    universalComplications: ['Complete airway obstruction', 'Respiratory arrest', 'Death', 'Sepsis', 'Meningitis'],
    universalMechanisms: ['airway_irritation'],
    universalPhenotypes: ['cough_barking', 'cough_croup'],
  },
  baseline: {
    epidemiology: 'Now rare due to Hib vaccine. Adults: increasing.',
    symptomOnset: 'Rapid, <12h',
    typicalPresentation: 'Acute onset severe sore throat, odynophagia, drooling, stridor, fever, toxic appearance',
    discriminatingFeatures: ['drooling', 'severe_sore_throat', 'stridor', 'fever', 'toxic', 'tripod_positioning'],
    basePrevalence: 0.003,
    agePrevalenceModifiers: { child: 0.01, adult: 0.002 },
    typicalPhenotypes: ['cough_barking', 'cough_croup'],
    commonMechanisms: ['airway_irritation'],
    requiredQuestions: ['cough_stridor', 'cough_fever', 'drooling', 'sore_throat_severe', 'immunization_status', 'tripod_posture'],
    requiredExams: ['ent_exam_cautious', 'oxygen_saturation', 'stridor_assessment', 'respiratory_rate'],
    initialInvestigations: ['lateral_neck_xray'],
    confirmatoryInvestigations: ['laryngoscopy_controlled_environment'],
    treatmentLines: [
      { line: 1, regimen: 'Secure airway (intubation/tracheostomy)', medications: [], duration: 'Emergency' },
      { line: 2, regimen: 'IV ceftriaxone', medications: ['ceftriaxone'], duration: '7-10d' },
      { line: 3, regimen: 'Dexamethasone IV', medications: ['dexamethasone'], duration: '2-3d' },
    ],
    supportiveCare: ['oxygen', 'npo', 'humidified_air', 'icu_monitoring'],
    disposition: { admissionRequired: true, icuRequired: true, specialty: 'ent', followUp: '2wk' },
    monitoring: [
      { parameter: 'Airway patency', frequency: 'Continuous', target: 'Patent' },
      { parameter: 'Oxygen saturation', frequency: 'Continuous', target: '>= 95%' },
    ],
    urgency: 'red',
    activationThreshold: 0.5,
    guidelines: ['ent_epiglottitis_emergency'],
    hmisEvents: ['airway_team_activation', 'ent_emergency'],
  },
  ageGroupToContext: {
    toddler: 'pediatric_toddler', preschool: 'pediatric_preschool',
    adolescent: 'pediatric_adolescent', adult: 'adult_immunocompetent', older_adult: 'elderly_\u003e65',
  },
  relevantContexts: [],
  excludedContexts: [],
  contextOverrides: [
    {
      context: 'adult_immunocompetent', applicabilityWeight: 0.7,
      clinicalNotes: 'Adult epiglottitis: less rapid than children but still dangerous. ENT consult mandatory.',
    },
    {
      context: 'resource_low', applicabilityWeight: 0.6,
      investigationRemovals: ['lateral_neck_xray'],
      clinicalNotes: 'Resource-limited: clinical diagnosis. Secure airway first.',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// PROFILE 21: PNEUMOTHORAX
// ═══════════════════════════════════════════════════════════════
export const PNEUMOTHORAX_CONTEXT_PROFILE: ContextAwareDiseaseProfile = {
  diseaseId: 'pneumothorax',
  diseaseName: 'Pneumothorax',
  master: {
    organism: 'N/A (spontaneous, traumatic, iatrogenic)',
    transmission: 'N/A',
    corePathophysiology: 'Air in pleural space → lung collapse → impaired gas exchange → mediastinal shift (tension)',
    naturalHistory: 'Spontaneous: hemithorax pain, dyspnea. Tension: rapid cardiovascular collapse.',
    universalComplications: ['Tension pneumothorax', 'Cardiac arrest', 'Re-expansion pulmonary edema', 'Recurrence'],
    universalMechanisms: ['pleural_irritation'],
    universalPhenotypes: ['cough_acute_dry'],
  },
  baseline: {
    epidemiology: 'Tall thin males, COPD, Marfan, tobacco, Valsalva.',
    symptomOnset: 'Sudden, acute',
    typicalPresentation: 'Sudden ipsilateral chest pain (pleuritic), dyspnea, dry cough, hyperresonance, reduced breath sounds',
    discriminatingFeatures: ['sudden_chest_pain', 'dyspnea', 'hyperresonance', 'trauma', 'tall_thin_habitus'],
    basePrevalence: 0.005,
    agePrevalenceModifiers: { adult: 0.008, adolescent: 0.005 },
    typicalPhenotypes: ['cough_acute_dry'],
    commonMechanisms: ['pleural_irritation'],
    requiredQuestions: ['cough_chest_pain', 'cough_dyspnea', 'trauma_history', 'smoking', 'marfan_features'],
    requiredExams: ['chest_auscultation', 'chest_percussion', 'oxygen_saturation', 'tracheal_deviation'],
    initialInvestigations: ['chest_xray'],
    confirmatoryInvestigations: ['ct_chest'],
    treatmentLines: [
      { line: 1, regimen: 'Observation if small (<2cm) and stable', medications: [], duration: 'Outpatient' },
      { line: 2, regimen: 'Needle aspiration or chest tube drainage', medications: [], duration: '1-7d' },
      { line: 3, regimen: 'VATS pleurodesis if recurrent/tension', medications: [], duration: 'Surgical' },
    ],
    supportiveCare: ['oxygen', 'analgesia', 'avoid_valsalva', 'smoking_cessation'],
    disposition: { admissionRequired: false, icuRequired: false, specialty: 'surgery_ent', followUp: '2wk' },
    monitoring: [
      { parameter: 'Chest X-ray', frequency: 'Daily if drained', target: 'Re-expansion' },
      { parameter: 'Oxygen saturation', frequency: '4 hourly', target: '>= 92%' },
    ],
    urgency: 'red',
    activationThreshold: 0.4,
    guidelines: ['bts_pneumothorax_guidelines'],
    hmisEvents: ['chest_drain_insertion', 'surgical_referral'],
  },
  ageGroupToContext: {
    adolescent: 'pediatric_adolescent', adult: 'adult_immunocompetent', older_adult: 'elderly_\u003e65',
  },
  relevantContexts: ['adult_immunocompetent', 'elderly_\u003e65', 'copd_known'],
  excludedContexts: ['pediatric_infant', 'pediatric_toddler', 'pediatric_preschool', 'pediatric_school'],
  contextOverrides: [
    {
      context: 'copd_known', applicabilityWeight: 1.0,
      questionAdditions: ['copd_severity', 'home_o2', 'previous_pneumothorax'],
      treatmentAdditions: [{ drugId: 'chest_tube', line: 1, notes: 'COPD patients tolerate pneumothorax poorly' }],
      clinicalNotes: 'COPD + pneumothorax: lower threshold for drainage. Higher recurrence.',
    },
    {
      context: 'elderly_\u003e65', applicabilityWeight: 0.8,
      ...ELDERLY_ADAPT_P2,
      clinicalNotes: 'Elderly: less reserve. Drain even small pneumothorax.',
    },
    {
      context: 'icu_ventilated', applicabilityWeight: 0.9,
      ...ICU_VENT_ADAPT_SHARED,
      clinicalNotes: 'Ventilator pneumothorax: tension can develop rapidly. Always consider with sudden deterioration.',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// PROFILE 22: CMV PNEUMONITIS
// ═══════════════════════════════════════════════════════════════
export const CMV_PNEUMONITIS_CONTEXT_PROFILE: ContextAwareDiseaseProfile = {
  diseaseId: 'cmv_pneumonitis',
  diseaseName: 'CMV Pneumonitis',
  master: {
    organism: 'Cytomegalovirus (CMV)',
    transmission: 'Latent reactivation or primary in immunocompromised',
    corePathophysiology: 'Alveolar inflammation with inclusion bodies → interstitial pneumonitis → respiratory failure',
    naturalHistory: 'Subacute to acute. High mortality in transplant/HIV patients.',
    universalComplications: ['Respiratory failure', 'ARDS', 'Coinfection', 'Graft rejection (transplant)', 'Death'],
    universalMechanisms: ['alveolar_inflammation'],
    universalPhenotypes: ['cough_immunocompromised', 'cough_acute_dry'],
  },
  baseline: {
    epidemiology: 'Transplant recipients, HIV with low CD4, congenital.',
    symptomOnset: 'Subacute, over days-weeks',
    typicalPresentation: 'Dry cough, fever, hypoxia, bilateral interstitial infiltrates, often with CMV viremia',
    discriminatingFeatures: ['transplant', 'hiv_cd4_low', 'fever', 'hypoxia', 'cmv_pcr_positive', 'reticulonodular_cxr'],
    basePrevalence: 0.003,
    agePrevalenceModifiers: { adult: 0.004 },
    typicalPhenotypes: ['cough_immunocompromised', 'cough_acute_dry'],
    commonMechanisms: ['alveolar_inflammation'],
    requiredQuestions: ['cough_hiv_status', 'transplant_status', 'immunosuppression', 'cough_fever', 'cough_dyspnea', 'cmv_prophylaxis'],
    requiredExams: ['chest_auscultation', 'oxygen_saturation', 'temperature', 'fundoscopy'],
    initialInvestigations: ['cmv_pcr', 'ct_chest'],
    confirmatoryInvestigations: ['bronchoscopy_bal', 'lung_biopsy'],
    treatmentLines: [
      { line: 1, regimen: 'Ganciclovir IV or valganciclovir PO', medications: ['ganciclovir', 'valganciclovir'], duration: '14-21d' },
      { line: 2, regimen: 'Foscarnet if ganciclovir-resistant', medications: ['foscarnet'], duration: '14-21d' },
      { line: 3, regimen: 'Reduce immunosuppression if possible', medications: [], duration: 'Individualized' },
    ],
    supportiveCare: ['oxygen', 'antipyretics', 'cmv_immunoglobulin_consider'],
    disposition: { admissionRequired: true, icuRequired: false, specialty: 'infectious_disease', followUp: 'Weekly' },
    monitoring: [
      { parameter: 'CMV PCR', frequency: 'Weekly', target: 'Declining' },
      { parameter: 'Oxygen saturation', frequency: '4 hourly', target: '>= 92%' },
      { parameter: 'Creatinine (foscarnet)', frequency: 'Daily', target: 'Stable' },
    ],
    urgency: 'red',
    activationThreshold: 0.5,
    guidelines: ['transplant_cmv_guidelines'],
    hmisEvents: ['cmv_diagnosis'],
  },
  ageGroupToContext: {
    adult: 'adult_immunocompetent', older_adult: 'elderly_\u003e65',
  },
  relevantContexts: ['hiv_cd4_low', 'transplant', 'oncology_chemo', 'autoimmune_steroids'],
  excludedContexts: [],
  contextOverrides: [
    {
      context: 'hiv_cd4_very_low', applicabilityWeight: 1.0,
      ...HIV_CD4_LOW_ADAPT,
      questionAdditions: ['cmv_retinitis_symptoms', 'cmv_colitis_symptoms'],
      differentialAdditions: [{ diseaseId: 'pcp', weight: 0.5 }, { diseaseId: 'tb', weight: 0.4 }, { diseaseId: 'fungal_pneumonia', weight: 0.3 }],
      clinicalNotes: 'HIV-CMV: CD4 <100. Often with other OIs. Retinitis screening essential.',
    },
    {
      context: 'transplant', applicabilityWeight: 1.0,
      questionAdditions: ['donor_cmv_status', 'recipient_cmv_status', 'prophylaxis_compliance'],
      treatmentAdditions: [{ drugId: 'cmv_ig', line: 2, notes: 'Consider CMV immunoglobulin' }],
      clinicalNotes: 'Transplant CMV: Donor+/Recipient- highest risk. Prophylaxis standard.',
    },
    {
      context: 'icu_ventilated', applicabilityWeight: 0.8,
      ...ICU_VENT_ADAPT_SHARED,
      clinicalNotes: 'ICU CMV: high mortality. BAL for diagnosis.',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// PROFILE 23: BRONCHIOLITIS OBLITERANS
// ═══════════════════════════════════════════════════════════════
export const BO_CONTEXT_PROFILE: ContextAwareDiseaseProfile = {
  diseaseId: 'bronchiolitis_obliterans',
  diseaseName: 'Bronchiolitis Obliterans',
  master: {
    organism: 'N/A (inflammatory)',
    transmission: 'N/A',
    corePathophysiology: 'Fibrotic obliteration of small airways → progressive airflow obstruction, air trapping',
    naturalHistory: 'Progressive. Common post-transplant. Can be post-infectious in children.',
    universalComplications: ['Progressive respiratory failure', 'Death', 'Infectious complications'],
    universalMechanisms: ['bronchospasm', 'airway_irritation'],
    universalPhenotypes: ['cough_chronic', 'cough_wheezy'],
  },
  baseline: {
    epidemiology: 'Transplant: 50% of lung transplant recipients at 5yr.',
    symptomOnset: 'Insidious, progressive over months',
    typicalPresentation: 'Progressive dyspnea, chronic dry cough, wheeze, air trapping on CT, declining FEV1',
    discriminatingFeatures: ['progressive_dyspnea', 'transplant', 'air_trapping', 'mosaic_attenuation', 'declining_fev1'],
    basePrevalence: 0.002,
    agePrevalenceModifiers: { adult: 0.002, child: 0.001 },
    typicalPhenotypes: ['cough_chronic', 'cough_wheezy'],
    commonMechanisms: ['bronchospasm', 'airway_irritation'],
    requiredQuestions: ['cough_duration', 'cough_dyspnea', 'transplant_history', 'toxin_exposure', 'post_infectious', 'immunosuppression'],
    requiredExams: ['chest_auscultation', 'oxygen_saturation', 'pft'],
    initialInvestigations: ['ct_chest_expiratory', 'pft'],
    confirmatoryInvestigations: ['bronchoscopy', 'lung_biopsy'],
    treatmentLines: [
      { line: 1, regimen: 'Azithromycin (anti-inflammatory)', medications: ['azithromycin'], duration: 'Long-term' },
      { line: 2, regimen: 'Augment immunosuppression (transplant)', medications: ['prednisolone', 'tacrolimus'], duration: 'Individualized' },
      { line: 3, regimen: 'Lung retransplant (selected cases)', medications: [], duration: 'Surgical' },
    ],
    supportiveCare: ['oxygen', 'pulmonary_rehab', 'vaccinations'],
    disposition: { admissionRequired: false, icuRequired: false, specialty: 'pulmonology_transplant', followUp: '1-3 monthly' },
    monitoring: [
      { parameter: 'FEV1', frequency: 'Monthly', target: 'Stable' },
      { parameter: 'CT chest', frequency: '6 monthly', target: 'No progression' },
    ],
    urgency: 'orange',
    activationThreshold: 0.4,
    guidelines: ['islt_bo_guidelines'],
    hmisEvents: [],
  },
  ageGroupToContext: {
    child: 'pediatric_school', adolescent: 'pediatric_adolescent', adult: 'adult_immunocompetent',
  },
  relevantContexts: ['transplant', 'autoimmune_steroids'],
  excludedContexts: [],
  contextOverrides: [
    {
      context: 'transplant', applicabilityWeight: 1.0,
      questionAdditions: ['rejection_history', 'immunosuppression_levels', 'donor_specific_antibodies'],
      monitoringAdditions: ['spirometry_weekly_home', 'd_sa_monitoring'],
      clinicalNotes: 'Transplant BO: main cause of late mortality. Azithromycin may slow progression.',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// PROFILE 24: DRUG-INDUCED COUGH (non-ACE)
// ═══════════════════════════════════════════════════════════════
export const DRUG_COUGH_CONTEXT_PROFILE: ContextAwareDiseaseProfile = {
  diseaseId: 'drug_induced_cough',
  diseaseName: 'Drug-Induced Cough (non-ACE)',
  master: {
    organism: 'N/A',
    transmission: 'N/A',
    corePathophysiology: 'Drug-induced pulmonary toxicity → inflammation, fibrosis, or direct cough receptor stimulation',
    naturalHistory: 'Onset weeks-months after drug start. Reversible on discontinuation (most).',
    universalComplications: ['Pulmonary fibrosis (some drugs)', 'Bronchiolitis obliterans', 'Pulmonary edema'],
    universalMechanisms: ['chemical_stimulation'],
    universalPhenotypes: ['cough_ace_inhibitor', 'cough_chronic'],
  },
  baseline: {
    epidemiology: 'Culprits: beta-blockers, NSAIDs, methotrexate, amiodarone, nitrofurantoin, bleomycin, cyclophosphamide.',
    symptomOnset: 'Variable (days-months after drug start)',
    typicalPresentation: 'Chronic dry cough, temporal relationship to drug, no other cause found',
    discriminatingFeatures: ['drug_start_temporal', 'drug_list', 'resolves_on_stop', 'dry_cough', 'no_other_cause'],
    basePrevalence: 0.01,
    agePrevalenceModifiers: { adult: 0.01, older_adult: 0.02 },
    typicalPhenotypes: ['cough_ace_inhibitor', 'cough_chronic'],
    commonMechanisms: ['chemical_stimulation'],
    requiredQuestions: ['cough_medication_list', 'cough_duration', 'cough_drug_timing', 'cough_sputum'],
    requiredExams: ['chest_auscultation', 'oxygen_saturation'],
    initialInvestigations: [],
    confirmatoryInvestigations: ['drug_discontinuation_trial'],
    treatmentLines: [
      { line: 1, regimen: 'Discontinue offending drug', medications: [], duration: 'N/A' },
      { line: 2, regimen: 'Substitute with alternative if needed', medications: ['alternative_drug'], duration: 'Individualized' },
    ],
    supportiveCare: ['cough_suppressants_if_needed', 'monitor_for_resolution'],
    disposition: { admissionRequired: false, icuRequired: false, specialty: 'primary_care', followUp: '4wk' },
    monitoring: [
      { parameter: 'Cough resolution', frequency: '2wk', target: 'Resolved by 4wk' },
    ],
    urgency: 'green',
    activationThreshold: 0.4,
    guidelines: [],
    hmisEvents: [],
  },
  ageGroupToContext: {
    adult: 'adult_immunocompetent', older_adult: 'elderly_\u003e65',
  },
  relevantContexts: ['elderly_\u003e65', 'oncology_active', 'heart_failure_known'],
  excludedContexts: ['pediatric_infant', 'pediatric_toddler', 'pediatric_preschool', 'pediatric_school', 'pediatric_adolescent'],
  contextOverrides: [
    {
      context: 'elderly_\u003e65', applicabilityWeight: 1.0,
      ...ELDERLY_ADAPT_P2,
      clinicalNotes: 'Elderly: polypharmacy. Common culprits: amiodarone, beta-blockers, NSAIDs.',
    },
    {
      context: 'oncology_chemo', applicabilityWeight: 0.9,
      questionAdditions: ['chemo_regimen', 'cumulative_dose', 'radiation_history'],
      differentialAdditions: [{ diseaseId: 'chemo_pneumonitis', weight: 0.6 }, { diseaseId: 'radiation_pneumonitis', weight: 0.5 }],
      clinicalNotes: 'Chemo-induced cough: bleomycin, cyclophosphamide, methotrexate. Dose-dependent.',
    },
    {
      context: 'heart_failure_known', applicabilityWeight: 0.7,
      differentialAdditions: [{ diseaseId: 'heart_failure', weight: 0.5 }],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// PROFILE 25: CHRONIC SINUSITIS
// ═══════════════════════════════════════════════════════════════
export const SINUSITIS_CONTEXT_PROFILE: ContextAwareDiseaseProfile = {
  diseaseId: 'chronic_sinusitis',
  diseaseName: 'Chronic Sinusitis',
  master: {
    organism: 'Mixed bacteria (anaerobes, S. aureus, gram-negatives), fungi',
    transmission: 'N/A',
    corePathophysiology: 'Mucosal inflammation and obstruction of sinus ostia → mucus stasis → bacterial/fungal overgrowth',
    naturalHistory: 'Chronic >12wk. Recurrent exacerbations.',
    universalComplications: ['Mucocele', 'Orbital cellulitis', 'Intracranial extension', 'Osteomyelitis'],
    universalMechanisms: ['upper_airway_stimulation'],
    universalPhenotypes: ['cough_uacs_postnasal', 'cough_chronic'],
  },
  baseline: {
    epidemiology: '12% of adults. Most common chronic condition.',
    symptomOnset: 'Chronic >12wk',
    typicalPresentation: 'Nasal congestion, facial pain/pressure, purulent discharge, hyposmia, cough (postnasal drip)',
    discriminatingFeatures: ['nasal_congestion', 'facial_pain', 'purulent_nasal_discharge', 'hyposmia', '>12wk'],
    basePrevalence: 0.04,
    agePrevalenceModifiers: { adult: 0.05, adolescent: 0.03 },
    typicalPhenotypes: ['cough_uacs_postnasal', 'cough_chronic'],
    commonMechanisms: ['upper_airway_stimulation'],
    requiredQuestions: ['cough_nasal_symptoms', 'facial_pain', 'nasal_discharge', 'hyposmia', 'cough_duration'],
    requiredExams: ['ent_exam', 'nasal_endoscopy', 'sinus_transillumination'],
    initialInvestigations: ['ct_sinus'],
    confirmatoryInvestigations: ['nasal_endoscopy', 'sinus_culture'],
    treatmentLines: [
      { line: 1, regimen: 'Intranasal corticosteroid + saline irrigation', medications: ['fluticasone_nasal', 'saline_irrigation'], duration: 'Long-term' },
      { line: 2, regimen: 'Antibiotics (culture-directed) for exacerbations', medications: ['amoxicillin_clavulanate', 'doxycycline'], duration: '10-14d' },
      { line: 3, regimen: 'Functional endoscopic sinus surgery (FESS)', medications: [], duration: 'Surgical' },
    ],
    supportiveCare: ['nasal_saline_irrigation', 'humidification', 'allergen_avoidance'],
    disposition: { admissionRequired: false, icuRequired: false, specialty: 'ent', followUp: '4-8wk' },
    monitoring: [
      { parameter: 'Symptom score', frequency: '4wk', target: 'Improvement' },
    ],
    urgency: 'green',
    activationThreshold: 0.3,
    guidelines: ['epos_sinusitis_guidelines'],
    hmisEvents: [],
  },
  ageGroupToContext: {
    preschool: 'pediatric_preschool', school_age: 'pediatric_school', adolescent: 'pediatric_adolescent',
    adult: 'adult_immunocompetent', older_adult: 'elderly_\u003e65',
  },
  relevantContexts: [],
  excludedContexts: [],
  contextOverrides: [
    {
      context: 'autoimmune_steroids', applicabilityWeight: 0.8,
      questionAdditions: ['fungal_sinusitis_symptoms', 'orbital_symptoms'],
      investigationAdditions: ['ct_sinus_contrast', 'ent_referral_urgent'],
      clinicalNotes: 'Immunocompromised: high risk of fungal sinusitis. Urgent ENT.',
    },
    {
      context: 'asthma_known', applicabilityWeight: 0.7,
      treatmentAdditions: [{ drugId: 'intranasal_steroid', line: 1, notes: 'Treat sinusitis to improve asthma control' }],
      clinicalNotes: 'Asthma-sinusitis: united airway disease. Treat both.',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// PROFILE 26: LARYNGOPHARYNGEAL REFLUX (LPR)
// ═══════════════════════════════════════════════════════════════
export const LPR_CONTEXT_PROFILE: ContextAwareDiseaseProfile = {
  diseaseId: 'laryngopharyngeal_reflux',
  diseaseName: 'Laryngopharyngeal Reflux',
  master: {
    organism: 'N/A',
    transmission: 'N/A',
    corePathophysiology: 'Reflux of gastric contents above UES → laryngeal/pharyngeal irritation → cough, dysphonia, globus',
    naturalHistory: 'Chronic. Responds to PPI and lifestyle. Takes 2-3mo for symptom improvement.',
    universalComplications: ['Laryngeal granuloma', 'Laryngeal stenosis', 'Aspiration pneumonia', 'Voice disorders'],
    universalMechanisms: ['vagal_stimulation', 'upper_airway_stimulation'],
    universalPhenotypes: ['cough_gerd_related', 'cough_chronic'],
  },
  baseline: {
    epidemiology: 'Up to 50% of patients with chronic cough have LPR component.',
    symptomOnset: 'Chronic, intermittent',
    typicalPresentation: 'Chronic cough, hoarseness, globus sensation, throat clearing, dysphagia, worse after meals',
    discriminatingFeatures: ['voice_change', 'globus', 'throat_clearing', 'heartburn', 'dysphonia', 'ppi_response'],
    basePrevalence: 0.04,
    agePrevalenceModifiers: { adult: 0.05, older_adult: 0.04 },
    typicalPhenotypes: ['cough_gerd_related', 'cough_chronic'],
    commonMechanisms: ['vagal_stimulation', 'upper_airway_stimulation'],
    requiredQuestions: ['cough_heartburn', 'voice_change', 'globus', 'throat_clearing', 'cough_timing', 'cough_medication_list'],
    requiredExams: ['laryngoscopy', 'ent_exam', 'chest_auscultation'],
    initialInvestigations: ['ppi_trial', 'laryngoscopy'],
    confirmatoryInvestigations: ['ph_monitoring_impedance'],
    treatmentLines: [
      { line: 1, regimen: 'PPI trial (omeprazole 20mg BD) 8-12wk', medications: ['omeprazole'], duration: '8-12wk' },
      { line: 2, regimen: 'High-dose PPI + lifestyle modifications', medications: ['omeprazole_high_dose', 'lansoprazole'], duration: '12wk' },
      { line: 3, regimen: 'Anti-reflux surgery if PPI-refractory', medications: [], duration: 'Surgical' },
    ],
    supportiveCare: ['head_of_bed_elevation', 'avoid_late_meals', 'voice_rest', 'weight_loss'],
    disposition: { admissionRequired: false, icuRequired: false, specialty: 'ent', followUp: '8wk' },
    monitoring: [
      { parameter: 'Voice Handicap Index', frequency: '4wk', target: 'Improving' },
      { parameter: 'Reflux Symptom Index', frequency: '4wk', target: '< 13' },
    ],
    urgency: 'green',
    activationThreshold: 0.3,
    guidelines: ['aaohns_lpr_guidelines'],
    hmisEvents: [],
  },
  ageGroupToContext: {
    adolescent: 'pediatric_adolescent', adult: 'adult_immunocompetent', older_adult: 'elderly_\u003e65',
  },
  relevantContexts: [],
  excludedContexts: ['pediatric_infant', 'pediatric_toddler', 'pediatric_preschool', 'pediatric_school'],
  contextOverrides: [
    {
      context: 'elderly_\u003e65', applicabilityWeight: 0.7,
      ...ELDERLY_ADAPT_P2,
      clinicalNotes: 'Elderly LPR: lower threshold for aspiration risk. Barium swallow recommended.',
    },
    {
      context: 'pregnancy', applicabilityWeight: 0.7,
      ...PREGNANCY_CXR_SAFE_P2,
      treatmentAdditions: [{ drugId: 'omeprazole', line: 1, notes: 'PPI safe in pregnancy' }],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// PROFILE 27: PULMONARY HYPERTENSION
// ═══════════════════════════════════════════════════════════════
export const PULM_HTN_CONTEXT_PROFILE: ContextAwareDiseaseProfile = {
  diseaseId: 'pulmonary_hypertension',
  diseaseName: 'Pulmonary Hypertension',
  master: {
    organism: 'N/A',
    transmission: 'N/A',
    corePathophysiology: 'Increased pulmonary vascular resistance → right ventricular pressure overload → RV failure → cough, dyspnea',
    naturalHistory: 'Progressive. Median survival 2-3yr without treatment. Earlier with PH-specific therapy.',
    universalComplications: ['Right heart failure', 'Cardiogenic shock', 'Sudden death', 'Pulmonary artery rupture'],
    universalMechanisms: ['pulmonary_edema'],
    universalPhenotypes: ['cough_cardiac', 'cough_exercise_induced'],
  },
  baseline: {
    epidemiology: 'Rare ~15/1M. More common in females, 30-50yr. CTD, CHD, HIV, portal HTN associated.',
    symptomOnset: 'Insidious, progressive',
    typicalPresentation: 'Exertional dyspnea, fatigue, dry cough, syncope, chest pain, pedal edema, loud P2',
    discriminatingFeatures: ['exertional_dyspnea', 'syncope', 'pedal_edema', 'loud_p2', 'right_heart_strain'],
    basePrevalence: 0.005,
    agePrevalenceModifiers: { adult: 0.005, older_adult: 0.01 },
    typicalPhenotypes: ['cough_cardiac', 'cough_exercise_induced'],
    commonMechanisms: ['pulmonary_edema'],
    requiredQuestions: ['cough_dyspnea', 'cough_syncope', 'pedal_edema', 'chest_pain', 'connective_tissue_disease', 'hiv_status', 'family_history'],
    requiredExams: ['cardiac_auscultation', 'chest_auscultation', 'jvp', 'pedal_edema', 'oxygen_saturation'],
    initialInvestigations: ['echo'],
    confirmatoryInvestigations: ['right_heart_catheterization'],
    treatmentLines: [
      { line: 1, regimen: 'PH-specific therapy (PDE5i, ERA, prostacyclin)', medications: ['sildenafil', 'bosentan', 'epoprostenol'], duration: 'Long-term' },
      { line: 2, regimen: 'Anticoagulation (selected patients)', medications: ['warfarin'], duration: 'Individualized' },
      { line: 3, regimen: 'Lung transplant if refractory', medications: [], duration: 'Surgical' },
    ],
    supportiveCare: ['oxygen_long_term', 'diuretics_if_rv_failure', 'pulmonary_rehab', 'vaccinations'],
    disposition: { admissionRequired: false, icuRequired: false, specialty: 'pulmonology_ph_center', followUp: '1-3 monthly' },
    monitoring: [
      { parameter: 'Functional class (WHO)', frequency: 'Each visit', target: 'I-II' },
      { parameter: '6-min walk distance', frequency: '3-6 monthly', target: '> 400m' },
      { parameter: 'BNP/NT-proBNP', frequency: '3 monthly', target: 'Stable or declining' },
      { parameter: 'Echo RV function', frequency: '6-12 monthly', target: 'Stable' },
    ],
    urgency: 'orange',
    activationThreshold: 0.4,
    guidelines: ['esc_ers_ph_guidelines'],
    hmisEvents: ['ph_center_referral'],
  },
  ageGroupToContext: {
    adolescent: 'pediatric_adolescent', adult: 'adult_immunocompetent', older_adult: 'elderly_\u003e65',
  },
  relevantContexts: ['hiv_cd4_low', 'autoimmune_steroids', 'liver_disease'],
  excludedContexts: ['pediatric_infant', 'pediatric_toddler', 'pediatric_preschool', 'pediatric_school'],
  contextOverrides: [
    {
      context: 'hiv_cd4_low', applicabilityWeight: 0.8,
      ...HIV_CD4_LOW_ADAPT,
      clinicalNotes: 'HIV-PH: associated with high viral load. ART may improve.',
    },
    {
      context: 'liver_disease', applicabilityWeight: 0.7,
      monitoringAdditions: ['portal_htn_screening', 'lft_monthly'],
      clinicalNotes: 'Portopulmonary hypertension: associated with portal HTN. Liver transplant may reverse.',
    },
    {
      context: 'pregnancy', applicabilityWeight: 1.0,
      contraindications: ['pregnancy_class_d_ph_drugs'],
      clinicalNotes: 'Pregnancy + PH: high mortality. Contraindicated. Discuss termination.',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// PROFILE 28: CHLAMYDIA PNEUMONIA IN INFANTS
// ═══════════════════════════════════════════════════════════════
export const CHLAMYDIA_PNA_CONTEXT_PROFILE: ContextAwareDiseaseProfile = {
  diseaseId: 'chlamydia_pneumonia_infants',
  diseaseName: 'Chlamydia Pneumonia (Infants)',
  master: {
    organism: 'Chlamydia trachomatis',
    transmission: 'Vertical transmission during vaginal delivery',
    corePathophysiology: 'Conjunctivitis → nasopharyngeal colonization → lower respiratory tract inflammation → staccato cough, pneumonitis',
    naturalHistory: 'Onset 2-19wk. Self-limiting but prolonged. Treat to prevent chronic lung changes.',
    universalComplications: ['Chronic cough', 'Otitis media', 'Reactive airway disease', 'Long-term lung function impairment'],
    universalMechanisms: ['alveolar_inflammation'],
    universalPhenotypes: ['cough_wheezy', 'cough_acute_productive'],
  },
  baseline: {
    epidemiology: '2-5% of infants born to infected mothers. 50% of exposed develop conjunctivitis, 10-20% pneumonia.',
    symptomOnset: 'Insidious, 2-19wk of age',
    typicalPresentation: 'Staccato cough, tachypnea, wheeze, no fever, conjunctivitis history, diffuse crackles',
    discriminatingFeatures: ['infant_1_3months', 'staccato_cough', 'conjunctivitis_history', 'afebrile', 'diffuse_crackles'],
    basePrevalence: 0.005,
    agePrevalenceModifiers: { neonate: 0.01, infant: 0.015 },
    typicalPhenotypes: ['cough_wheezy', 'cough_acute_productive'],
    commonMechanisms: ['alveolar_inflammation'],
    requiredQuestions: ['cough_duration', 'cough_fever', 'conjunctivitis_history', 'maternal_sti_history', 'cough_contacts'],
    requiredExams: ['chest_auscultation', 'oxygen_saturation', 'respiratory_rate', 'conjunctival_exam'],
    initialInvestigations: ['chlamydia_pcr', 'chest_xray'],
    confirmatoryInvestigations: ['nasopharyngeal_swab_pcr'],
    treatmentLines: [
      { line: 1, regimen: 'Azithromycin 20mg/kg/d PO x 3d', medications: ['azithromycin'], duration: '3d' },
      { line: 2, regimen: 'Erythromycin (alternative)', medications: ['erythromycin'], duration: '14d' },
    ],
    supportiveCare: ['oxygen_if_hypoxic', 'chest_physiotherapy', 'monitoring_for_apnoea'],
    disposition: { admissionRequired: false, icuRequired: false, specialty: 'pediatrics', followUp: '2wk' },
    monitoring: [
      { parameter: 'Cough', frequency: '3d', target: 'Improving' },
      { parameter: 'Oxygen saturation', frequency: 'If hypoxic', target: '>= 92%' },
    ],
    urgency: 'orange',
    activationThreshold: 0.3,
    guidelines: ['cdc_sti_treatment_guidelines'],
    hmisEvents: ['sti_reporting_maternal'],
  },
  ageGroupToContext: {
    neonate: 'pediatric_infant', infant: 'pediatric_infant',
  },
  relevantContexts: ['pediatric_infant'],
  excludedContexts: ['adult_immunocompetent', 'elderly_\u003e65', 'pediatric_toddler', 'pediatric_preschool', 'pediatric_school', 'pediatric_adolescent'],
  contextOverrides: [
    {
      context: 'pediatric_infant', applicabilityWeight: 1.0,
      ...PEDIATRIC_AGE_ADAPT,
      questionAdditions: ['conjunctivitis_treatment', 'maternal_treatment', 'sibling_screening'],
      differentialAdditions: [{ diseaseId: 'pertussis', weight: 0.5 }, { diseaseId: 'rsv_bronchiolitis', weight: 0.4 }, { diseaseId: 'cmv_pneumonitis', weight: 0.2 }],
      clinicalNotes: 'Infant chlamydia: staccato cough pathognomonic. Treat both parents.',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// ALL PART 2 PROFILES EXPORT
// ═══════════════════════════════════════════════════════════════

export const ALL_PART2_PROFILES: ContextAwareDiseaseProfile[] = [
  PERTUSSIS_CONTEXT_PROFILE,
  BRONCHIOLITIS_CONTEXT_PROFILE,
  COVID19_CONTEXT_PROFILE,
  FOREIGN_BODY_CONTEXT_PROFILE,
  PE_CONTEXT_PROFILE,
  PCP_CONTEXT_PROFILE,
  CROUP_CONTEXT_PROFILE,
  INFLUENZA_CONTEXT_PROFILE,
  BRONCHITIS_CONTEXT_PROFILE,
  GERD_CONTEXT_PROFILE,
  UACS_CONTEXT_PROFILE,
  ACEI_COUGH_CONTEXT_PROFILE,
  POSTINFECTIOUS_CONTEXT_PROFILE,
  ASPIRATION_PNA_CONTEXT_PROFILE,
  NTM_CONTEXT_PROFILE,
  VCD_CONTEXT_PROFILE,
  PULMONARY_FIBROSIS_CONTEXT_PROFILE,
  CYSTIC_FIBROSIS_CONTEXT_PROFILE,
  FUNGAL_PNA_CONTEXT_PROFILE,
  EPIGLOTTITIS_CONTEXT_PROFILE,
  PNEUMOTHORAX_CONTEXT_PROFILE,
  CMV_PNEUMONITIS_CONTEXT_PROFILE,
  BO_CONTEXT_PROFILE,
  DRUG_COUGH_CONTEXT_PROFILE,
  SINUSITIS_CONTEXT_PROFILE,
  LPR_CONTEXT_PROFILE,
  PULM_HTN_CONTEXT_PROFILE,
  CHLAMYDIA_PNA_CONTEXT_PROFILE,
];
