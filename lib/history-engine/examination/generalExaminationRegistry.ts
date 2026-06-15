// ── 8-Step General Examination Framework ──
// A. Overall Appearance
// B. Vital Signs
// C. Anthropometry
// D. Hydration
// E. Nutritional Status
// F. Level of Consciousness
// G. Distress Assessment
// H. Adaptive General Signs

export const APPEARANCE_OPTIONS = [
  'Well looking',
  'Acutely ill looking',
  'Chronically ill looking',
  'Toxic appearance',
  'Cachectic',
  'Distressed',
  'Comfortable',
  'Anxious',
  'Agitated',
  'Lethargic',
  'Pale',
  'Dysmorphic',
] as const;

export const CONSCIOUSNESS_OPTIONS = [
  'Alert and oriented',
  'Drowsy but rousable',
  'Confused',
  'Obtunded',
  'Stuporous',
  'Comatose',
  'Delirious',
  'Unresponsive',
] as const;

export const GCS_OPTIONS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] as const;

export const HYDRATION_OPTIONS = [
  'Normal / Well hydrated',
  'Mild dehydration',
  'Moderate dehydration',
  'Severe dehydration',
  'Fluid overloaded',
] as const;

export const NUTRITION_OPTIONS = [
  'Normal / Well nourished',
  'Underweight',
  'Wasted / Malnourished',
  'Cachectic',
  'Obese',
  'Overweight',
] as const;

export const DISTRESS_TYPES = [
  'No distress',
  'Pain / Crying',
  'Respiratory distress',
  'Cardiovascular distress',
  'Neurological distress',
  'Multiple',
] as const;

// ── ADAPTIVE GENERAL SIGNS REGISTRY ──
// All possible general signs; which ones appear depends on DDX.
export interface GeneralSignDef {
  id: string;
  label: string;
  options: string[];
  suggestionFor: string[]; // diseaseIds that prioritize this sign
}

export const GENERAL_SIGNS: GeneralSignDef[] = [
  {
    id: 'gs_pallor', label: 'Pallor',
    options: ['Not present', 'Mild', 'Moderate', 'Severe'],
    suggestionFor: ['anemia', 'malaria', 'ckd', 'malignancy', 'sickle_cell'],
  },
  {
    id: 'gs_jaundice', label: 'Jaundice',
    options: ['Not present', 'Scleral icterus', 'Mild', 'Moderate', 'Severe'],
    suggestionFor: ['viral_hepatitis', 'cirrhosis', 'malaria', 'pancreatitis', 'gallstone_disease', 'cholecystitis'],
  },
  {
    id: 'gs_cyanosis', label: 'Cyanosis',
    options: ['Not present', 'Central (lips/tongue)', 'Peripheral (fingers/toes)'],
    suggestionFor: ['pneumonia_pulm', 'copd_pulm', 'heart_failure_card', 'pulmonary_embolism', 'asthma_pulm', 'congenital_heart_disease', 'respiratory_failure'],
  },
  {
    id: 'gs_clubbing', label: 'Clubbing',
    options: ['Not present', 'Mild (flattened angle)', 'Moderate (parrot beak)', 'Severe (drumstick)'],
    suggestionFor: ['tb_pulm', 'bronchiectasis', 'lung_cancer', 'copd_pulm', 'infective_endocarditis', 'ibd', 'cirrhosis'],
  },
  {
    id: 'gs_lymphadenopathy', label: 'Lymphadenopathy',
    options: ['Not palpable', 'Cervical', 'Axillary', 'Inguinal', 'Generalized', 'Supraclavicular'],
    suggestionFor: ['tb_pulm', 'hiv', 'lymphoma', 'malignancy', 'infectious_mononucleosis', 'sle'],
  },
  {
    id: 'gs_edema', label: 'Peripheral Edema',
    options: ['Not present', 'Pitting mild (+)', 'Pitting moderate (++)', 'Pitting severe (+++)', 'Non-pitting'],
    suggestionFor: ['heart_failure_card', 'ckd', 'nephrotic_syndrome', 'cirrhosis', 'dvt', 'chronic_venous_insufficiency', 'malnutrition'],
  },
  {
    id: 'gs_pigmentation', label: 'Skin Pigmentation',
    options: ['Normal', 'Hyperpigmentation', 'Hypopigmentation', 'Addisonian pigmentation', 'Post-inflammatory'],
    suggestionFor: ['addisons_disease', 'sle', 'pregnancy', 'drug_reaction'],
  },
  {
    id: 'gs_finger_changes', label: 'Finger Changes',
    options: ['Normal', 'Swan neck', 'Boutonniere', 'Z-thumb', 'Heberden nodes', 'Bouchard nodes'],
    suggestionFor: ['rheumatoid_arthritis', 'oa', 'psoriatic_arthritis', 'scleroderma'],
  },
  {
    id: 'gs_nail_changes', label: 'Nail Changes',
    options: ['Normal', 'Koilonychia', 'Pitting', 'Onycholysis', 'Splinter hemorrhages', 'Beau lines', 'Terry nails'],
    suggestionFor: ['anemia', 'psoriasis', 'infective_endocarditis', 'sle', 'iron_deficiency'],
  },
  {
    id: 'gs_scratch_marks', label: 'Scratch Marks / Prurigo',
    options: ['Not present', 'Present'],
    suggestionFor: ['cirrhosis', 'ckd', 'cholestasis', 'lymphoma', 'allergic_reaction'],
  },
  {
    id: 'gs_spider_nevi', label: 'Spider Nevi / Angiomas',
    options: ['Not present', 'Few (<5)', 'Multiple (≥5)'],
    suggestionFor: ['cirrhosis', 'viral_hepatitis', 'alcohol_liver_disease', 'pregnancy'],
  },
  {
    id: 'gs_palmar_erythema', label: 'Palmar Erythema',
    options: ['Not present', 'Mild', 'Marked'],
    suggestionFor: ['cirrhosis', 'alcohol_liver_disease', 'pregnancy', 'hyperthyroidism'],
  },
  {
    id: 'gs_gynecomastia', label: 'Gynecomastia',
    options: ['Not present', 'Unilateral', 'Bilateral'],
    suggestionFor: ['cirrhosis', 'drug_side_effect', 'hyperthyroidism', 'hypogonadism'],
  },
  {
    id: 'gs_goiter', label: 'Goiter / Thyroid Enlargement',
    options: ['Not palpable', 'Diffuse', 'Nodular', 'Multinodular'],
    suggestionFor: ['hyperthyroidism', 'hypothyroidism', 'thyroid_cancer', 'iodine_deficiency'],
  },
  {
    id: 'gs_exophthalmos', label: 'Exophthalmos / Proptosis',
    options: ['Not present', 'Mild', 'Moderate', 'Severe'],
    suggestionFor: ['hyperthyroidism', 'graves_disease', 'orbital_tumor'],
  },
];

export function getGeneralSignsForDisease(diseaseIds: string[]): GeneralSignDef[] {
  const relevant = new Set<string>();
  for (const did of diseaseIds) {
    for (const sign of GENERAL_SIGNS) {
      if (sign.suggestionFor.includes(did)) relevant.add(sign.id);
    }
  }
  // Always include the core 6 (pallor, jaundice, cyanosis, clubbing, lymphadenopathy, edema)
  const coreIds = ['gs_pallor', 'gs_jaundice', 'gs_cyanosis', 'gs_clubbing', 'gs_lymphadenopathy', 'gs_edema'];
  for (const cid of coreIds) relevant.add(cid);
  return GENERAL_SIGNS.filter(s => relevant.has(s.id));
}

export default GENERAL_SIGNS;
