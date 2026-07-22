export interface UFHLDomain {
  id: string;
  label: string;
  description: string;
  pediatricAppropriate: boolean;
  adultAppropriate: boolean;
  minAgeMonths?: number;
}

export const UFHL_DOMAINS: UFHLDomain[] = [
  { id: 'family_structure', label: 'Family Structure', description: 'Household composition, siblings, carers', pediatricAppropriate: true, adultAppropriate: true },
  { id: 'genetic_diseases', label: 'Genetic Diseases', description: 'Inherited conditions in family', pediatricAppropriate: true, adultAppropriate: true },
  { id: 'chronic_diseases_family', label: 'Chronic Diseases in Family', description: 'DM, HTN, Asthma, Sickle Cell, etc.', pediatricAppropriate: true, adultAppropriate: true },
  { id: 'tb_household', label: 'TB Household Contact', description: 'Known TB contact in household', pediatricAppropriate: true, adultAppropriate: true, minAgeMonths: 0 },
  { id: 'allergy_atopy_family', label: 'Allergy / Atopy in Family', description: 'Asthma, eczema, hay fever', pediatricAppropriate: true, adultAppropriate: true },
  { id: 'mental_health_family', label: 'Mental Health in Family', description: 'Depression, bipolar, suicide', pediatricAppropriate: true, adultAppropriate: true, minAgeMonths: 72 },
  { id: 'consanguinity', label: 'Consanguinity', description: 'Parental blood relation', pediatricAppropriate: true, adultAppropriate: false },
  { id: 'family_functioning', label: 'Family Functioning', description: 'Parental relationships, support, stressors', pediatricAppropriate: true, adultAppropriate: true },
];

export interface USHLDomain {
  id: string;
  label: string;
  description: string;
  pediatricAppropriate: boolean;
  adultAppropriate: boolean;
  minAgeMonths?: number;
}

export const USHL_DOMAINS: USHLDomain[] = [
  { id: 'occupation', label: 'Occupation', description: 'Job type, exposures, hours', pediatricAppropriate: false, adultAppropriate: true, minAgeMonths: 192 },
  { id: 'education', label: 'Education', description: 'School attendance, performance', pediatricAppropriate: true, adultAppropriate: false, minAgeMonths: 36 },
  { id: 'housing', label: 'Housing / Environment', description: 'Crowding, ventilation, water, sanitation', pediatricAppropriate: true, adultAppropriate: true },
  { id: 'smoking', label: 'Smoking / Tobacco', description: 'Active smoking or exposure', pediatricAppropriate: true, adultAppropriate: true, minAgeMonths: 0 },
  { id: 'alcohol', label: 'Alcohol Use', description: 'Consumption pattern, AUDIT', pediatricAppropriate: false, adultAppropriate: true, minAgeMonths: 180 },
  { id: 'substance_use', label: 'Substance Use', description: 'Illicit drugs, inhalants', pediatricAppropriate: false, adultAppropriate: true, minAgeMonths: 144 },
  { id: 'nutrition_diet', label: 'Nutrition / Diet', description: 'Dietary patterns, food security', pediatricAppropriate: true, adultAppropriate: true },
  { id: 'physical_activity', label: 'Physical Activity', description: 'Exercise, sedentary time', pediatricAppropriate: true, adultAppropriate: true, minAgeMonths: 60 },
  { id: 'sexual_history', label: 'Sexual History', description: 'Activity, partners, contraception', pediatricAppropriate: false, adultAppropriate: true, minAgeMonths: 144 },
  { id: 'travel', label: 'Travel History', description: 'Recent travel, exposure', pediatricAppropriate: true, adultAppropriate: true },
  { id: 'sleep', label: 'Sleep', description: 'Duration, quality, disturbances', pediatricAppropriate: true, adultAppropriate: true },
  { id: 'social_support', label: 'Social Support', description: 'Carers, community, safety net', pediatricAppropriate: true, adultAppropriate: true },
];

export function getFamilyDomainsForAge(totalMonths: number): UFHLDomain[] {
  return UFHL_DOMAINS.filter(d =>
    (d.pediatricAppropriate || totalMonths >= 144) &&
    (d.adultAppropriate || totalMonths < 144) &&
    (!d.minAgeMonths || totalMonths >= d.minAgeMonths)
  );
}

export function getSocialDomainsForAge(totalMonths: number): USHLDomain[] {
  return USHL_DOMAINS.filter(d =>
    (d.pediatricAppropriate || totalMonths >= 144) &&
    (d.adultAppropriate || totalMonths < 144) &&
    (!d.minAgeMonths || totalMonths >= d.minAgeMonths)
  );
}
