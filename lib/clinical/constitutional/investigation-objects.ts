// ═══════════════════════════════════════════════════════════════
// AMEXAN CLINICAL CONSTITUTION — BOOK XI
// INVESTIGATION OBJECTS
// Each investigation is a self-contained knowledge object.
// Visible only when confidence passes thresholds.
// ═══════════════════════════════════════════════════════════════

import type { InvestigationObject, InterpretationRule } from './clinical-knowledge-constitution';

const CHEST_XRAY_INTERPRETATION: InterpretationRule[] = [
  { finding: 'Lobar consolidation', supportsDiseaseIds: ['pneumonia'], contradictsDiseaseIds: ['asthma'], weight: 0.9, notes: 'Classic for bacterial pneumonia' },
  { finding: 'Air-space opacity', supportsDiseaseIds: ['pneumonia'], contradictsDiseaseIds: ['copd'], weight: 0.8, notes: 'Alveolar filling process' },
  { finding: 'Interstitial infiltrates', supportsDiseaseIds: ['pneumonia', 'pulmonary_tuberculosis'], contradictsDiseaseIds: [], weight: 0.5, notes: 'Atypical or viral pneumonia' },
  { finding: 'Cavitary lesion', supportsDiseaseIds: ['pulmonary_tuberculosis'], contradictsDiseaseIds: ['asthma'], weight: 0.85, notes: 'TB, abscess, or cancer' },
  { finding: 'Apical infiltrate', supportsDiseaseIds: ['pulmonary_tuberculosis'], contradictsDiseaseIds: ['pneumonia'], weight: 0.8, notes: 'Classic for TB reactivation' },
  { finding: 'Miliary pattern', supportsDiseaseIds: ['pulmonary_tuberculosis'], contradictsDiseaseIds: [], weight: 0.9, notes: 'Disseminated TB' },
  { finding: 'Pleural effusion', supportsDiseaseIds: ['pneumonia', 'pulmonary_tuberculosis'], contradictsDiseaseIds: ['asthma'], weight: 0.4, notes: 'Parapneumonic or TB effusion' },
  { finding: 'Hyperinflation', supportsDiseaseIds: ['asthma'], contradictsDiseaseIds: ['pneumonia'], weight: 0.6, notes: 'Air trapping in asthma/COPD' },
  { finding: 'Normal', supportsDiseaseIds: ['asthma'], contradictsDiseaseIds: ['pneumonia', 'pulmonary_tuberculosis'], weight: 0.3, notes: 'Asthma may have normal CXR' },
];

export const CHEST_XRAY: InvestigationObject = {
  id: 'chest_xray',
  name: 'Chest X-ray',
  category: 'imaging_xray',
  purpose: 'Evaluate lung parenchyma, pleura, mediastinum, and chest wall',
  mechanismSupported: ['infectious', 'inflammatory', 'obstructive', 'neoplastic', 'cardiac', 'ventilatory'],
  diseasesSupported: ['pneumonia', 'pulmonary_tuberculosis', 'asthma', 'copd', 'bronchiectasis', 'lung_cancer', 'heart_failure', 'pneumothorax', 'pleural_effusion'],
  diseasesExcluded: ['asthma'],
  contraindications: ['Pregnancy (relative, use abdominal shielding)'],
  sensitivity: 0.85,
  specificity: 0.90,
  positivePredictiveValue: 0.85,
  negativePredictiveValue: 0.85,
  interpretationRules: CHEST_XRAY_INTERPRETATION,
  falsePositives: ['Technical artifacts', 'Old scarring mistaken for infiltrate', 'Obesity'],
  falseNegatives: ['Early pneumonia', 'Small effusions', 'Apical TB', 'Immunocompromised'],
  cost: 'low',
  urgency: 'urgent',
  preparationRequired: [],
  turnaroundTime: 'Immediate-2 hours',
  requiresSpecialist: false,
  activationThreshold: 0.2,
  ageRestrictions: [],
  pregnancySafety: 'Safe with abdominal shielding',
};

const CBC_INTERPRETATION: InterpretationRule[] = [
  { finding: 'Leukocytosis with left shift', supportsDiseaseIds: ['pneumonia'], contradictsDiseaseIds: ['asthma'], weight: 0.6, notes: 'Bacterial infection' },
  { finding: 'Leukopenia', supportsDiseaseIds: ['pneumonia'], contradictsDiseaseIds: [], weight: 0.4, notes: 'Severe infection or viral' },
  { finding: 'Eosinophilia', supportsDiseaseIds: ['asthma'], contradictsDiseaseIds: ['pneumonia'], weight: 0.5, notes: 'Allergic or parasitic' },
  { finding: 'Lymphocytosis', supportsDiseaseIds: ['pulmonary_tuberculosis'], contradictsDiseaseIds: ['pneumonia'], weight: 0.3, notes: 'Viral or TB' },
  { finding: 'Normal', supportsDiseaseIds: ['asthma'], contradictsDiseaseIds: ['pneumonia'], weight: 0.1, notes: 'May be normal in mild disease' },
  { finding: 'Anemia', supportsDiseaseIds: ['pulmonary_tuberculosis'], contradictsDiseaseIds: [], weight: 0.2, notes: 'Chronic disease anemia' },
];

export const CBC: InvestigationObject = {
  id: 'cbc',
  name: 'Complete Blood Count',
  category: 'lab_blood',
  purpose: 'Assess for infection, inflammation, anemia, and cell line abnormalities',
  mechanismSupported: ['infectious', 'inflammatory', 'neoplastic', 'allergic'],
  diseasesSupported: ['pneumonia', 'pulmonary_tuberculosis', 'asthma', 'sepsis', 'malaria', 'typhoid'],
  diseasesExcluded: [],
  contraindications: [],
  sensitivity: 0.75,
  specificity: 0.65,
  positivePredictiveValue: 0.6,
  negativePredictiveValue: 0.8,
  interpretationRules: CBC_INTERPRETATION,
  falsePositives: ['Stress leukocytosis', 'Steroid-induced'],
  falseNegatives: ['Immunocompromised with normal WBC', 'Early infection'],
  cost: 'low',
  urgency: 'urgent',
  preparationRequired: [],
  turnaroundTime: '30 min-2 hours',
  requiresSpecialist: false,
  activationThreshold: 0.15,
  ageRestrictions: [],
  pregnancySafety: 'Safe',
};

const CRP_INTERPRETATION: InterpretationRule[] = [
  { finding: 'CRP > 100 mg/L', supportsDiseaseIds: ['pneumonia', 'sepsis'], contradictsDiseaseIds: ['asthma'], weight: 0.7, notes: 'Significant bacterial infection' },
  { finding: 'CRP 20-100 mg/L', supportsDiseaseIds: ['pneumonia', 'pulmonary_tuberculosis'], contradictsDiseaseIds: [], weight: 0.4, notes: 'Moderate inflammation' },
  { finding: 'CRP < 10 mg/L', supportsDiseaseIds: ['asthma'], contradictsDiseaseIds: ['pneumonia'], weight: 0.3, notes: 'Unlikely significant bacterial infection' },
];

export const CRP: InvestigationObject = {
  id: 'crp',
  name: 'C-Reactive Protein',
  category: 'lab_blood',
  purpose: 'Assess acute inflammatory response',
  mechanismSupported: ['inflammatory', 'infectious'],
  diseasesSupported: ['pneumonia', 'pulmonary_tuberculosis', 'sepsis', 'cellulitis'],
  diseasesExcluded: ['asthma'],
  contraindications: [],
  sensitivity: 0.85,
  specificity: 0.70,
  positivePredictiveValue: 0.7,
  negativePredictiveValue: 0.85,
  interpretationRules: CRP_INTERPRETATION,
  falsePositives: ['Any inflammatory condition', 'Post-surgery', 'Trauma'],
  falseNegatives: ['Early infection', 'Immunocompromised'],
  cost: 'low',
  urgency: 'routine',
  preparationRequired: [],
  turnaroundTime: '1-4 hours',
  requiresSpecialist: false,
  activationThreshold: 0.15,
  ageRestrictions: [],
  pregnancySafety: 'Safe',
};

const SPUTUM_GENEXPERT_INTERPRETATION: InterpretationRule[] = [
  { finding: 'MTB detected, rifampicin sensitive', supportsDiseaseIds: ['pulmonary_tuberculosis'], contradictsDiseaseIds: ['pneumonia'], weight: 0.99, notes: 'Confirmed TB, drug-sensitive' },
  { finding: 'MTB detected, rifampicin resistant', supportsDiseaseIds: ['pulmonary_tuberculosis'], contradictsDiseaseIds: ['pneumonia'], weight: 0.99, notes: 'MDR-TB suspected' },
  { finding: 'MTB not detected', supportsDiseaseIds: ['pneumonia'], contradictsDiseaseIds: ['pulmonary_tuberculosis'], weight: 0.7, notes: 'TB less likely but not excluded' },
];

export const GENEXPERT: InvestigationObject = {
  id: 'genexpert',
  name: 'GeneXpert MTB/RIF',
  category: 'microbiology',
  purpose: 'Detect M. tuberculosis DNA and rifampicin resistance',
  mechanismSupported: ['infectious'],
  diseasesSupported: ['pulmonary_tuberculosis'],
  diseasesExcluded: [],
  contraindications: [],
  sensitivity: 0.95,
  specificity: 0.99,
  positivePredictiveValue: 0.98,
  negativePredictiveValue: 0.96,
  interpretationRules: SPUTUM_GENEXPERT_INTERPRETATION,
  falsePositives: ['Lab contamination (rare)'],
  falseNegatives: ['Low bacterial load', 'Poor sample quality', 'Extra-pulmonary TB'],
  cost: 'medium',
  urgency: 'urgent',
  preparationRequired: ['Sputum sample (preferably morning)', 'N95 mask for collection'],
  turnaroundTime: '2-24 hours',
  requiresSpecialist: false,
  activationThreshold: 0.3,
  ageRestrictions: [],
  pregnancySafety: 'Safe',
};

const SPUTUM_AFB_INTERPRETATION: InterpretationRule[] = [
  { finding: 'AFB positive (3+)', supportsDiseaseIds: ['pulmonary_tuberculosis'], contradictsDiseaseIds: ['pneumonia'], weight: 0.95, notes: 'High burden TB' },
  { finding: 'AFB positive (1+ or 2+)', supportsDiseaseIds: ['pulmonary_tuberculosis'], contradictsDiseaseIds: ['pneumonia'], weight: 0.85, notes: 'Confirmed TB' },
  { finding: 'AFB negative', supportsDiseaseIds: ['pneumonia'], contradictsDiseaseIds: ['pulmonary_tuberculosis'], weight: 0.3, notes: 'TB not excluded' },
];

export const SPUTUM_AFB: InvestigationObject = {
  id: 'sputum_afb',
  name: 'Sputum AFB Microscopy',
  category: 'microbiology',
  purpose: 'Detect acid-fast bacilli in sputum',
  mechanismSupported: ['infectious'],
  diseasesSupported: ['pulmonary_tuberculosis'],
  diseasesExcluded: [],
  contraindications: [],
  sensitivity: 0.60,
  specificity: 0.98,
  positivePredictiveValue: 0.95,
  negativePredictiveValue: 0.7,
  interpretationRules: SPUTUM_AFB_INTERPRETATION,
  falsePositives: ['Non-tuberculous mycobacteria', 'Lab error'],
  falseNegatives: ['Low bacterial load', 'Poor sample', 'Extra-pulmonary TB'],
  cost: 'low',
  urgency: 'routine',
  preparationRequired: ['Morning sputum sample x 2-3', 'N95 mask'],
  turnaroundTime: '24 hours',
  requiresSpecialist: false,
  activationThreshold: 0.25,
  ageRestrictions: [],
  pregnancySafety: 'Safe',
};

const CT_CHEST_INTERPRETATION: InterpretationRule[] = [
  { finding: 'Consolidation with air bronchogram', supportsDiseaseIds: ['pneumonia'], contradictsDiseaseIds: [], weight: 0.95, notes: 'Confirmatory for pneumonia' },
  { finding: 'Tree-in-bud opacities', supportsDiseaseIds: ['pulmonary_tuberculosis', 'bronchiectasis'], contradictsDiseaseIds: [], weight: 0.85, notes: 'Endobronchial spread of TB' },
  { finding: 'Apical cavitation', supportsDiseaseIds: ['pulmonary_tuberculosis'], contradictsDiseaseIds: ['pneumonia'], weight: 0.9, notes: 'Classic post-primary TB' },
  { finding: 'Ground-glass opacities', supportsDiseaseIds: ['pneumonia'], contradictsDiseaseIds: [], weight: 0.6, notes: 'Atypical pneumonia, viral, or early disease' },
  { finding: 'Bronchial wall thickening', supportsDiseaseIds: ['asthma'], contradictsDiseaseIds: ['pneumonia'], weight: 0.5, notes: 'Airway inflammation' },
  { finding: 'Mosaic attenuation', supportsDiseaseIds: ['asthma'], contradictsDiseaseIds: ['pneumonia'], weight: 0.4, notes: 'Air trapping' },
];

export const CT_CHEST: InvestigationObject = {
  id: 'ct_chest',
  name: 'CT Chest',
  category: 'imaging_ct',
  purpose: 'Detailed evaluation of lung parenchyma, airways, and mediastinum',
  mechanismSupported: ['infectious', 'inflammatory', 'obstructive', 'neoplastic', 'vascular'],
  diseasesSupported: ['pneumonia', 'pulmonary_tuberculosis', 'bronchiectasis', 'lung_cancer', 'pulmonary_embolism'],
  diseasesExcluded: [],
  contraindications: ['Contrast allergy (if contrast needed)', 'Renal failure (if contrast needed)'],
  sensitivity: 0.95,
  specificity: 0.90,
  positivePredictiveValue: 0.9,
  negativePredictiveValue: 0.95,
  interpretationRules: CT_CHEST_INTERPRETATION,
  falsePositives: ['Motion artifact', 'Old healed lesions'],
  falseNegatives: ['Early ground-glass disease', 'Very small nodules'],
  cost: 'high',
  urgency: 'urgent',
  preparationRequired: ['IV access for contrast', 'Check renal function'],
  turnaroundTime: '1-4 hours',
  requiresSpecialist: true,
  activationThreshold: 0.5,
  ageRestrictions: [],
  pregnancySafety: 'Contraindicated in pregnancy (unless absolutely necessary)',
};

export const SPIROMETRY: InvestigationObject = {
  id: 'spirometry',
  name: 'Spirometry',
  category: 'function_test',
  purpose: 'Assess lung function, detect obstructive or restrictive patterns',
  mechanismSupported: ['obstructive', 'restrictive', 'ventilatory'],
  diseasesSupported: ['asthma', 'copd', 'restrictive_lung_disease'],
  diseasesExcluded: [],
  contraindications: ['Recent thoracic surgery', 'Hemoptysis', 'Pneumothorax'],
  sensitivity: 0.85,
  specificity: 0.90,
  positivePredictiveValue: 0.85,
  negativePredictiveValue: 0.88,
  interpretationRules: [
    { finding: 'FEV1/FVC < 0.7 with bronchodilator reversibility > 12%', supportsDiseaseIds: ['asthma'], contradictsDiseaseIds: ['copd'], weight: 0.9, notes: 'Confirmatory for asthma' },
    { finding: 'FEV1/FVC < 0.7 without reversibility', supportsDiseaseIds: ['copd'], contradictsDiseaseIds: ['asthma'], weight: 0.8, notes: 'Consistent with COPD' },
    { finding: 'Normal', supportsDiseaseIds: [], contradictsDiseaseIds: ['asthma', 'copd'], weight: 0.3, notes: 'Normal spirometry does not exclude asthma' },
  ],
  falsePositives: ['Poor effort', 'Technical error'],
  falseNegatives: ['Mild disease', 'Poor patient effort'],
  cost: 'low',
  urgency: 'routine',
  preparationRequired: ['Avoid bronchodilators 4-6 hours before', 'No smoking 1 hour before'],
  turnaroundTime: 'Same day',
  requiresSpecialist: false,
  activationThreshold: 0.3,
  ageRestrictions: ['Age > 5 years (requires cooperation)'],
  pregnancySafety: 'Safe',
};

export const INVESTIGATION_REGISTRY: Record<string, InvestigationObject> = {
  chest_xray: CHEST_XRAY,
  cbc: CBC,
  crp: CRP,
  genexpert: GENEXPERT,
  sputum_afb: SPUTUM_AFB,
  ct_chest: CT_CHEST,
  spirometry: SPIROMETRY,
};

export function getInvestigation(id: string): InvestigationObject | undefined {
  return INVESTIGATION_REGISTRY[id];
}

export function getInvestigationsByDisease(diseaseId: string): InvestigationObject[] {
  return Object.values(INVESTIGATION_REGISTRY).filter(inv =>
    inv.diseasesSupported.includes(diseaseId),
  );
}

export function getInvestigationsByMechanism(mechanism: string): InvestigationObject[] {
  return Object.values(INVESTIGATION_REGISTRY).filter(inv =>
    inv.mechanismSupported.includes(mechanism as any),
  );
}
