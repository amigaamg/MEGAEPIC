import type { DepartmentDefinition } from './index';

export const internalMedicine: DepartmentDefinition = {
  id: 'IM',
  name: 'Internal Medicine',
  shortName: 'IM',
  description: 'Adult internal medicine encompassing diagnosis and non-surgical management of complex multi-system diseases across all medical subspecialties.',
  icon: '🏥',
  color: '#3b82f6',
  sections: [
    {
      id: 'general-medicine',
      name: 'General Medicine',
      description: 'Acute and chronic multi-system medical conditions in adults',
      diseaseCategories: ['Acute febrile illness', 'Sepsis and bacteraemia', 'Electrolyte disorders', 'Nutritional deficiencies', 'Syncope and collapse'],
    },
    {
      id: 'infectious-disease',
      name: 'Infectious Diseases',
      description: 'Bacterial, viral, fungal and parasitic infections requiring medical management',
      diseaseCategories: ['Community-acquired infections', 'Hospital-acquired infections', 'Tropical medicine', 'HIV/AIDS', 'Tuberculosis', 'Antimicrobial stewardship'],
    },
    {
      id: 'hypertension',
      name: 'Hypertension & Cardiovascular Risk',
      description: 'Primary and secondary hypertension, lipid disorders, cardiovascular prevention',
      diseaseCategories: ['Essential hypertension', 'Secondary hypertension', 'Dyslipidaemia', 'Metabolic syndrome', 'Hypertensive urgency/emergency'],
    },
    {
      id: 'allergy-immunology',
      name: 'Allergy & Clinical Immunology',
      description: 'Allergic disorders, primary and secondary immunodeficiencies',
      diseaseCategories: ['Anaphylaxis', 'Drug allergy', 'Food allergy', 'Urticaria and angioedema', 'Immunoglobulin deficiencies'],
    },
    {
      id: 'adult-vaccination',
      name: 'Adult Vaccination & Travel Medicine',
      description: 'Preventive medicine, immunisation scheduling, travel-related illness',
      diseaseCategories: ['Travel prophylaxis', 'Vaccine-preventable diseases', 'Post-exposure prophylaxis', 'Occupational health'],
    },
  ],
  commonSymptoms: [
    'fever', 'fatigue', 'weight_loss', 'night_sweats', 'malaise',
    'anorexia', 'generalised_weakness', 'lymphadenopathy', 'arthralgia',
    'myalgia', 'headache', 'dizziness', 'syncope', 'palpitations',
    'chest_pain', 'dyspnoea', 'cough', 'abdominal_pain', 'nausea',
    'vomiting', 'diarrhoea', 'constipation', 'oedema', 'rash',
    'jaundice', 'pallor', 'bleeding_tendency', 'polydipsia',
    'polyuria', 'heat_intolerance', 'cold_intolerance',
  ],
  commonInvestigations: [
    'FBC', 'U&E', 'LFT', 'CRP', 'ESR', 'Blood culture', 'Urinalysis',
    'Chest X-ray', 'ECG', 'Blood glucose', 'HbA1c', 'Lipid profile',
    'Thyroid function', 'Coagulation screen', 'HIV test', 'Malarial smear',
    'Autoimmune screen', 'Serum protein electrophoresis', 'Vitamin B12',
    'Folate', 'Ferritin', 'Iron studies', 'Blood film',
  ],
};
