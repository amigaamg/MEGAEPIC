// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Hospital Asset Intelligence Registry — Engine VI
// The administrator NEVER types categories. These constitutional categories,
// departments, and the searchable asset catalog drive the registration wizard
// and every analytics surface.
// ═══════════════════════════════════════════════════════════════════════════════

import type {
  DepreciationMethod,
  AssetStatus,
  MaintenanceType,
} from './constitutional-types';

// ── Constitutional asset categories ───────────────────────────────────────────
export const ASSET_CATEGORIES: { id: string; label: string; group: string; icon: string }[] = [
  { id: 'medical_equipment', label: 'Medical Equipment', group: 'Clinical', icon: '🏥' },
  { id: 'diagnostic_equipment', label: 'Diagnostic Equipment', group: 'Clinical', icon: '🔬' },
  { id: 'therapeutic_equipment', label: 'Therapeutic Equipment', group: 'Clinical', icon: '💉' },
  { id: 'ward_equipment', label: 'Ward Equipment', group: 'Clinical', icon: '🛏️' },
  { id: 'laboratory_equipment', label: 'Laboratory Equipment', group: 'Clinical', icon: '🧪' },
  { id: 'radiology_equipment', label: 'Radiology Equipment', group: 'Clinical', icon: '📡' },
  { id: 'dental_equipment', label: 'Dental Equipment', group: 'Clinical', icon: '🦷' },
  { id: 'theatre_equipment', label: 'Theatre Equipment', group: 'Clinical', icon: '🩺' },
  { id: 'icu_equipment', label: 'ICU Equipment', group: 'Clinical', icon: '🫀' },
  { id: 'nicu_equipment', label: 'NICU Equipment', group: 'Clinical', icon: '👶' },
  { id: 'ambulances', label: 'Ambulances', group: 'Transport', icon: '🚑' },
  { id: 'vehicles', label: 'Vehicles', group: 'Transport', icon: '🚐' },
  { id: 'furniture', label: 'Furniture', group: 'Infrastructure', icon: '🪑' },
  { id: 'ict_equipment', label: 'ICT Equipment', group: 'Digital', icon: '💻' },
  { id: 'servers', label: 'Servers', group: 'Digital', icon: '🗄️' },
  { id: 'networking', label: 'Networking', group: 'Digital', icon: '🌐' },
  { id: 'buildings', label: 'Buildings', group: 'Infrastructure', icon: '🏢' },
  { id: 'electrical', label: 'Electrical', group: 'Infrastructure', icon: '⚡' },
  { id: 'water_systems', label: 'Water Systems', group: 'Infrastructure', icon: '🚰' },
  { id: 'hvac', label: 'HVAC', group: 'Infrastructure', icon: '❄️' },
  { id: 'generators', label: 'Generators', group: 'Infrastructure', icon: '🔌' },
  { id: 'solar', label: 'Solar', group: 'Infrastructure', icon: '☀️' },
  { id: 'security_systems', label: 'Security Systems', group: 'Infrastructure', icon: '🛡️' },
  { id: 'fire_systems', label: 'Fire Systems', group: 'Infrastructure', icon: '🧯' },
  { id: 'laundry', label: 'Laundry', group: 'Support', icon: '🧺' },
  { id: 'kitchen', label: 'Kitchen', group: 'Support', icon: '🍽️' },
  { id: 'mortuary', label: 'Mortuary', group: 'Support', icon: '⚰️' },
  { id: 'pharmacy_equipment', label: 'Pharmacy Equipment', group: 'Support', icon: '💊' },
  { id: 'consumables', label: 'Consumables', group: 'Support', icon: '📦' },
];

export const ASSET_CATEGORY_GROUPS: string[] = ['Clinical', 'Transport', 'Digital', 'Infrastructure', 'Support'];

// ── Searchable asset catalog (step 2 of the wizard) ───────────────────────────
export interface AssetCatalogItem {
  key: string;
  name: string;
  category: string;
  defaultDepartment: string;
  suggestedCost: number;
  lifecycleLabel: string;
}

export const ASSET_CATALOG: AssetCatalogItem[] = [
  { key: 'ct_scanner', name: 'CT Scanner', category: 'radiology_equipment', defaultDepartment: 'Radiology', suggestedCost: 145000000, lifecycleLabel: 'Diagnostic Imaging' },
  { key: 'mri', name: 'MRI', category: 'radiology_equipment', defaultDepartment: 'Radiology', suggestedCost: 220000000, lifecycleLabel: 'Diagnostic Imaging' },
  { key: 'ventilator', name: 'Ventilator', category: 'icu_equipment', defaultDepartment: 'ICU', suggestedCost: 3800000, lifecycleLabel: 'Life Support' },
  { key: 'patient_monitor', name: 'Patient Monitor', category: 'ward_equipment', defaultDepartment: 'ICU', suggestedCost: 950000, lifecycleLabel: 'Monitoring' },
  { key: 'infusion_pump', name: 'Infusion Pump', category: 'therapeutic_equipment', defaultDepartment: 'Surgery', suggestedCost: 650000, lifecycleLabel: 'Therapy' },
  { key: 'ultrasound', name: 'Ultrasound', category: 'radiology_equipment', defaultDepartment: 'Radiology', suggestedCost: 6500000, lifecycleLabel: 'Diagnostic Imaging' },
  { key: 'x_ray', name: 'X-ray', category: 'radiology_equipment', defaultDepartment: 'Radiology', suggestedCost: 18000000, lifecycleLabel: 'Diagnostic Imaging' },
  { key: 'ecg', name: 'ECG', category: 'diagnostic_equipment', defaultDepartment: 'Cardiology', suggestedCost: 1200000, lifecycleLabel: 'Cardiac Diagnostic' },
  { key: 'hospital_bed', name: 'Hospital Bed', category: 'ward_equipment', defaultDepartment: 'Medicine', suggestedCost: 185000, lifecycleLabel: 'Ward Asset' },
  { key: 'defibrillator', name: 'Defibrillator', category: 'therapeutic_equipment', defaultDepartment: 'Emergency', suggestedCost: 1500000, lifecycleLabel: 'Resuscitation' },
  { key: 'operating_table', name: 'Operating Table', category: 'theatre_equipment', defaultDepartment: 'Theatre', suggestedCost: 4500000, lifecycleLabel: 'Theatre Asset' },
  { key: 'autoclave', name: 'Autoclave', category: 'theatre_equipment', defaultDepartment: 'Central Sterile', suggestedCost: 2800000, lifecycleLabel: 'Sterilization' },
  { key: 'microscope', name: 'Microscope', category: 'laboratory_equipment', defaultDepartment: 'Laboratory', suggestedCost: 2300000, lifecycleLabel: 'Lab Instrument' },
  { key: 'centrifuge', name: 'Centrifuge', category: 'laboratory_equipment', defaultDepartment: 'Laboratory', suggestedCost: 750000, lifecycleLabel: 'Lab Instrument' },
  { key: 'blood_bank_refrigerator', name: 'Blood Bank Refrigerator', category: 'laboratory_equipment', defaultDepartment: 'Laboratory', suggestedCost: 1200000, lifecycleLabel: 'Storage / Cold chain' },
  { key: 'dialysis_machine', name: 'Dialysis Machine', category: 'therapeutic_equipment', defaultDepartment: 'Renal / Dialysis', suggestedCost: 5200000, lifecycleLabel: 'Renal Support' },
  { key: 'anesthesia_machine', name: 'Anesthesia Machine', category: 'theatre_equipment', defaultDepartment: 'Theatre', suggestedCost: 5800000, lifecycleLabel: 'Theatre Asset' },
  { key: 'suction_pump', name: 'Suction Pump', category: 'ward_equipment', defaultDepartment: 'Surgery', suggestedCost: 180000, lifecycleLabel: 'Ward Asset' },
  { key: 'incubator', name: 'Incubator', category: 'nicu_equipment', defaultDepartment: 'NICU', suggestedCost: 1600000, lifecycleLabel: 'Neonatal' },
  { key: 'phototherapy_unit', name: 'Phototherapy Unit', category: 'nicu_equipment', defaultDepartment: 'NICU', suggestedCost: 850000, lifecycleLabel: 'Neonatal' },
  { key: 'dental_chair', name: 'Dental Chair', category: 'dental_equipment', defaultDepartment: 'Dental', suggestedCost: 1500000, lifecycleLabel: 'Dental' },
  { key: 'generator', name: 'Generator', category: 'generators', defaultDepartment: 'Administration', suggestedCost: 22000000, lifecycleLabel: 'Power' },
  { key: 'ups_battery', name: 'UPS Battery', category: 'electrical', defaultDepartment: 'ICT', suggestedCost: 950000, lifecycleLabel: 'Power / ICT' },
  { key: 'server_rack', name: 'Server Rack', category: 'servers', defaultDepartment: 'ICT', suggestedCost: 4800000, lifecycleLabel: 'ICT' },
  { key: 'laptop', name: 'Laptop', category: 'ict_equipment', defaultDepartment: 'Administration', suggestedCost: 170000, lifecycleLabel: 'ICT' },
  { key: 'ambulance', name: 'Ambulance', category: 'ambulances', defaultDepartment: 'Emergency', suggestedCost: 18000000, lifecycleLabel: 'Transport' },
  { key: 'office_desk', name: 'Office Desk', category: 'furniture', defaultDepartment: 'Administration', suggestedCost: 35000, lifecycleLabel: 'Furniture' },
  { key: 'fire_extinguisher', name: 'Fire Extinguisher', category: 'fire_systems', defaultDepartment: 'Administration', suggestedCost: 18000, lifecycleLabel: 'Safety' },
  { key: 'pharmacy_fridge', name: 'Pharmacy Fridge', category: 'pharmacy_equipment', defaultDepartment: 'Pharmacy', suggestedCost: 480000, lifecycleLabel: 'Cold chain' },
];

export function getCatalogItem(key: string): AssetCatalogItem | undefined {
  return ASSET_CATALOG.find((c) => c.key === key);
}

export function getCategory(id: string): { id: string; label: string; group: string; icon: string } | undefined {
  return ASSET_CATEGORIES.find((c) => c.id === id);
}

// ── Departments (searchable, step 1 of the wizard) ────────────────────────────
export const DEPARTMENTS: { id: string; label: string; amexan: string }[] = [
  { id: 'Emergency', label: 'Emergency', amexan: 'Emergency Medicine' },
  { id: 'Medicine', label: 'Medicine', amexan: 'Internal Medicine' },
  { id: 'Surgery', label: 'Surgery', amexan: 'General Surgery' },
  { id: 'ICU', label: 'ICU', amexan: 'Intensive Care' },
  { id: 'NICU', label: 'NICU', amexan: 'Neonatal Care' },
  { id: 'Radiology', label: 'Radiology', amexan: 'Diagnostic Imaging' },
  { id: 'Laboratory', label: 'Laboratory', amexan: 'Pathology & Lab' },
  { id: 'Dental', label: 'Dental', amexan: 'Dental & Maxillofacial' },
  { id: 'Pharmacy', label: 'Pharmacy', amexan: 'Pharmacy' },
  { id: 'Administration', label: 'Administration', amexan: 'Hospital Administration' },
  { id: 'ICT', label: 'ICT', amexan: 'ICT Services' },
  { id: 'Finance', label: 'Finance', amexan: 'Finance & Accounts' },
  { id: 'Theatre', label: 'Theatre', amexan: 'Operating Theatre' },
  { id: 'Renal', label: 'Renal', amexan: 'Renal / Dialysis' },
  { id: 'Maternity', label: 'Maternity', amexan: 'Obstetrics & Gynae' },
  { id: 'Paediatrics', label: 'Paediatrics', amexan: 'Paediatrics' },
  { id: 'Physiotherapy', label: 'Physiotherapy', amexan: 'Rehabilitation' },
  { id: 'Cardiology', label: 'Cardiology', amexan: 'Cardiology' },
  { id: 'Mortuary', label: 'Mortuary', amexan: 'Mortuary' },
  { id: 'Kitchen', label: 'Kitchen', amexan: 'Nutrition & Dietetics' },
  { id: 'Laundry', label: 'Laundry', amexan: 'Linen & Laundry' },
  { id: 'Security', label: 'Security', amexan: 'Security Services' },
  { id: 'Maintenance', label: 'Maintenance', amexan: 'Biomedical Engineering' },
];

// ── Statuses, funding, depreciation, maintenance ──────────────────────────────
export const ASSET_STATUSES: { id: AssetStatus; label: string; color: string; digitalTwinColor: string }[] = [
  { id: 'operational', label: 'Operational', color: '#10b981', digitalTwinColor: '#22c55e' },
  { id: 'maintenance', label: 'Under Maintenance', color: '#f59e0b', digitalTwinColor: '#eab308' },
  { id: 'faulted', label: 'Faulted', color: '#ef4444', digitalTwinColor: '#ef4444' },
  { id: 'reserved', label: 'Reserved', color: '#0ea5e9', digitalTwinColor: '#3b82f6' },
  { id: 'pending', label: 'Pending / Installed', color: '#8b5cf6', digitalTwinColor: '#8b5cf6' },
  { id: 'retired', label: 'Retired', color: '#8a98ac', digitalTwinColor: '#9ca3af' },
];

export const FUNDING_SOURCES: { id: string; label: string }[] = [
  { id: 'government', label: 'Government' },
  { id: 'donor', label: 'Donor' },
  { id: 'private', label: 'Private' },
  { id: 'research', label: 'Research' },
  { id: 'loan', label: 'Loan' },
];

export const DEPRECIATION_METHODS: DepreciationMethod[] = ['straight_line', 'reducing_balance', 'none'];

export const MAINTENANCE_TYPES: { id: MaintenanceType; label: string; icon: string }[] = [
  { id: 'routine', label: 'Routine Maintenance', icon: '🔧' },
  { id: 'preventive', label: 'Preventive Maintenance', icon: '🛠️' },
  { id: 'corrective', label: 'Corrective Maintenance', icon: '🔩' },
  { id: 'calibration', label: 'Calibration', icon: '📏' },
  { id: 'cleaning', label: 'Cleaning', icon: '🧹' },
  { id: 'software_update', label: 'Software Update', icon: '💾' },
  { id: 'inspection', label: 'Inspection', icon: '👁️' },
  { id: 'safety_check', label: 'Safety Check', icon: '🦺' },
];

export const REPORTS: { id: string; label: string; formats: string[] }[] = [
  { id: 'asset_register', label: 'Asset Register', formats: ['PDF', 'Excel', 'Power BI'] },
  { id: 'depreciation', label: 'Depreciation Report', formats: ['PDF', 'Excel'] },
  { id: 'donor_assets', label: 'Donor Assets', formats: ['PDF', 'Excel'] },
  { id: 'insurance_assets', label: 'Insurance Assets', formats: ['PDF'] },
  { id: 'maintenance_report', label: 'Maintenance Report', formats: ['PDF', 'Excel'] },
  { id: 'biomedical', label: 'Biomedical Report', formats: ['PDF', 'Excel'] },
  { id: 'audit', label: 'Audit Report', formats: ['PDF'] },
  { id: 'government', label: 'Government Report', formats: ['PDF', 'Excel'] },
  { id: 'replacement_plan', label: 'Replacement Plan', formats: ['PDF', 'Excel', 'Power BI'] },
  { id: 'capital_planning', label: 'Capital Planning', formats: ['PDF', 'Excel', 'Power BI'] },
];

// ── Digital Twin legend ───────────────────────────────────────────────────────
export const DIGITAL_TWIN_LEGEND: { id: AssetStatus; label: string; color: string }[] = ASSET_STATUSES.map((s) => ({
  id: s.id, label: s.label, color: s.digitalTwinColor,
}));

export function getAssetStatusTwinColor(status: AssetStatus): string {
  return ASSET_STATUSES.find((s) => s.id === status)?.digitalTwinColor ?? '#9ca3af';
}

// Re-export helpers to keep callers simple.
export function getDepartmentLabel(id: string): string {
  return DEPARTMENTS.find((d) => d.id === id)?.amexan ?? id;
}

export function getAssetCategoryLabel(id: string): string {
  return ASSET_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}