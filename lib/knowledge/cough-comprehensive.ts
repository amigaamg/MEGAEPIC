import type { YamlKnowledgeDocument, YamlContext, YamlQuestion, YamlProtocol, YamlScore, YamlSign, YamlInvestigation, YamlDrug, YamlGuideline } from './yaml-schema';
import { COUGH_KNOWLEDGE as BASE } from './cough-complete';
import { MISSING_MECHANISMS, MISSING_PHENOTYPES } from './cough-supplement-mechanisms';
import { MISSING_DISEASES_1 } from './cough-supplement-diseases-1';
import { MISSING_DISEASES_2 } from './cough-supplement-diseases-2';
import { MISSING_DISEASES_3 } from './cough-supplement-diseases-3';

const MISSING_CONTEXTS: YamlContext[] = [
  { id: 'ctx_cancer', name: 'Cancer Context', category: 'comorbidity', description: 'Active malignancy with treatment implications', modifies: [
    { diseaseId: 'disease_cap', changes: ['Consider neutropenic fever', 'Broader antibiotic coverage', 'Check neutrophil count before antibiotics'] },
    { diseaseId: 'disease_pulmonary_tuberculosis', changes: ['Consider paradoxical reaction if on immunotherapy', 'Higher risk of disseminated TB'] },
  ]},
  { id: 'ctx_neutropenic', name: 'Neutropenic Context', category: 'immunosuppression', description: 'Neutrophil count <500 cells/uL', inheritsFrom: ['ctx_immunosuppressed'] },
  { id: 'ctx_icu', name: 'ICU Context', category: 'icu', description: 'Critically ill requiring intensive care' },
  { id: 'ctx_resource_limited', name: 'Resource-Limited Context', category: 'resource_limited', description: 'Settings with limited diagnostic and treatment resources' },
  { id: 'ctx_preterm', name: 'Preterm Infant Context', category: 'age', description: 'Born before 37 weeks gestation' },
  { id: 'ctx_post_covid', name: 'Post-COVID Context', category: 'comorbidity', description: 'Sequelae after COVID-19 infection' },
  { id: 'ctx_tb_endemic', name: 'TB-Endemic Context', category: 'community', description: 'High TB prevalence setting' },
  { id: 'ctx_occupational', name: 'Occupational Context', category: 'community', description: 'Workplace-related exposure risk' },
  { id: 'ctx_post_surgical', name: 'Post-Surgical Context', category: 'hospital', description: 'Within 30 days of surgery' },
];

const MISSING_INVESTIGATIONS: YamlInvestigation[] = [
  { id: 'inv_tracheal_aspirate', name: 'Tracheal Aspirate Culture', category: 'microbiology', specimen: 'tracheal_aspirate' },
  { id: 'inv_pleural_ultrasound', name: 'Pleural Ultrasound', category: 'other', specimen: 'not_applicable' },
  { id: 'inv_pleural_fluid_analysis', name: 'Pleural Fluid Analysis', category: 'other', specimen: 'pleural_fluid' },
  { id: 'inv_pleural_fluid_culture', name: 'Pleural Fluid Culture', category: 'microbiology', specimen: 'pleural_fluid' },
  { id: 'inv_galactomannan', name: 'Serum Galactomannan', category: 'microbiology', specimen: 'blood' },
  { id: 'inv_beta_d_glucan', name: '(1,3)-Beta-D-Glucan', category: 'microbiology', specimen: 'blood' },
  { id: 'inv_histoplasma_antigen', name: 'Histoplasma Antigen (Urine/Serum)', category: 'microbiology', specimen: 'urine' },
  { id: 'inv_ace_level', name: 'Serum ACE Level', category: 'biochemistry', specimen: 'blood' },
  { id: 'inv_serum_precipitins', name: 'Serum Precipitins', category: 'immunology', specimen: 'blood' },
  { id: 'inv_nasal_nitric_oxide', name: 'Nasal Nitric Oxide', category: 'other', specimen: 'nasal_air' },
  { id: 'inv_ciliary_biopsy', name: 'Ciliary Biopsy (EM)', category: 'pathology', specimen: 'tissue' },
  { id: 'inv_cftr_genetic_testing', name: 'CFTR Genetic Testing', category: 'genetics', specimen: 'blood' },
  { id: 'inv_sweat_chloride', name: 'Sweat Chloride Test', category: 'other', specimen: 'sweat' },
  { id: 'inv_genetic_testing_pcd', name: 'PCD Genetic Panel', category: 'genetics', specimen: 'blood' },
  { id: 'inv_laryngoscopy', name: 'Laryngoscopy', category: 'other', specimen: 'not_applicable' },
  { id: 'inv_spirometry_flow_loop', name: 'Flow-Volume Loop Spirometry', category: 'other', specimen: 'not_applicable' },
  { id: 'inv_peak_flow_serial', name: 'Serial Peak Flow Monitoring', category: 'other', specimen: 'not_applicable' },
  { id: 'inv_methacholine_challenge', name: 'Methacholine Challenge Test', category: 'other', specimen: 'not_applicable' },
  { id: 'inv_specific_ige', name: 'Specific IgE Testing', category: 'immunology', specimen: 'blood' },
  { id: 'inv_arterial_blood_gas', name: 'Arterial Blood Gas', category: 'other', specimen: 'blood' },
  { id: 'inv_flow_cytometry', name: 'Flow Cytometry', category: 'pathology', specimen: 'tissue' },
  { id: 'inv_right_heart_catheterization', name: 'Right Heart Catheterization', category: 'other', specimen: 'not_applicable' },
  { id: 'inv_swallow_assessment', name: 'Swallowing Assessment', category: 'other', specimen: 'not_applicable' },
  { id: 'inv_mri_chest', name: 'MRI Chest', category: 'other', specimen: 'not_applicable' },
  { id: 'inv_lung_biopsy', name: 'Lung Biopsy', category: 'pathology', specimen: 'tissue' },
];

const MISSING_DRUGS: YamlDrug[] = [
  { id: 'tx_anti_pseudomonal_beta_lactam', name: 'Anti-Pseudomonal Beta-Lactam', genericName: 'Piperacillin-Tazobactam/Cefepime', atcCode: 'J01CR05', category: 'antibiotic', treatsDisease: ['disease_hap', 'disease_vap'] },
  { id: 'tx_aminoglycoside', name: 'Aminoglycoside', genericName: 'Gentamicin/Amikacin', atcCode: 'J01GB03', category: 'antibiotic', renalAdjustment: 'Reduce dose', treatsDisease: ['disease_hap', 'disease_vap'] },
  { id: 'tx_vancomycin', name: 'Vancomycin', genericName: 'Vancomycin', atcCode: 'J01XA01', category: 'antibiotic', renalAdjustment: 'Reduce dose', treatsDisease: ['disease_hap', 'disease_vap'] },
  { id: 'tx_voriconazole', name: 'Voriconazole', genericName: 'Voriconazole', atcCode: 'J02AC03', category: 'antifungal', treatsDisease: ['disease_invasive_aspergillosis'] },
  { id: 'tx_amphotericin_b', name: 'Amphotericin B', genericName: 'Amphotericin B', atcCode: 'J02AA01', category: 'antifungal', treatsDisease: ['disease_invasive_aspergillosis', 'disease_histoplasmosis'] },
  { id: 'tx_echinocandin', name: 'Echinocandin', genericName: 'Caspofungin/Micafungin', atcCode: 'J02AX04', category: 'antifungal', treatsDisease: ['disease_invasive_aspergillosis'] },
  { id: 'tx_tmp_smx', name: 'Trimethoprim-Sulfamethoxazole', genericName: 'Co-trimoxazole', atcCode: 'J01EE01', category: 'antibiotic', treatsDisease: ['disease_pcp'] },
  { id: 'tx_steroids_pcp', name: 'Corticosteroids for PCP', genericName: 'Prednisolone', atcCode: 'H02AB06', category: 'corticosteroid', treatsDisease: ['disease_pcp'] },
  { id: 'tx_pentamidine', name: 'Pentamidine', genericName: 'Pentamidine', atcCode: 'P01CX01', category: 'antifungal', treatsDisease: ['disease_pcp'] },
  { id: 'tx_oseltamivir', name: 'Oseltamivir', genericName: 'Oseltamivir', atcCode: 'J05AH02', category: 'antiviral', treatsDisease: ['disease_influenza'] },
  { id: 'tx_antibiotics_anaerobic', name: 'Anaerobic Coverage Antibiotics', genericName: 'Metronidazole/Clindamycin', atcCode: 'J01XD01', category: 'antibiotic', treatsDisease: ['disease_aspiration_pneumonia'] },
  { id: 'tx_aspiration_precautions', name: 'Aspiration Precautions', genericName: 'N/A', category: 'other', treatsDisease: ['disease_aspiration_pneumonia'] },
  { id: 'tx_enteral_feeding_plan', name: 'Enteral Feeding Plan', genericName: 'N/A', category: 'other', treatsDisease: ['disease_aspiration_pneumonia'] },
  { id: 'tx_mitral_valve_replacement', name: 'Mitral Valve Replacement', genericName: 'Mechanical/Bioprosthetic valve', category: 'other', treatsDisease: ['disease_mitral_stenosis'] },
  { id: 'tx_mitral_valvuloplasty', name: 'Balloon Mitral Valvuloplasty', genericName: 'N/A', category: 'other', treatsDisease: ['disease_mitral_stenosis'] },
  { id: 'tx_prostacyclin_analogues', name: 'Prostacyclin Analogues', genericName: 'Epoprostenol/Iloprost', atcCode: 'B01AC09', category: 'other', treatsDisease: ['disease_pulmonary_hypertension'] },
  { id: 'tx_endothelin_receptor_antagonist', name: 'Endothelin Receptor Antagonist', genericName: 'Bosentan/Ambrisentan', atcCode: 'C02KX01', category: 'antihypertensive', treatsDisease: ['disease_pulmonary_hypertension'] },
  { id: 'tx_phosphodiesterase_inhibitor', name: 'Phosphodiesterase-5 Inhibitor', genericName: 'Sildenafil/Tadalafil', atcCode: 'G04BE03', category: 'other', treatsDisease: ['disease_pulmonary_hypertension'] },
  { id: 'tx_itrazonazole', name: 'Itraconazole', genericName: 'Itraconazole', atcCode: 'J02AC02', category: 'antifungal', treatsDisease: ['disease_histoplasmosis'] },
  { id: 'tx_workplace_avoidance', name: 'Workplace Avoidance/Separation', genericName: 'N/A', category: 'other', treatsDisease: ['disease_occupational_asthma', 'disease_hypersensitivity_pneumonitis'] },
  { id: 'tx_methotrexate', name: 'Methotrexate', genericName: 'Methotrexate', atcCode: 'L04AX03', category: 'immunosuppressant', treatsDisease: ['disease_sarcoidosis'] },
  { id: 'tx_biologics_anti_tnf', name: 'Anti-TNF Biologics', genericName: 'Infliximab/Adalimumab', atcCode: 'L04AB02', category: 'immunosuppressant', treatsDisease: ['disease_sarcoidosis'] },
  { id: 'tx_airway_clearance_cf', name: 'CF Airway Clearance Therapy', genericName: 'Chest PT/PEP device', category: 'other', treatsDisease: ['disease_cystic_fibrosis', 'disease_primary_ciliary_dyskinesia'] },
  { id: 'tx_dornase_alfa', name: 'Dornase Alfa (Pulmozyme)', genericName: 'Dornase alfa', atcCode: 'R05CB16', category: 'other', treatsDisease: ['disease_cystic_fibrosis'] },
  { id: 'tx_cftr_modulator', name: 'CFTR Modulator Therapy', genericName: 'Ivacaftor/Lumacaftor/Tezacaftor', atcCode: 'R07AX30', category: 'other', treatsDisease: ['disease_cystic_fibrosis'] },
  { id: 'tx_pancreatic_enzymes', name: 'Pancreatic Enzyme Replacement', genericName: 'Lipase/Protease/Amylase', atcCode: 'A09AA02', category: 'other', treatsDisease: ['disease_cystic_fibrosis'] },
  { id: 'tx_influenza_vaccine', name: 'Influenza Vaccine', genericName: 'Seasonal influenza vaccine', atcCode: 'J07BB02', category: 'vaccine' },
  { id: 'tx_pneumococcal_vaccine', name: 'Pneumococcal Vaccine', genericName: 'PCV13/PPSV23', atcCode: 'J07AL01', category: 'vaccine' },
  { id: 'tx_art_initiation', name: 'ART Initiation', genericName: 'Tenofovir/Lamivudine/Dolutegravir', atcCode: 'J05AR27', category: 'antiviral', treatsDisease: ['disease_hiv_related_cough'] },
  { id: 'tx_tb_treatment_hiv', name: 'TB Treatment in HIV', genericName: 'Rifampicin/INH/PZA/EMB', category: 'antibiotic', treatsDisease: ['disease_hiv_related_cough'] },
  { id: 'tx_speech_therapy', name: 'Speech Therapy', genericName: 'N/A', category: 'other', treatsDisease: ['disease_vocal_cord_dysfunction', 'disease_psychogenic_cough'] },
  { id: 'tx_breathing_techniques', name: 'Breathing Techniques', genericName: 'N/A', category: 'other', treatsDisease: ['disease_vocal_cord_dysfunction'] },
  { id: 'tx_gerd_treatment', name: 'GERD Treatment', genericName: 'PPI/Lifestyle', category: 'other', treatsDisease: ['disease_vocal_cord_dysfunction'] },
  { id: 'tx_cognitive_behavioral_therapy', name: 'Cognitive Behavioral Therapy', genericName: 'N/A', category: 'other', treatsDisease: ['disease_psychogenic_cough'] },
  { id: 'tx_hypnosis', name: 'Hypnosis', genericName: 'N/A', category: 'other', treatsDisease: ['disease_psychogenic_cough'] },
  { id: 'tx_lung_protective_ventilation', name: 'Lung Protective Ventilation', genericName: 'N/A', category: 'other', treatsDisease: ['disease_ards'] },
  { id: 'tx_prone_positioning', name: 'Prone Positioning', genericName: 'N/A', category: 'other', treatsDisease: ['disease_ards'] },
  { id: 'tx_neuromuscular_blockade', name: 'Neuromuscular Blockade', genericName: 'Cisatracurium/Rocuronium', atcCode: 'M03AC09', category: 'other', treatsDisease: ['disease_ards'] },
  { id: 'tx_ecmo', name: 'ECMO', genericName: 'V-V ECMO', category: 'other', treatsDisease: ['disease_ards'] },
  { id: 'tx_incentive_spirometry', name: 'Incentive Spirometry', genericName: 'N/A', category: 'other', treatsDisease: ['disease_postop_atelectasis'] },
  { id: 'tx_early_mobilization', name: 'Early Mobilization', genericName: 'N/A', category: 'other', treatsDisease: ['disease_postop_atelectasis'] },
  { id: 'tx_chest_physiotherapy', name: 'Chest Physiotherapy', genericName: 'N/A', category: 'other', treatsDisease: ['disease_postop_atelectasis'] },
  { id: 'tx_bilevel_positive_airway_pressure', name: 'BiPAP / Non-Invasive Ventilation', genericName: 'N/A', category: 'other', treatsDisease: ['disease_postop_atelectasis'] },
  { id: 'tx_antigen_avoidance', name: 'Antigen Avoidance', genericName: 'N/A', category: 'other', treatsDisease: ['disease_hypersensitivity_pneumonitis'] },
  { id: 'tx_immunosuppressant', name: 'Immunosuppressant', genericName: 'Mycophenolate/Azathioprine', atcCode: 'L04AA06', category: 'immunosuppressant', treatsDisease: ['disease_hypersensitivity_pneumonitis'] },
  { id: 'tx_video_assisted_thoracoscopic_surgery', name: 'VATS', genericName: 'Video-assisted thoracoscopic surgery', category: 'other' },
  { id: 'tx_decortication', name: 'Decortication', genericName: 'Surgical decortication', category: 'other' },
  { id: 'tx_blood_transfusion', name: 'Blood Transfusion', genericName: 'Packed red cells', atcCode: 'B05A', category: 'other' },
  { id: 'tx_thoracotomy', name: 'Thoracotomy', genericName: 'Open thoracic surgery', category: 'other' },
];

const MISSING_GUIDELINES: YamlGuideline[] = [
  { id: 'guideline_ats_hap', title: 'ATS/IDSA Guidelines for HAP', issuingBody: 'ATS/IDSA', year: 2023, level: 'global', appliesToDisease: ['disease_hap'] },
  { id: 'guideline_ers_hap', title: 'ERS Guidelines for HAP', issuingBody: 'ERS', year: 2023, level: 'global', appliesToDisease: ['disease_hap'] },
  { id: 'guideline_ats_vap', title: 'ATS/IDSA Guidelines for VAP', issuingBody: 'ATS/IDSA', year: 2023, level: 'global', appliesToDisease: ['disease_vap'] },
  { id: 'guideline_bts_pleural_infection', title: 'BTS Guidelines for Pleural Infection', issuingBody: 'BTS', year: 2023, level: 'global', appliesToDisease: ['disease_empyema'] },
  { id: 'guideline_escmid_fungal', title: 'ESCMID Guidelines for Fungal Infections', issuingBody: 'ESCMID', year: 2023, level: 'global', appliesToDisease: ['disease_invasive_aspergillosis', 'disease_histoplasmosis'] },
  { id: 'guideline_ats_fungal', title: 'ATS Guidelines for Fungal Infections', issuingBody: 'ATS', year: 2023, level: 'global', appliesToDisease: ['disease_invasive_aspergillosis'] },
  { id: 'guideline_who_influenza', title: 'WHO Guidelines for Influenza', issuingBody: 'WHO', year: 2024, level: 'global', appliesToDisease: ['disease_influenza'] },
  { id: 'guideline_cdc_influenza', title: 'CDC Guidelines for Influenza', issuingBody: 'US CDC', year: 2024, level: 'national', country: 'US', appliesToDisease: ['disease_influenza'] },
  { id: 'guideline_escmid_pcp', title: 'ESCMID Guidelines for PCP', issuingBody: 'ESCMID', year: 2022, level: 'global', appliesToDisease: ['disease_pcp'] },
  { id: 'guideline_ats_hp', title: 'ATS Guidelines for Hypersensitivity Pneumonitis', issuingBody: 'ATS', year: 2023, level: 'global', appliesToDisease: ['disease_hypersensitivity_pneumonitis'] },
  { id: 'guideline_esc_valvular', title: 'ESC Guidelines for Valvular Heart Disease', issuingBody: 'ESC', year: 2023, level: 'global', appliesToDisease: ['disease_mitral_stenosis'] },
  { id: 'guideline_aha_valvular', title: 'AHA/ACC Guidelines for Valvular Disease', issuingBody: 'AHA/ACC', year: 2023, level: 'global', appliesToDisease: ['disease_mitral_stenosis'] },
  { id: 'guideline_esc_ph', title: 'ESC/ERS Guidelines for Pulmonary Hypertension', issuingBody: 'ESC/ERS', year: 2023, level: 'global', appliesToDisease: ['disease_pulmonary_hypertension'] },
  { id: 'guideline_ers_ph', title: 'ERS Guidelines for Pulmonary Hypertension', issuingBody: 'ERS', year: 2023, level: 'global', appliesToDisease: ['disease_pulmonary_hypertension'] },
  { id: 'guideline_ats_sarcoidosis', title: 'ATS Guidelines for Sarcoidosis', issuingBody: 'ATS', year: 2023, level: 'global', appliesToDisease: ['disease_sarcoidosis'] },
  { id: 'guideline_who_hiv_respiratory', title: 'WHO Guidelines for HIV-Related Respiratory Disease', issuingBody: 'WHO', year: 2024, level: 'global', appliesToDisease: ['disease_hiv_related_cough'] },
  { id: 'guideline_cff_cf', title: 'CFF Guidelines for Cystic Fibrosis', issuingBody: 'Cystic Fibrosis Foundation', year: 2024, level: 'global', appliesToDisease: ['disease_cystic_fibrosis'] },
  { id: 'guideline_ecfs_cf', title: 'ECFS Guidelines for Cystic Fibrosis', issuingBody: 'European CF Society', year: 2023, level: 'global', appliesToDisease: ['disease_cystic_fibrosis'] },
  { id: 'guideline_ers_pcd', title: 'ERS Guidelines for Primary Ciliary Dyskinesia', issuingBody: 'ERS', year: 2023, level: 'global', appliesToDisease: ['disease_primary_ciliary_dyskinesia'] },
  { id: 'guideline_esicm_ards', title: 'ESICM Guidelines for ARDS', issuingBody: 'ESICM', year: 2023, level: 'global', appliesToDisease: ['disease_ards'] },
  { id: 'guideline_ats_ards', title: 'ATS Guidelines for ARDS', issuingBody: 'ATS', year: 2023, level: 'global', appliesToDisease: ['disease_ards'] },
  { id: 'guideline_occupational_lung_disease', title: 'Guidelines for Occupational Lung Disease', issuingBody: 'ATS/ERS', year: 2023, level: 'global', appliesToDisease: ['disease_silicosis', 'disease_asbestosis', 'disease_occupational_asthma'] },
  { id: 'guideline_ats_occupational_asthma', title: 'ATS Guidelines for Occupational Asthma', issuingBody: 'ATS', year: 2022, level: 'global', appliesToDisease: ['disease_occupational_asthma'] },
  { id: 'guideline_nccn_lymphoma', title: 'NCCN Guidelines for Lymphoma', issuingBody: 'NCCN', year: 2024, level: 'global', appliesToDisease: ['disease_lymphoma_pulmonary'] },
  { id: 'guideline_aspiration_pneumonia', title: 'Clinical Guidelines for Aspiration Pneumonia', issuingBody: 'ATS', year: 2022, level: 'global', appliesToDisease: ['disease_aspiration_pneumonia'] },
  { id: 'guideline_ats_chest_trauma', title: 'ATS Guidelines for Chest Trauma', issuingBody: 'ATS', year: 2023, level: 'global', appliesToDisease: ['disease_hemothorax'] },
];

const MISSING_SCORES: YamlScore[] = [
  { id: 'score_cpisd', name: 'Clinical Pulmonary Infection Score (CPIS)', minScore: 0, maxScore: 12, components: [
    { name: 'Temperature', points: 2 }, { name: 'WBC count', points: 2 }, { name: 'Tracheal secretions', points: 2 },
    { name: 'Oxygenation (PaO2/FiO2)', points: 2 }, { name: 'CXR infiltrate', points: 2 }, { name: 'Sputum culture', points: 2 },
  ], thresholds: [{ level: 'Probable VAP', min: 7, max: 12 }, { level: 'Possible VAP', min: 4, max: 6 }], appliesToDisease: ['disease_vap', 'disease_hap'] },
  { id: 'score_berlin_ards', name: 'Berlin ARDS Definition', minScore: 0, maxScore: 3, components: [
    { name: 'Mild (PaO2/FiO2 200-300)', points: 1 }, { name: 'Moderate (PaO2/FiO2 100-200)', points: 2 }, { name: 'Severe (PaO2/FiO2 <100)', points: 3 },
  ], appliesToDisease: ['disease_ards'] },
  { id: 'score_murray_lis', name: 'Murray Lung Injury Score', minScore: 0, maxScore: 4, appliesToDisease: ['disease_ards'] },
  { id: 'score_scadding_stage', name: 'Scadding Stage (Sarcoidosis)', minScore: 0, maxScore: 4, appliesToDisease: ['disease_sarcoidosis'] },
  { id: 'score_rapid', name: 'RAPID Score (Pleural Infection)', minScore: 0, maxScore: 7, appliesToDisease: ['disease_empyema'] },
  { id: 'score_who_functional_class', name: 'WHO Functional Class (PH)', minScore: 1, maxScore: 4, appliesToDisease: ['disease_pulmonary_hypertension'] },
  { id: 'score_ipi', name: 'International Prognostic Index', minScore: 0, maxScore: 5, appliesToDisease: ['disease_lymphoma_pulmonary'] },
];

const MISSING_SIGNS: YamlSign[] = [
  { id: 'opening_snap', name: 'Opening Snap', examinationType: 'auscultation', bodySystem: 'cardiovascular', supportsDisease: ['disease_mitral_stenosis'] },
  { id: 'diastolic_murmur', name: 'Diastolic Murmur', examinationType: 'auscultation', bodySystem: 'cardiovascular', supportsDisease: ['disease_mitral_stenosis'] },
  { id: 'right_ventricular_heave', name: 'Right Ventricular Heave', examinationType: 'palpation', bodySystem: 'cardiovascular', supportsDisease: ['disease_pulmonary_hypertension'] },
  { id: 'loud_p2', name: 'Loud P2', examinationType: 'auscultation', bodySystem: 'cardiovascular', supportsDisease: ['disease_pulmonary_hypertension'] },
  { id: 'erythema_nodosum', name: 'Erythema Nodosum', examinationType: 'inspection', bodySystem: 'dermatology', supportsDisease: ['disease_sarcoidosis'] },
  { id: 'superior_vena_cava_syndrome', name: 'Superior Vena Cava Syndrome', examinationType: 'inspection', bodySystem: 'cardiovascular', supportsDisease: ['disease_mediastinal_mass', 'disease_lung_cancer', 'disease_lymphoma_pulmonary'] },
  { id: 'situs_inversus', name: 'Situs Inversus', examinationType: 'inspection', bodySystem: 'general', supportsDisease: ['disease_primary_ciliary_dyskinesia'] },
  { id: 'hypotension', name: 'Hypotension', examinationType: 'measurement', bodySystem: 'cardiovascular' },
];

const MISSING_QUESTIONS: YamlQuestion[] = [
  { id: 'q_cough_neonatal', text: 'Was the child born at full term?', dataType: 'boolean', options: ['Yes', 'No'], order: 25 },
  { id: 'q_cough_occupation_details', text: 'Describe your occupation and any exposures to dust, fumes, chemicals', dataType: 'text', order: 26 },
  { id: 'q_cough_improvement_holidays', text: 'Does your cough improve when away from work (weekends/holidays)?', dataType: 'boolean', options: ['Yes', 'No'], order: 27 },
  { id: 'q_cough_hiv_art', text: 'Are you on antiretroviral therapy (ART)?', dataType: 'boolean', options: ['Yes', 'No'], order: 28 },
  { id: 'q_cough_cd4', text: 'What is your most recent CD4 count?', dataType: 'number', order: 29 },
  { id: 'q_cough_transplant', text: 'Have you had an organ transplant?', dataType: 'boolean', options: ['Yes', 'No'], order: 30 },
  { id: 'q_cough_neutropenia', text: 'Are you currently on chemotherapy or have low neutrophils?', dataType: 'boolean', options: ['Yes', 'No'], order: 31 },
  { id: 'q_cough_cystic_fibrosis', text: 'Have you been tested for cystic fibrosis?', dataType: 'single_choice', options: ['Yes, diagnosed', 'Yes, negative', 'No', 'Unknown'], order: 32 },
  { id: 'q_cough_aspiration', text: 'Do you have difficulty swallowing or have you had choking episodes?', dataType: 'boolean', options: ['Yes', 'No'], order: 33 },
  { id: 'q_cough_surgery_recent', text: 'Have you had surgery in the last 30 days?', dataType: 'boolean', options: ['Yes', 'No'], order: 34 },
  { id: 'q_cough_ventilation', text: 'Are you currently on a ventilator?', dataType: 'boolean', options: ['Yes', 'No'], order: 35 },
  { id: 'q_cough_immunosuppressants', text: 'Are you on immunosuppressant medications (steroids, biologics, etc.)?', dataType: 'multiple_choice', options: ['None', 'Oral steroids', 'Biologics', 'Chemotherapy', 'Post-transplant meds', 'Other'], order: 36 },
  { id: 'q_cough_vocal_symptoms', text: 'Do you have hoarseness or voice changes with the cough?', dataType: 'boolean', options: ['Yes', 'No'], order: 37 },
  { id: 'q_cough_psychogenic', text: 'Does the cough disappear when you are asleep or distracted?', dataType: 'boolean', options: ['Yes', 'No'], order: 38 },
  { id: 'q_cough_cancer_history', text: 'Do you have a history of cancer?', dataType: 'boolean', options: ['Yes', 'No'], order: 39 },
];

const ADDITIONAL_PROTOCOLS: YamlProtocol[] = [
  { id: 'prot_hap_management', name: 'HAP Management Protocol', type: 'treatment', steps: [
    'Obtain blood cultures and tracheal aspirate before antibiotics',
    'Start empiric broad-spectrum antibiotics within 1 hour',
    'Cover Pseudomonas + MRSA if risk factors present',
    'De-escalate based on culture results at 48-72 hours',
    'Duration: 7 days (extend if slow response)',
    'Monitor CPIS score daily',
    'Assess for source control (line removal, drainage)',
    'Consider procalcitonin to guide duration',
  ], appliesToDisease: ['disease_hap'] },
  { id: 'prot_vap_management', name: 'VAP Management Protocol', type: 'treatment', steps: [
    'Obtain quantitative tracheal aspirate culture',
    'Start empiric antibiotics covering Pseudomonas + MRSA',
    'Use CPIS to guide therapy decisions',
    'Daily sedation interruption and spontaneous breathing trial',
    'De-escalate antibiotics when culture results available',
    'Duration: 7-8 days (shorter if rapid response)',
    'Monitor for superinfection',
    'Consider 15-day course for Pseudomonas or MRSA',
  ], appliesToDisease: ['disease_vap'] },
  { id: 'prot_ards_management', name: 'ARDS Management Protocol', type: 'treatment', steps: [
    'Confirm diagnosis per Berlin criteria',
    'Low tidal volume ventilation (6 mL/kg PBW)',
    'Plateau pressure <30 cmH2O',
    'Prone positioning if PaO2/FiO2 <150',
    'Neuromuscular blockade if severe dyssynchrony',
    'Conservative fluid strategy',
    'Consider ECMO if refractory hypoxia',
    'Treat underlying cause (sepsis, pneumonia)',
  ], appliesToDisease: ['disease_ards'] },
  { id: 'prot_empyema_management', name: 'Empyema Management Protocol', type: 'treatment', steps: [
    'Diagnostic thoracentesis with pleural fluid analysis',
    'Insert chest drain for drainage',
    'Start empiric antibiotics covering anaerobes',
    'Intrapleural fibrinolytics if loculated',
    'Assess RAPID score for outcome prediction',
    'VATS decortication if chest drain fails',
    'CT chest to assess residual pleural thickening',
    'Duration: minimum 2-4 weeks antibiotics',
  ], appliesToDisease: ['disease_empyema'] },
];

export type CoughCategory = 'infectious' | 'obstructive' | 'cardiovascular' | 'interstitial' | 'neoplastic' | 'upper_airway' | 'gi' | 'drug_induced' | 'occupational' | 'congenital' | 'immunological' | 'psychogenic' | 'trauma' | 'icu_postop' | 'other';

export const DISEASE_CATEGORIES: Record<string, CoughCategory> = {
  disease_cap: 'infectious', disease_hap: 'infectious', disease_vap: 'infectious', disease_empyema: 'infectious',
  disease_pulmonary_tuberculosis: 'infectious', disease_pertussis: 'infectious', disease_acute_bronchitis: 'infectious',
  disease_covid19: 'infectious', disease_influenza: 'infectious', disease_invasive_aspergillosis: 'infectious',
  disease_pcp: 'infectious', disease_histoplasmosis: 'infectious', disease_lung_abscess: 'infectious',
  disease_bronchiolitis: 'infectious', disease_croup: 'infectious', disease_epiglottitis: 'infectious',
  disease_aspiration_pneumonia: 'infectious',
  disease_asthma: 'obstructive', disease_copd: 'obstructive', disease_bronchiectasis: 'obstructive',
  disease_foreign_body_aspiration: 'obstructive', disease_occupational_asthma: 'obstructive',
  disease_heart_failure: 'cardiovascular', disease_pulmonary_embolism: 'cardiovascular',
  disease_mitral_stenosis: 'cardiovascular', disease_pulmonary_hypertension: 'cardiovascular',
  disease_interstitial_lung_disease: 'interstitial', disease_sarcoidosis: 'interstitial',
  disease_hypersensitivity_pneumonitis: 'interstitial',
  disease_lung_cancer: 'neoplastic', disease_mediastinal_mass: 'neoplastic', disease_lymphoma_pulmonary: 'neoplastic',
  disease_postnasal_drip: 'upper_airway', disease_vocal_cord_dysfunction: 'upper_airway',
  disease_gerd: 'gi', disease_ace_inhibitor_cough: 'drug_induced',
  disease_silicosis: 'occupational', disease_asbestosis: 'occupational',
  disease_cystic_fibrosis: 'congenital', disease_primary_ciliary_dyskinesia: 'congenital',
  disease_hiv_related_cough: 'immunological',
  disease_psychogenic_cough: 'psychogenic',
  disease_pneumothorax: 'trauma', disease_hemothorax: 'trauma',
  disease_ards: 'icu_postop', disease_postop_atelectasis: 'icu_postop',
};

export const ALL_DISEASE_IDS: string[] = [
  ...(BASE.diseases?.map(d => d.id) || []),
  ...MISSING_DISEASES_1.map(d => d.id),
  ...MISSING_DISEASES_2.map(d => d.id),
  ...MISSING_DISEASES_3.map(d => d.id),
];

export function mergeComprehensiveDocument(): YamlKnowledgeDocument {
  return {
    version: '3.0.0',
    metadata: {
      title: 'Cough — Comprehensive Clinical Knowledge Graph (v3.0)',
      author: 'AMEXAN Constitutional Engine',
      date: '2026-07-28',
      description: 'Complete knowledge graph for cough: all 19 DDx categories, 50+ diseases, 15 population profiles, mechanisms, phenotypes, investigations, treatments, guidelines, contexts, temporal monitoring, and evidence. Expanded from v2.0 with all ICU, occupational, congenital, immunological, cardiac, fungal, and neoplastic diseases.',
      source: 'who',
      specialty: 'pulmonology',
      tags: ['cough', 'respiratory', 'comprehensive', 'phase3', 'all-categories'],
    },
    mechanisms: [...(BASE.mechanisms || []), ...MISSING_MECHANISMS],
    phenotypes: [...(BASE.phenotypes || []), ...MISSING_PHENOTYPES],
    diseases: [...(BASE.diseases || []), ...MISSING_DISEASES_1, ...MISSING_DISEASES_2, ...MISSING_DISEASES_3],
    investigations: [...(BASE.investigations || []), ...MISSING_INVESTIGATIONS],
    drugs: [...(BASE.drugs || []), ...MISSING_DRUGS],
    guidelines: [...(BASE.guidelines || []), ...MISSING_GUIDELINES],
    contexts: [...(BASE.contexts || []), ...MISSING_CONTEXTS],
    questions: [...(BASE.questions || []), ...MISSING_QUESTIONS],
    signs: [...(BASE.signs || []), ...MISSING_SIGNS],
    scores: [...(BASE.scores || []), ...MISSING_SCORES],
    protocols: [...(BASE.protocols || []), ...ADDITIONAL_PROTOCOLS],
  };
}

export const COUGH_COMPREHENSIVE = mergeComprehensiveDocument();

export function getDiseasesByCategory(category: CoughCategory): string[] {
  return Object.entries(DISEASE_CATEGORIES)
    .filter(([, cat]) => cat === category)
    .map(([id]) => id);
}

export function getMostLikelyDisease(phenotypeIds: string[]): string[] {
  const scored = new Map<string, number>();
  const allPhenotypes = COUGH_COMPREHENSIVE.phenotypes || [];
  for (const pid of phenotypeIds) {
    const phen = allPhenotypes.find(p => p.id === pid);
    if (phen?.suggests) {
      for (const did of phen.suggests) {
        scored.set(did, (scored.get(did) || 0) + 1);
      }
    }
  }
  return [...scored.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);
}

export class DDxEngine {
  evaluate(phenotypeIds: string[], activeContexts: string[], redFlags: string[]): DDxResult {
    const candidates = getMostLikelyDisease(phenotypeIds);
    const weighted = candidates.map(did => {
      const disease = COUGH_COMPREHENSIVE.diseases?.find(d => d.id === did);
      let score = phenotypeIds.filter(pid => disease?.phenotypes?.includes(pid)).length;
      const hasRedFlag = redFlags.some(rf => disease?.symptoms?.some(s => s.symptomId === rf) || disease?.signs?.some(s => s.signId === rf));
      if (hasRedFlag) score += 2;
      if (disease?.emergencyLevel === 'red') score += 1;
      return { diseaseId: did, score, isRedFlag: hasRedFlag, emergencyLevel: disease?.emergencyLevel || 'green' };
    });
    weighted.sort((a, b) => b.score - a.score);
    const top = weighted.slice(0, 5);
    return {
      topDifferentials: top,
      category: this.getTopCategory(top),
      investigationSuggestions: this.getInvestigations(top),
      urgentAction: top.some(d => d.emergencyLevel === 'red' || d.isRedFlag),
    };
  }

  private getTopCategory(differentials: { diseaseId: string; score: number }[]): CoughCategory | 'mixed' {
    const cats = differentials.map(d => DISEASE_CATEGORIES[d.diseaseId]).filter(Boolean);
    const unique = [...new Set(cats)];
    return unique.length === 1 ? unique[0] : 'mixed';
  }

  private getInvestigations(differentials: { diseaseId: string }[]): string[] {
    const invs = new Set<string>();
    for (const d of differentials) {
      const disease = COUGH_COMPREHENSIVE.diseases?.find(ds => ds.id === d.diseaseId);
      disease?.investigations?.forEach(inv => {
        if (inv.timing === 'initial') invs.add(inv.investigationId);
      });
    }
    return [...invs].slice(0, 10);
  }
}

export interface DDxScore {
  diseaseId: string;
  score: number;
  isRedFlag: boolean;
  emergencyLevel: string;
}

export interface DDxResult {
  topDifferentials: DDxScore[];
  category: CoughCategory | 'mixed';
  investigationSuggestions: string[];
  urgentAction: boolean;
}

export const ddxEngine = new DDxEngine();

export const COUGH_DOCUMENTATION_NARRATIVES: Record<string, string[]> = {
  acute_cough: [
    'The patient presents with an acute cough of {duration} duration.',
    'Onset was {onset_type} and the cough is {character}.',
    '{sputum_description}',
    'Associated symptoms include {associated_symptoms}.',
    'On examination, {exam_findings}.',
    'The differential diagnosis includes {differentials}.',
    'Initial plan: {initial_plan}.',
  ],
  chronic_cough: [
    'The patient presents with a chronic cough persisting for {duration} weeks.',
    'The cough is {character} and occurs {timing}.',
    '{sputum_description}',
    'Red flag symptoms: {red_flags}.',
    'Risk factors include {risk_factors}.',
    'On examination, {exam_findings}.',
    'Given the chronicity, the following investigations are warranted: {investigations}.',
  ],
  hemoptysis: [
    'URGENT: The patient reports hemoptysis of {severity}.',
    'The cough is associated with {associated_symptoms}.',
    'Risk factors include {risk_factors}.',
    'On examination, {exam_findings}.',
    'EMERGENCY PLAN: {emergency_plan}.',
  ],
  occupational: [
    'The patient reports cough that improves away from work ({improvement}).',
    'Occupational exposure history: {exposure_history}.',
    'Duration of exposure: {exposure_duration}.',
    'Workplace respiratory protection: {protection}.',
  ],
  immunosuppressed: [
    'The patient is immunocompromised ({immunosuppression_cause}).',
    'CD4 count / neutrophil count: {immune_status}.',
    'Cough duration: {duration}.',
    'Given immune status, broad differential includes opportunistic infections.',
  ],
};

export const COUGH_TEMPORAL_RULES = [
  { id: 'ctr001', concept: 'cough_duration', type: 'threshold_crossing', condition: { window: 24, threshold: 8, direction: 'above' }, action: 'chronic_cough_referral', priority: 5 },
  { id: 'ctr002', concept: 'hemoptysis_volume', type: 'threshold_crossing', condition: { window: 0.25, threshold: 100, direction: 'above' }, action: 'massive_hemoptysis_emergency', priority: 10 },
  { id: 'ctr003', concept: 'cough_fever_duration', type: 'trend', condition: { window: 72, threshold: 72, direction: 'above' }, action: 'persistent_fever_investigate_tb', priority: 7 },
  { id: 'ctr004', concept: 'cough_weight_loss', type: 'rate_of_change', condition: { window: 168, threshold: 5, direction: 'above' }, action: 'constitutional_symptoms_investigate', priority: 7 },
  { id: 'ctr005', concept: 'cough_respiratory_rate', type: 'trend', condition: { window: 1, threshold: 30, direction: 'above', sustained: 2 }, action: 'respiratory_distress_monitor', priority: 10 },
  { id: 'ctr006', concept: 'cough_oxygen_saturation', type: 'trend', condition: { window: 0.5, threshold: 92, direction: 'below' }, action: 'hypoxia_emergency_assessment', priority: 10 },
  { id: 'ctr007', concept: 'cough_sputum_volume', type: 'rate_of_change', condition: { window: 24, threshold: 50, direction: 'above' }, action: 'increased_sputum_reevaluate', priority: 6 },
  { id: 'ctr008', concept: 'cough_exacerbation_frequency', type: 'trend', condition: { window: 720, threshold: 2, direction: 'above', sustained: 3 }, action: 'frequent_exacerbations_specialist', priority: 5 },
];

export interface CoughNarrativeInput {
  duration?: string;
  onset_type?: string;
  character?: string;
  sputum_description?: string;
  associated_symptoms?: string;
  exam_findings?: string;
  differentials?: string;
  initial_plan?: string;
  timing?: string;
  red_flags?: string;
  risk_factors?: string;
  investigations?: string;
  severity?: string;
  emergency_plan?: string;
  improvement?: string;
  exposure_history?: string;
  exposure_duration?: string;
  protection?: string;
  immunosuppression_cause?: string;
  immune_status?: string;
}

export function generateCoughNarrative(template: string, input: CoughNarrativeInput): string {
  const lines = COUGH_DOCUMENTATION_NARRATIVES[template];
  if (!lines) return '';
  return lines.map(l => {
    let filled = l;
    for (const [key, val] of Object.entries(input)) {
      filled = filled.replace(`{${key}}`, val || '[not specified]');
    }
    return filled;
  }).join('\n');
}
