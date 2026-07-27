// ═══════════════════════════════════════════════════════════════
// AMEXAN CLINICAL CONSTITUTION — BOOK XII
// TREATMENT OBJECTS
// Each drug is a self-contained knowledge object.
// Referenced by diseases, never embedded in them.
// ═══════════════════════════════════════════════════════════════

import type { TreatmentObject } from './clinical-knowledge-constitution';

export const AMOXICILLIN: TreatmentObject = {
  id: 'amoxicillin',
  name: 'Amoxicillin',
  genericName: 'Amoxicillin',
  category: 'antibiotic',
  mechanisms: ['infectious'],
  diseasesManaged: ['pneumonia', 'bronchitis', 'sinusitis', 'otitis_media', 'urinary_tract_infection', 'tonsillitis'],
  contraindications: ['Penicillin allergy', 'Infectious mononucleosis'],
  interactions: ['Methotrexate', 'Warfarin (increased INR)'],
  sideEffects: ['Rash', 'Diarrhea', 'Nausea', 'C. difficile colitis'],
  pregnancyCategory: 'A',
  renalAdjustment: 'Reduce dose if CrCl < 30 mL/min',
  hepaticAdjustment: 'No adjustment needed',
  pediatricDosing: '15-25 mg/kg TDS (max 500 mg/dose)',
  adultDosing: '500 mg TDS or 875 mg BD',
  monitoringRequired: ['Renal function if prolonged use'],
  evidenceLevel: 'guideline',
  firstLine: true,
  route: ['oral'],
  duration: '5-7 days (uncomplicated), 7-14 days (pneumonia)',
  notes: 'Take with food to reduce GI upset',
};

export const DOXYCYCLINE: TreatmentObject = {
  id: 'doxycycline',
  name: 'Doxycycline',
  genericName: 'Doxycycline',
  category: 'antibiotic',
  mechanisms: ['infectious'],
  diseasesManaged: ['pneumonia', 'bronchitis', 'sinusitis', 'acne', 'rosacea', 'malaria_prophylaxis', 'rickettsial_infection', 'chlamydia'],
  contraindications: ['Tetracycline allergy', 'Children < 8 years', 'Pregnancy'],
  interactions: ['Antacids', 'Iron supplements', 'Warfarin'],
  sideEffects: ['Photosensitivity', 'Esophagitis', 'GI upset', 'Tooth discoloration'],
  pregnancyCategory: 'D',
  renalAdjustment: 'No adjustment needed',
  hepaticAdjustment: 'Use with caution',
  pediatricDosing: 'Not first-line in children < 8; 2.2 mg/kg BD if used',
  adultDosing: '100 mg BD',
  monitoringRequired: ['Photosensitivity education'],
  evidenceLevel: 'guideline',
  firstLine: true,
  route: ['oral'],
  duration: '7-14 days',
  notes: 'Take with full glass of water, remain upright 30 min',
};

export const CEFTRIAXONE: TreatmentObject = {
  id: 'ceftriaxone',
  name: 'Ceftriaxone',
  genericName: 'Ceftriaxone',
  category: 'antibiotic',
  mechanisms: ['infectious'],
  diseasesManaged: ['pneumonia', 'sepsis', 'meningitis', 'urinary_tract_infection', 'gonorrhea', 'cellulitis'],
  contraindications: ['Cephalosporin allergy (cross-reactivity with penicillin)'],
  interactions: ['Warfarin', 'Calcium-containing solutions'],
  sideEffects: ['Rash', 'Diarrhea', 'Eosinophilia', 'Biliary sludge', 'C. difficile colitis'],
  pregnancyCategory: 'B',
  renalAdjustment: 'No adjustment needed (biliary excretion)',
  hepaticAdjustment: 'No adjustment needed',
  pediatricDosing: '50-100 mg/kg/day IV/IM',
  adultDosing: '1-2 g IV/IM daily',
  monitoringRequired: ['Renal function', 'CBC if prolonged'],
  evidenceLevel: 'guideline',
  firstLine: false,
  route: ['iv', 'im'],
  duration: '5-14 days depending on indication',
  notes: 'Do not administer with calcium-containing IV fluids in neonates',
};

export const SALBUTAMOL: TreatmentObject = {
  id: 'salbutamol_inhaler',
  name: 'Salbutamol Inhaler',
  genericName: 'Salbutamol (Albuterol)',
  category: 'bronchodilator',
  mechanisms: ['obstructive'],
  diseasesManaged: ['asthma', 'copd'],
  contraindications: ['Hypersensitivity'],
  interactions: ['Beta-blockers (antagonize effect)'],
  sideEffects: ['Tachycardia', 'Tremor', 'Headache', 'Hypokalemia'],
  pregnancyCategory: 'C',
  renalAdjustment: 'No adjustment needed',
  hepaticAdjustment: 'No adjustment needed',
  pediatricDosing: '1-2 puffs as needed (with spacer)',
  adultDosing: '1-2 puffs as needed, up to 4 hourly',
  monitoringRequired: ['Symptom control', 'Inhaler technique'],
  evidenceLevel: 'gold_standard',
  firstLine: true,
  route: ['inhaled'],
  duration: 'As needed for symptom relief',
  notes: 'Use with spacer for better lung deposition. > 2 uses/week indicates poor control.',
};

export const BUDESONIDE: TreatmentObject = {
  id: 'budesonide_inhaler',
  name: 'Budesonide Inhaler',
  genericName: 'Budesonide',
  category: 'corticosteroid',
  mechanisms: ['inflammatory', 'allergic'],
  diseasesManaged: ['asthma', 'copd', 'allergic_rhinitis'],
  contraindications: ['Hypersensitivity'],
  interactions: ['CYP3A4 inhibitors (ketoconazole, ritonavir)'],
  sideEffects: ['Oral thrush', 'Dysphonia', 'Cough', 'Adrenal suppression (high dose)'],
  pregnancyCategory: 'B',
  renalAdjustment: 'No adjustment needed',
  hepaticAdjustment: 'No adjustment needed',
  pediatricDosing: '100-200 mcg BD (via spacer)',
  adultDosing: '200-800 mcg BD',
  monitoringRequired: ['Growth in children', 'Adrenal function if high dose'],
  evidenceLevel: 'gold_standard',
  firstLine: true,
  route: ['inhaled'],
  duration: 'Daily long-term controller',
  notes: 'Rinse mouth after use to prevent oral thrush.',
};

export const PREDNISOLONE: TreatmentObject = {
  id: 'prednisolone_oral',
  name: 'Prednisolone (Oral)',
  genericName: 'Prednisolone',
  category: 'corticosteroid',
  mechanisms: ['inflammatory', 'allergic', 'autoimmune'],
  diseasesManaged: ['asthma', 'copd_exacerbation', 'allergic_reaction', 'autoimmune_disease', 'meningitis'],
  contraindications: ['Active untreated infection', 'Fungal infection'],
  interactions: ['NSAIDs (increased GI bleed risk)', 'Warfarin', 'Antidiabetics'],
  sideEffects: ['Hyperglycemia', 'Osteoporosis', 'Weight gain', 'Immunosuppression', 'GI bleeding'],
  pregnancyCategory: 'C',
  renalAdjustment: 'No adjustment needed',
  hepaticAdjustment: 'No adjustment needed',
  pediatricDosing: '1-2 mg/kg/day (max 40-60 mg) for 3-5 days',
  adultDosing: '40-60 mg daily for 5-7 days, no taper needed if < 21 days',
  monitoringRequired: ['Blood glucose', 'Blood pressure', 'Infection signs'],
  evidenceLevel: 'gold_standard',
  firstLine: false,
  route: ['oral', 'iv'],
  duration: 'Short course (5-7 days) for acute exacerbations',
  notes: 'Always use the lowest effective dose for the shortest duration.',
};

export const RIFAMPICIN: TreatmentObject = {
  id: 'rifampicin',
  name: 'Rifampicin',
  genericName: 'Rifampicin',
  category: 'antibiotic',
  mechanisms: ['infectious'],
  diseasesManaged: ['pulmonary_tuberculosis', 'tb_meningitis', 'leprosy', 'staphylococcal_infection'],
  contraindications: ['Hypersensitivity', 'Jaundice'],
  interactions: ['Strong CYP3A4 inducer - many interactions', 'Oral contraceptives', 'Warfarin', 'Antiretrovirals', 'Antifungals'],
  sideEffects: ['Hepatotoxicity', 'Orange-red secretions', 'Rash', 'GI upset', 'Thrombocytopenia'],
  pregnancyCategory: 'C',
  renalAdjustment: 'No adjustment needed',
  hepaticAdjustment: 'Avoid in severe liver disease',
  pediatricDosing: '10-20 mg/kg daily (max 600 mg)',
  adultDosing: '600 mg daily (450 mg if < 50 kg)',
  monitoringRequired: ['LFT monthly', 'CBC'],
  evidenceLevel: 'gold_standard',
  firstLine: true,
  route: ['oral', 'iv'],
  duration: '6 months (TB), 2 months intensive phase',
  notes: 'Colors all bodily fluids orange-red. Counsel patients. Take on empty stomach.',
};

export const ISONIAZID: TreatmentObject = {
  id: 'isoniazid',
  name: 'Isoniazid',
  genericName: 'Isoniazid',
  category: 'antibiotic',
  mechanisms: ['infectious'],
  diseasesManaged: ['pulmonary_tuberculosis', 'latent_tb_infection'],
  contraindications: ['Hypersensitivity', 'Acute liver disease'],
  interactions: ['Phenytoin', 'Carbamazepine', 'Alcohol (increased hepatotoxicity)'],
  sideEffects: ['Hepatotoxicity', 'Peripheral neuropathy', 'Rash', 'Drug-induced lupus'],
  pregnancyCategory: 'C',
  renalAdjustment: 'No adjustment needed',
  hepaticAdjustment: 'Avoid in severe liver disease',
  pediatricDosing: '10-15 mg/kg daily (max 300 mg)',
  adultDosing: '300 mg daily (5 mg/kg)',
  monitoringRequired: ['LFT monthly', 'Peripheral neuropathy symptoms'],
  evidenceLevel: 'gold_standard',
  firstLine: true,
  route: ['oral', 'im'],
  duration: '6 months',
  notes: 'Always give pyridoxine (vitamin B6) to prevent peripheral neuropathy.',
};

export const PYRAZINAMIDE: TreatmentObject = {
  id: 'pyrazinamide',
  name: 'Pyrazinamide',
  genericName: 'Pyrazinamide',
  category: 'antibiotic',
  mechanisms: ['infectious'],
  diseasesManaged: ['pulmonary_tuberculosis'],
  contraindications: ['Hypersensitivity', 'Severe liver disease', 'Acute gout'],
  interactions: ['Uricosuric agents'],
  sideEffects: ['Hepatotoxicity', 'Arthralgia', 'Hyperuricemia', 'Rash', 'GI upset'],
  pregnancyCategory: 'C',
  renalAdjustment: 'Reduce dose in severe renal impairment',
  hepaticAdjustment: 'Avoid in liver disease',
  pediatricDosing: '20-25 mg/kg daily (max 2 g)',
  adultDosing: '1.5-2 g daily (25 mg/kg)',
  monitoringRequired: ['LFT', 'Uric acid', 'Joint pain assessment'],
  evidenceLevel: 'gold_standard',
  firstLine: true,
  route: ['oral'],
  duration: 'First 2 months of TB treatment (intensive phase)',
  notes: 'May cause gout flares. Monitor uric acid.',
};

export const ETHAMBUTOL: TreatmentObject = {
  id: 'ethambutol',
  name: 'Ethambutol',
  genericName: 'Ethambutol',
  category: 'antibiotic',
  mechanisms: ['infectious'],
  diseasesManaged: ['pulmonary_tuberculosis'],
  contraindications: ['Hypersensitivity', 'Pre-existing optic neuritis'],
  interactions: ['Aluminum antacids (reduce absorption)'],
  sideEffects: ['Optic neuritis (dose-dependent)', 'Rash', 'Hyperuricemia', 'GI upset'],
  pregnancyCategory: 'C',
  renalAdjustment: 'Reduce dose if CrCl < 30 mL/min',
  hepaticAdjustment: 'No adjustment needed',
  pediatricDosing: '15-25 mg/kg daily (max 1.5 g)',
  adultDosing: '15-25 mg/kg daily (max 1.5 g)',
  monitoringRequired: ['Visual acuity and color vision monthly'],
  evidenceLevel: 'gold_standard',
  firstLine: true,
  route: ['oral'],
  duration: 'First 2 months of TB treatment (intensive phase)',
  notes: 'Counsel patients to report any visual changes immediately.',
};

export const OXYGEN_THERAPY: TreatmentObject = {
  id: 'oxygen_therapy',
  name: 'Oxygen Therapy',
  genericName: 'Oxygen',
  category: 'other',
  mechanisms: ['ventilatory'],
  diseasesManaged: ['pneumonia', 'asthma', 'copd', 'heart_failure', 'pulmonary_embolism', 'sepsis'],
  contraindications: [],
  interactions: [],
  sideEffects: ['Oxygen toxicity (high concentration, prolonged)', 'Absorption atelectasis', 'Nasal mucosal dryness'],
  pregnancyCategory: 'A',
  renalAdjustment: 'No adjustment needed',
  hepaticAdjustment: 'No adjustment needed',
  pediatricDosing: 'Target SpO2 92-97%',
  adultDosing: 'Target SpO2 92-96% (88-92% if COPD with CO2 retention)',
  monitoringRequired: ['SpO2 continuous', 'ABG if deteriorating', 'FiO2 documentation'],
  evidenceLevel: 'gold_standard',
  firstLine: true,
  route: ['inhaled'],
  duration: 'Continuous until SpO2 stable on room air',
  notes: 'Use nasal cannula or mask. Titrate to target saturation.',
};

export const TREATMENT_REGISTRY: Record<string, TreatmentObject> = {
  amoxicillin: AMOXICILLIN,
  doxycycline: DOXYCYCLINE,
  ceftriaxone: CEFTRIAXONE,
  salbutamol_inhaler: SALBUTAMOL,
  budesonide_inhaler: BUDESONIDE,
  prednisolone_oral: PREDNISOLONE,
  rifampicin: RIFAMPICIN,
  isoniazid: ISONIAZID,
  pyrazinamide: PYRAZINAMIDE,
  ethambutol: ETHAMBUTOL,
  oxygen_therapy: OXYGEN_THERAPY,
};

export function getTreatment(id: string): TreatmentObject | undefined {
  return TREATMENT_REGISTRY[id];
}

export function getTreatmentsByDisease(diseaseId: string): TreatmentObject[] {
  return Object.values(TREATMENT_REGISTRY).filter(t => t.diseasesManaged.includes(diseaseId));
}

export function getTreatmentsByMechanism(mechanism: string): TreatmentObject[] {
  return Object.values(TREATMENT_REGISTRY).filter(t =>
    t.mechanisms.includes(mechanism as any),
  );
}
