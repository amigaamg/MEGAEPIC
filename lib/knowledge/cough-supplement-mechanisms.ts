import type { YamlMechanism, YamlPhenotype } from './yaml-schema';

export const MISSING_MECHANISMS: YamlMechanism[] = [
  { id: 'mech_consolidation_cavitation', name: 'Cavitary Consolidation', category: 'infectious', description: 'Necrotizing infection leading to cavitary lesions', phenotypes: ['phen_chronic_productive', 'phen_hemoptysis', 'phen_constitutional'] },
  { id: 'mech_aspiration_chemical', name: 'Chemical Aspiration Pneumonitis', category: 'inflammatory', description: 'Chemical injury to lung parenchyma from aspirated gastric contents', phenotypes: ['phen_acute_onset', 'phen_productive_with_fever'] },
  { id: 'mech_pulmonary_hypertension', name: 'Pulmonary Vascular Remodeling', category: 'vascular', description: 'Remodeling of pulmonary vasculature leading to right heart strain', phenotypes: ['phen_exertional_cough', 'phen_dry_cough'] },
  { id: 'mech_mitral_valve_dysfunction', name: 'Mitral Valve Dysfunction', category: 'vascular', description: 'Left atrial pressure elevation from mitral stenosis or regurgitation', phenotypes: ['phen_exertional_cough', 'phen_orthopnea', 'phen_hemoptysis'] },
  { id: 'mech_granulomatous_nonnecrotizing', name: 'Non-necrotizing Granulomatous Inflammation', category: 'autoimmune', description: 'Granuloma formation without necrosis, typical of sarcoidosis', phenotypes: ['phen_dry_cough', 'phen_exertional_cough'] },
  { id: 'mech_hypersensitivity_pneumonitis', name: 'Hypersensitivity Pneumonitis', category: 'autoimmune', description: 'Immune-mediated inflammation from inhaled organic antigens', phenotypes: ['phen_dry_cough', 'phen_acute_onset', 'phen_exertional_cough'] },
  { id: 'mech_lymphoproliferative', name: 'Lymphoproliferative Infiltration', category: 'neoplastic', description: 'Infiltration of lung parenchyma by lymphoid malignancies', phenotypes: ['phen_dry_cough', 'phen_constitutional'] },
  { id: 'mech_vocal_cord_dysfunction', name: 'Vocal Cord Dysfunction', category: 'functional', description: 'Paradoxical vocal cord adduction causing airflow limitation', phenotypes: ['phen_dry_cough', 'phen_wheeze_dominant', 'phen_stridor'] },
  { id: 'mech_mucociliary_dysfunction', name: 'Mucociliary Clearance Failure', category: 'congenital', description: 'Impaired mucociliary clearance from ciliary dysfunction or thick mucus', phenotypes: ['phen_chronic_productive', 'phen_neonatal_cough'] },
  { id: 'mech_pleural_effusion', name: 'Pleural Effusion', category: 'inflammatory', description: 'Fluid accumulation in pleural space causing compressive cough', phenotypes: ['phen_dry_cough', 'phen_pleuritic_cough'] },
  { id: 'mech_atelectasis', name: 'Atelectasis', category: 'degenerative', description: 'Alveolar collapse causing reduced lung volume and cough', phenotypes: ['phen_dry_cough', 'phen_acute_onset'] },
  { id: 'mech_ventilator_associated', name: 'Ventilator-Associated Airway Injury', category: 'iatrogenic', description: 'Airway inflammation and infection from mechanical ventilation', phenotypes: ['phen_productive_with_fever', 'phen_immunocompromised_cough'] },
  { id: 'mech_influenza_viral', name: 'Influenza Viral Pneumonitis', category: 'infectious', description: 'Direct viral injury to alveolar epithelium', phenotypes: ['phen_acute_productive', 'phen_dry_cough', 'phen_constitutional'] },
  { id: 'mech_fungal_invasion', name: 'Fungal Parenchymal Invasion', category: 'infectious', description: 'Fungal hyphae invading lung parenchyma causing granulomatous or angioinvasive disease', phenotypes: ['phen_chronic_productive', 'phen_hemoptysis', 'phen_immunocompromised_cough'] },
];

export const MISSING_PHENOTYPES: YamlPhenotype[] = [
  { id: 'phen_fungal_cough', name: 'Fungal Cough Syndrome', features: ['chronic cough', 'immunocompromised host', 'hemoptysis possible', 'cavitary lesions on imaging'], urgency: 'urgent', suggests: ['disease_aspergillosis', 'disease_pcp', 'disease_histoplasmosis'] },
  { id: 'phen_cardiac_cough', name: 'Cardiac Cough Syndrome', features: ['nocturnal cough', 'orthopnea', 'pedal edema', 'exertional dyspnea'], urgency: 'urgent', suggests: ['disease_heart_failure', 'disease_mitral_stenosis', 'disease_pulmonary_hypertension'] },
  { id: 'phen_aspiration_syndrome', name: 'Aspiration Syndrome', features: ['cough after meals', 'dysphagia', 'neurological impairment', 'recurrent pneumonia'], urgency: 'urgent', suggests: ['disease_aspiration_pneumonia', 'disease_lung_abscess', 'disease_gerd'] },
  { id: 'phen_vap_syndrome', name: 'VAP Syndrome', features: ['mechanical ventilation >48 hours', 'new fever', 'increased secretions', 'worsening oxygenation'], urgency: 'emergency', suggests: ['disease_vap'] },
  { id: 'phen_postop_cough', name: 'Post-Operative Cough', features: ['post-surgery within 72 hours', 'reduced breath sounds', 'low-grade fever', 'atelectasis'], urgency: 'urgent', suggests: ['disease_postop_atelectasis', 'disease_hap', 'disease_pulmonary_embolism'] },
  { id: 'phen_occupational_cough', name: 'Occupational Cough', features: ['cough improves on weekends/holidays', 'workplace exposure', 'progressive dyspnea'], urgency: 'routine', suggests: ['disease_occupational_asthma', 'disease_pneumoconiosis', 'disease_silicosis', 'disease_asbestosis'] },
  { id: 'phen_psychogenic_cough', name: 'Psychogenic Cough', features: ['disappears during sleep', 'no organic findings', 'honking character', 'distractible'], urgency: 'routine', suggests: ['disease_psychogenic_cough'] },
  { id: 'phen_ards_cough', name: 'ARDS Syndrome', features: ['acute onset <1 week', 'bilateral infiltrates', 'pao2_fio2 <300', 'not cardiac'], urgency: 'emergency', suggests: ['disease_ards'] },
  { id: 'phen_trauma_cough', name: 'Post-Traumatic Cough', features: ['chest trauma', 'hemoptysis', 'respiratory distress', 'subcutaneous emphysema'], urgency: 'emergency', suggests: ['disease_hemothorax', 'disease_pneumothorax', 'disease_pulmonary_contusion'] },
];
