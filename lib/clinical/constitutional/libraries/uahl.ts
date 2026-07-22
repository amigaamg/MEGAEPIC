export interface UAHLEntry {
  id: string;
  label: string;
  category: 'drug' | 'food' | 'environmental' | 'latex' | 'venom' | 'other';
  commonReactions: string[];
  severity: 'mild' | 'moderate' | 'severe';
}

const UAHL_ALLERGENS: UAHLEntry[] = [
  { id: 'penicillin', label: 'Penicillin', category: 'drug', commonReactions: ['Rash', 'Urticaria', 'Anaphylaxis'], severity: 'severe' },
  { id: 'cephalosporins', label: 'Cephalosporins', category: 'drug', commonReactions: ['Rash', 'Urticaria'], severity: 'moderate' },
  { id: 'sulphonamides', label: 'Sulphonamides', category: 'drug', commonReactions: ['Rash', 'Stevens-Johnson Syndrome'], severity: 'severe' },
  { id: 'aspirin_nsaids', label: 'Aspirin / NSAIDs', category: 'drug', commonReactions: ['Urticaria', 'Angioedema', 'Bronchospasm'], severity: 'moderate' },
  { id: 'paracetamol', label: 'Paracetamol', category: 'drug', commonReactions: ['Rash'], severity: 'mild' },
  { id: 'artesunate', label: 'Artesunate', category: 'drug', commonReactions: ['Rash', 'Nausea'], severity: 'mild' },
  { id: 'sulfadoxine_pyrimethamine', label: 'Sulfadoxine-Pyrimethamine (SP)', category: 'drug', commonReactions: ['Rash', 'Stevens-Johnson Syndrome'], severity: 'severe' },
  { id: 'chloroquine', label: 'Chloroquine', category: 'drug', commonReactions: ['Pruritus', 'Visual disturbance'], severity: 'moderate' },
  { id: 'peanuts', label: 'Peanuts', category: 'food', commonReactions: ['Urticaria', 'Angioedema', 'Anaphylaxis'], severity: 'severe' },
  { id: 'eggs', label: 'Eggs', category: 'food', commonReactions: ['Urticaria', 'Eczema flare'], severity: 'mild' },
  { id: 'milk', label: 'Cow\'s Milk', category: 'food', commonReactions: ['Colic', 'Eczema', 'Vomiting', 'Diarrhoea'], severity: 'moderate' },
  { id: 'shellfish', label: 'Shellfish', category: 'food', commonReactions: ['Urticaria', 'Angioedema', 'Anaphylaxis'], severity: 'severe' },
  { id: 'soya', label: 'Soya', category: 'food', commonReactions: ['Colic', 'Eczema'], severity: 'mild' },
  { id: 'wheat', label: 'Wheat (Gluten)', category: 'food', commonReactions: ['Bloating', 'Diarrhoea', 'Rash'], severity: 'mild' },
  { id: 'dust_mites', label: 'Dust Mites', category: 'environmental', commonReactions: ['Rhinitis', 'Asthma', 'Eczema'], severity: 'mild' },
  { id: 'pollen', label: 'Pollen (Hay Fever)', category: 'environmental', commonReactions: ['Rhinitis', 'Conjunctivitis'], severity: 'mild' },
  { id: 'mould', label: 'Mould', category: 'environmental', commonReactions: ['Rhinitis', 'Asthma'], severity: 'mild' },
  { id: 'pet_dander', label: 'Pet Dander', category: 'environmental', commonReactions: ['Rhinitis', 'Asthma', 'Urticaria'], severity: 'mild' },
  { id: 'latex', label: 'Latex', category: 'latex', commonReactions: ['Contact dermatitis', 'Urticaria', 'Anaphylaxis'], severity: 'severe' },
  { id: 'bee_venom', label: 'Bee Venom', category: 'venom', commonReactions: ['Local swelling', 'Urticaria', 'Anaphylaxis'], severity: 'severe' },
  { id: 'wasp_venom', label: 'Wasp Venom', category: 'venom', commonReactions: ['Local swelling', 'Urticaria', 'Anaphylaxis'], severity: 'severe' },
];

export function searchUAHL(query: string): UAHLEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return UAHL_ALLERGENS.filter(a =>
    a.label.toLowerCase().includes(q) ||
    a.category.toLowerCase().includes(q) ||
    a.commonReactions.some(r => r.toLowerCase().includes(q))
  ).slice(0, 15);
}

export function getUAHLEntry(id: string): UAHLEntry | undefined {
  return UAHL_ALLERGENS.find(a => a.id === id);
}

export function getDrugAllergies(): UAHLEntry[] {
  return UAHL_ALLERGENS.filter(a => a.category === 'drug');
}

export const UAHL_CATEGORIES = [
  { id: 'drug', label: 'Drug Allergies' },
  { id: 'food', label: 'Food Allergies' },
  { id: 'environmental', label: 'Environmental Allergies' },
  { id: 'latex', label: 'Latex Allergy' },
  { id: 'venom', label: 'Venom / Insect Sting' },
];
