// AMEXAN Facility Administration — Command Center registry (Book V)
// Defines the 24 constitutional centers plus the marketplace catalogue used by
// the COO command center, decoupled from any single engine module so the UI
// stays consistent with Book V.

export type CommunityCenterId =
  | 'executive' | 'digital_twin' | 'workforce' | 'organization' | 'services'
  | 'infrastructure' | 'clinical' | 'workforce_analytics' | 'quality' | 'finance'
  | 'research' | 'education' | 'communication' | 'protocol' | 'intelligence'
  | 'integration' | 'hmis' | 'structure' | 'migration' | 'marketplace'
  | 'security' | 'settings' | 'analytics';

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

export const STRUCTURE_KINDS: { id: string; label: string; manageCap: string }[] = [
  { id: 'departments', label: 'Departments', manageCap: 'manage_departments' },
  { id: 'units', label: 'Units', manageCap: 'manage_units' },
  { id: 'wards', label: 'Wards', manageCap: 'manage_wards' },
  { id: 'clinics', label: 'Clinics', manageCap: 'manage_clinics' },
  { id: 'theatres', label: 'Theatres', manageCap: 'manage_theatres' },
  { id: 'laboratories', label: 'Laboratories', manageCap: 'manage_laboratories' },
  { id: 'pharmacies', label: 'Pharmacies', manageCap: 'manage_pharmacies' },
];