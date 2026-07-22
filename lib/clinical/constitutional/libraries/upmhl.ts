export interface UPMHLEntry {
  id: string;
  label: string;
  system: string;
  isChronic: boolean;
  pediatricSpecific: boolean;
  categories: string[];
}

const UPMHL_DISEASES: UPMHLEntry[] = [
  { id: 'hypertension', label: 'Hypertension', system: 'cardiovascular', isChronic: true, pediatricSpecific: false, categories: ['cardiovascular', 'chronic'] },
  { id: 'diabetes_mellitus_type_1', label: 'Diabetes Mellitus Type 1', system: 'endocrine', isChronic: true, pediatricSpecific: false, categories: ['endocrine', 'chronic'] },
  { id: 'diabetes_mellitus_type_2', label: 'Diabetes Mellitus Type 2', system: 'endocrine', isChronic: true, pediatricSpecific: false, categories: ['endocrine', 'chronic'] },
  { id: 'asthma', label: 'Asthma', system: 'respiratory', isChronic: true, pediatricSpecific: false, categories: ['respiratory', 'chronic'] },
  { id: 'hiv_aids', label: 'HIV / AIDS', system: 'infectious', isChronic: true, pediatricSpecific: false, categories: ['infectious', 'chronic'] },
  { id: 'sickle_cell_disease', label: 'Sickle Cell Disease', system: 'hematology', isChronic: true, pediatricSpecific: false, categories: ['hematology', 'chronic', 'genetic'] },
  { id: 'tuberculosis', label: 'Tuberculosis', system: 'infectious', isChronic: false, pediatricSpecific: false, categories: ['infectious'] },
  { id: 'epilepsy', label: 'Epilepsy', system: 'neurology', isChronic: true, pediatricSpecific: false, categories: ['neurology', 'chronic'] },
  { id: 'congenital_heart_disease', label: 'Congenital Heart Disease', system: 'cardiovascular', isChronic: true, pediatricSpecific: true, categories: ['cardiovascular', 'chronic', 'congenital'] },
  { id: 'rheumatic_heart_disease', label: 'Rheumatic Heart Disease', system: 'cardiovascular', isChronic: true, pediatricSpecific: false, categories: ['cardiovascular', 'chronic'] },
  { id: 'chronic_kidney_disease', label: 'Chronic Kidney Disease', system: 'renal', isChronic: true, pediatricSpecific: false, categories: ['renal', 'chronic'] },
  { id: 'malaria', label: 'Malaria', system: 'infectious', isChronic: false, pediatricSpecific: false, categories: ['infectious'] },
  { id: 'malnutrition', label: 'Malnutrition', system: 'nutrition', isChronic: true, pediatricSpecific: true, categories: ['nutrition', 'chronic'] },
  { id: 'sickle_cell_trait', label: 'Sickle Cell Trait', system: 'hematology', isChronic: true, pediatricSpecific: false, categories: ['hematology', 'genetic'] },
  { id: 'g6pd_deficiency', label: 'G6PD Deficiency', system: 'hematology', isChronic: true, pediatricSpecific: true, categories: ['hematology', 'genetic'] },
  { id: 'congenital_hypothyroidism', label: 'Congenital Hypothyroidism', system: 'endocrine', isChronic: true, pediatricSpecific: true, categories: ['endocrine', 'chronic', 'congenital'] },
  { id: 'cleft_lip_palate', label: 'Cleft Lip / Palate', system: 'genetic', isChronic: true, pediatricSpecific: true, categories: ['genetic', 'congenital'] },
  { id: 'cerebral_palsy', label: 'Cerebral Palsy', system: 'neurology', isChronic: true, pediatricSpecific: true, categories: ['neurology', 'chronic', 'developmental'] },
  { id: 'down_syndrome', label: 'Down Syndrome', system: 'genetic', isChronic: true, pediatricSpecific: true, categories: ['genetic', 'congenital'] },
  { id: 'autism_spectrum', label: 'Autism Spectrum Disorder', system: 'psychiatry', isChronic: true, pediatricSpecific: true, categories: ['psychiatry', 'chronic', 'developmental'] },
  { id: 'adhd', label: 'ADHD', system: 'psychiatry', isChronic: true, pediatricSpecific: true, categories: ['psychiatry', 'chronic', 'developmental'] },
  { id: 'chronic_liver_disease', label: 'Chronic Liver Disease', system: 'gastroenterology', isChronic: true, pediatricSpecific: false, categories: ['gastroenterology', 'chronic'] },
  { id: 'peptic_ulcer_disease', label: 'Peptic Ulcer Disease', system: 'gastroenterology', isChronic: true, pediatricSpecific: false, categories: ['gastroenterology', 'chronic'] },
  { id: 'inflammatory_bowel', label: 'Inflammatory Bowel Disease', system: 'gastroenterology', isChronic: true, pediatricSpecific: false, categories: ['gastroenterology', 'chronic'] },
  { id: 'thyroid_disorder', label: 'Thyroid Disorder', system: 'endocrine', isChronic: true, pediatricSpecific: false, categories: ['endocrine', 'chronic'] },
  { id: 'heart_failure', label: 'Heart Failure', system: 'cardiovascular', isChronic: true, pediatricSpecific: false, categories: ['cardiovascular', 'chronic'] },
  { id: 'coronary_artery', label: 'Coronary Artery Disease', system: 'cardiovascular', isChronic: true, pediatricSpecific: false, categories: ['cardiovascular', 'chronic'] },
  { id: 'stroke', label: 'Stroke / CVA', system: 'neurology', isChronic: true, pediatricSpecific: false, categories: ['neurology', 'chronic'] },
  { id: 'depression', label: 'Depression', system: 'psychiatry', isChronic: true, pediatricSpecific: false, categories: ['psychiatry', 'chronic'] },
  { id: 'bipolar', label: 'Bipolar Disorder', system: 'psychiatry', isChronic: true, pediatricSpecific: false, categories: ['psychiatry', 'chronic'] },
  { id: 'schizophrenia', label: 'Schizophrenia', system: 'psychiatry', isChronic: true, pediatricSpecific: false, categories: ['psychiatry', 'chronic'] },
  { id: 'glaucoma', label: 'Glaucoma', system: 'ophthalmology', isChronic: true, pediatricSpecific: false, categories: ['ophthalmology', 'chronic'] },
  { id: 'cataract', label: 'Cataract', system: 'ophthalmology', isChronic: false, pediatricSpecific: false, categories: ['ophthalmology'] },
  { id: 'hepatitis_b', label: 'Hepatitis B', system: 'infectious', isChronic: true, pediatricSpecific: false, categories: ['infectious', 'chronic'] },
  { id: 'hepatitis_c', label: 'Hepatitis C', system: 'infectious', isChronic: true, pediatricSpecific: false, categories: ['infectious', 'chronic'] },
  { id: 'cancer', label: 'Cancer (specify)', system: 'oncology', isChronic: false, pediatricSpecific: false, categories: ['oncology'] },
  { id: 'pneumonia_history', label: 'Pneumonia (recurrent)', system: 'respiratory', isChronic: false, pediatricSpecific: false, categories: ['respiratory'] },
  { id: 'meningitis_history', label: 'Meningitis', system: 'infectious', isChronic: false, pediatricSpecific: false, categories: ['infectious', 'neurology'] },
];

export function searchUPMHL(query: string): UPMHLEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return UPMHL_DISEASES.filter(d =>
    d.label.toLowerCase().includes(q) ||
    d.system.toLowerCase().includes(q) ||
    d.categories.some(c => c.includes(q))
  ).slice(0, 15);
}

export function getUPMHLEntry(id: string): UPMHLEntry | undefined {
  return UPMHL_DISEASES.find(d => d.id === id);
}

export function getPediatricDiseases(): UPMHLEntry[] {
  return UPMHL_DISEASES.filter(d => d.pediatricSpecific);
}

export function getChronicDiseases(): UPMHLEntry[] {
  return UPMHL_DISEASES.filter(d => d.isChronic);
}

export const UPMHL_SYSTEMS = [
  'cardiovascular', 'respiratory', 'gastroenterology', 'neurology',
  'endocrine', 'renal', 'hematology', 'infectious', 'psychiatry',
  'ophthalmology', 'oncology', 'nutrition', 'genetic',
];
