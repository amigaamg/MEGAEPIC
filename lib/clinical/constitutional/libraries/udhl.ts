export interface UDHLEntry {
  id: string;
  label: string;
  genericName: string;
  drugClass: string;
  commonDoses: string[];
  routes: string[];
  pediatricSafe: boolean;
  pregnancyCategory?: string;
}

const UDHL_MEDICATIONS: UDHLEntry[] = [
  { id: 'paracetamol', label: 'Paracetamol (Acetaminophen)', genericName: 'Paracetamol', drugClass: 'Analgesic / Antipyretic', commonDoses: ['10-15 mg/kg', '500-1000 mg'], routes: ['oral', 'IV', 'PR'], pediatricSafe: true },
  { id: 'ibuprofen', label: 'Ibuprofen', genericName: 'Ibuprofen', drugClass: 'NSAID', commonDoses: ['5-10 mg/kg', '200-400 mg'], routes: ['oral', 'IV'], pediatricSafe: true, pregnancyCategory: 'D' },
  { id: 'amoxicillin', label: 'Amoxicillin', genericName: 'Amoxicillin', drugClass: 'Penicillin', commonDoses: ['40-45 mg/kg/day', '250-500 mg'], routes: ['oral', 'IV'], pediatricSafe: true, pregnancyCategory: 'B' },
  { id: 'ceftriaxone', label: 'Ceftriaxone', genericName: 'Ceftriaxone', drugClass: 'Cephalosporin (3rd gen)', commonDoses: ['50-100 mg/kg', '1-2 g'], routes: ['IV', 'IM'], pediatricSafe: true, pregnancyCategory: 'B' },
  { id: 'artesunate', label: 'Artesunate', genericName: 'Artesunate', drugClass: 'Antimalarial', commonDoses: ['2.4 mg/kg', '3 mg/kg'], routes: ['IV', 'IM', 'PR'], pediatricSafe: true, pregnancyCategory: 'C' },
  { id: 'salbutamol', label: 'Salbutamol (Albuterol)', genericName: 'Salbutamol', drugClass: 'Beta-2 Agonist', commonDoses: ['2.5-5 mg nebulised', '4-8 puffs'], routes: ['inhaled', 'nebulised', 'IV'], pediatricSafe: true, pregnancyCategory: 'C' },
  { id: 'prednisolone', label: 'Prednisolone', genericName: 'Prednisolone', drugClass: 'Corticosteroid', commonDoses: ['1-2 mg/kg', '40-60 mg'], routes: ['oral'], pediatricSafe: true, pregnancyCategory: 'C' },
  { id: 'rifampicin', label: 'Rifampicin', genericName: 'Rifampicin', drugClass: 'Antitubercular', commonDoses: ['10-20 mg/kg', '450-600 mg'], routes: ['oral', 'IV'], pediatricSafe: true, pregnancyCategory: 'C' },
  { id: 'isoniazid', label: 'Isoniazid', genericName: 'Isoniazid', drugClass: 'Antitubercular', commonDoses: ['5-10 mg/kg', '300 mg'], routes: ['oral', 'IV'], pediatricSafe: true, pregnancyCategory: 'C' },
  { id: 'metformin', label: 'Metformin', genericName: 'Metformin', drugClass: 'Biguanide', commonDoses: ['500-2000 mg'], routes: ['oral'], pediatricSafe: false, pregnancyCategory: 'B' },
  { id: 'insulin_regular', label: 'Insulin (Regular)', genericName: 'Insulin', drugClass: 'Insulin', commonDoses: ['0.1-0.2 IU/kg', 'variable'], routes: ['SC', 'IV'], pediatricSafe: true, pregnancyCategory: 'B' },
  { id: 'enalapril', label: 'Enalapril', genericName: 'Enalapril', drugClass: 'ACE Inhibitor', commonDoses: ['2.5-20 mg'], routes: ['oral'], pediatricSafe: false, pregnancyCategory: 'D' },
  { id: 'nifedipine', label: 'Nifedipine', genericName: 'Nifedipine', drugClass: 'Calcium Channel Blocker', commonDoses: ['10-60 mg'], routes: ['oral'], pediatricSafe: false, pregnancyCategory: 'C' },
  { id: 'furosemide', label: 'Furosemide', genericName: 'Furosemide', drugClass: 'Loop Diuretic', commonDoses: ['0.5-2 mg/kg', '20-80 mg'], routes: ['oral', 'IV'], pediatricSafe: true, pregnancyCategory: 'C' },
  { id: 'gentamicin', label: 'Gentamicin', genericName: 'Gentamicin', drugClass: 'Aminoglycoside', commonDoses: ['5-7.5 mg/kg'], routes: ['IV', 'IM'], pediatricSafe: true, pregnancyCategory: 'C' },
];

export function searchUDHL(query: string): UDHLEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return UDHL_MEDICATIONS.filter(m =>
    m.label.toLowerCase().includes(q) ||
    m.genericName.toLowerCase().includes(q) ||
    m.drugClass.toLowerCase().includes(q)
  ).slice(0, 15);
}

export function getUDHLEntry(id: string): UDHLEntry | undefined {
  return UDHL_MEDICATIONS.find(m => m.id === id);
}

export function getPediatricSafe(): UDHLEntry[] {
  return UDHL_MEDICATIONS.filter(m => m.pediatricSafe);
}
