// AMEXAN Facility Administration — Command Center registry (Book V)
// Defines the 20 constitutional centers plus the marketplace catalogue used by
// the COO command center, decoupled from any single engine module so the UI
// stays consistent with Book V.

export type CommunityCenterId =
  | 'executive' | 'digital_twin' | 'workforce' | 'organization' | 'services'
  | 'infrastructure' | 'clinical' | 'workforce_analytics' | 'quality' | 'finance'
  | 'research' | 'education' | 'communication' | 'protocol' | 'intelligence'
  | 'integration' | 'migration' | 'marketplace' | 'security' | 'analytics';

export const MARKETPLACE_MODULES: { id: string; name: string; description: string }[] = [
  { id: 'telemedicine', name: 'Telemedicine', description: 'Remote consultation network' },
  { id: 'icu', name: 'ICU', description: 'Intensive care digital operations' },
  { id: 'nicu', name: 'NICU', description: 'Neonatal intensive care' },
  { id: 'oncology', name: 'Oncology', description: 'Cancer care digital operations' },
  { id: 'dental', name: 'Dental', description: 'Dental clinic module' },
  { id: 'blood_bank', name: 'Blood Bank', description: 'Blood bank & transfusion module' },
  { id: 'dialysis', name: 'Dialysis', description: 'Renal dialysis module' },
  { id: 'ai_modules', name: 'AI Modules', description: 'Clinical intelligence extensions' },
  { id: 'insurance_connectors', name: 'Insurance Connectors', description: 'Payer integration connectors' },
];