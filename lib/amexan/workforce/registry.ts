// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Workforce Registry — Engine II — Constitutional Catalogs
// Two registries: PROFESSIONAL CATEGORIES (what kind of professional an actor is)
// and the PRIVILEGE CATALOG (every granular capability the system understands).
// The engine queries these registries; it NEVER hardcodes a profession or a
// privilege. Adding "AI Command Center" or "Da Vinci Surgeon" = one registration.
// ═══════════════════════════════════════════════════════════════════════════════

import type { WorkspaceFamily } from '@/lib/amexan/workspace/WorkspaceGuard';

/** Drives workspace generation (role × privileges × assignment). */
export interface ProfessionalCategoryDef {
  id: string;
  label: string;
  family: WorkspaceFamily;
  defaultRoute: string;
  /** Default granted privileges from this category alone. */
  defaultPrivileges: string[];
  /** Privileges this category may NEVER hold (constitutional safety). */
  forbiddenPrivileges: string[];
}

export interface PrivilegeDef {
  id: string;
  name: string;
  description: string;
  domain: string; // 'clinical' | 'surgical' | 'prescribing' | 'imaging' | 'lab' | 'finance' | 'hr' | 'admin' | 'security' | 'governance'
  /** Minimal competency level required to hold it. */
  requiresLevel?: 'observed' | 'supervised' | 'independent' | 'expert';
}

const PROFESSIONAL_CATEGORIES: ProfessionalCategoryDef[] = [
  { id: 'facility_administrator', label: 'Facility Administrator', family: 'executive', defaultRoute: '/facility-admin', defaultPrivileges: ['manage_organization', 'manage_structure', 'manage_workforce', 'manage_infrastructure', 'manage_governance'], forbiddenPrivileges: [] },
  { id: 'hospital_admin', label: 'Hospital Admin', family: 'executive', defaultRoute: '/facility-admin', defaultPrivileges: ['manage_structure', 'manage_workforce', 'manage_departments'], forbiddenPrivileges: [] },
  { id: 'medical_director', label: 'Medical Director', family: 'executive', defaultRoute: '/dashboard', defaultPrivileges: ['govern_clinical', 'approve_procedures', 'credential_staff'], forbiddenPrivileges: [] },
  { id: 'consultant', label: 'Consultant', family: 'clinical', defaultRoute: '/workspace', defaultPrivileges: ['prescribe', 'admit', 'discharge', 'order_labs', 'order_imaging', 'perform_surgery', 'write_notes'], forbiddenPrivileges: ['sign_death_certificate_without_review'] },
  { id: 'medical_officer', label: 'Medical Officer', family: 'clinical', defaultRoute: '/workspace', defaultPrivileges: ['prescribe', 'admit', 'discharge', 'order_labs', 'order_imaging', 'write_notes'], forbiddenPrivileges: ['perform_major_surgery_independent'] },
  { id: 'registrar', label: 'Registrar', family: 'clinical', defaultRoute: '/workspace', defaultPrivileges: ['order_labs', 'order_imaging', 'write_notes'], forbiddenPrivileges: ['discharge', 'perform_major_surgery_independent'] },
  { id: 'resident', label: 'Resident', family: 'clinical', defaultRoute: '/workspace', defaultPrivileges: ['write_notes', 'order_labs'], forbiddenPrivileges: ['discharge', 'prescribe_independently'] },
  { id: 'intern', label: 'Intern', family: 'clinical', defaultRoute: '/workspace', defaultPrivileges: ['write_notes'], forbiddenPrivileges: ['prescribe_independently', 'order_imaging'] },
  { id: 'nurse', label: 'Nurse', family: 'nursing', defaultRoute: '/workspace', defaultPrivileges: ['administer_medication', 'record_vitals', 'patient_care'], forbiddenPrivileges: ['prescribe'] },
  { id: 'midwife', label: 'Midwife', family: 'nursing', defaultRoute: '/workspace', defaultPrivileges: ['administer_medication', 'record_vitals', 'patient_care'], forbiddenPrivileges: ['prescribe'] },
  { id: 'pharmacist', label: 'Pharmacist', family: 'pharmacy', defaultRoute: '/workspace', defaultPrivileges: ['dispense_medication', 'review_prescriptions', 'drug_interaction_check'], forbiddenPrivileges: ['prescribe'] },
  { id: 'lab_scientist', label: 'Lab Scientist', family: 'laboratory', defaultRoute: '/workspace', defaultPrivileges: ['run_lab_tests', 'validate_lab_results', 'release_lab_results'], forbiddenPrivileges: [] },
  { id: 'lab_technologist', label: 'Lab Technologist', family: 'laboratory', defaultRoute: '/workspace', defaultPrivileges: ['run_lab_tests'], forbiddenPrivileges: ['validate_lab_results'] },
  { id: 'radiographer', label: 'Radiographer', family: 'radiology', defaultRoute: '/workspace', defaultPrivileges: ['perform_imaging', 'record_images'], forbiddenPrivileges: ['release_imaging_reports'] },
  { id: 'radiologist', label: 'Radiologist', family: 'radiology', defaultRoute: '/workspace', defaultPrivileges: ['perform_imaging', 'release_imaging_reports', 'interpret_studies'], forbiddenPrivileges: [] },
  { id: 'dentist', label: 'Dentist', family: 'clinical', defaultRoute: '/workspace', defaultPrivileges: ['prescribe', 'perform_dental_procedures'], forbiddenPrivileges: [] },
  { id: 'physiotherapist', label: 'Physiotherapist', family: 'clinical', defaultRoute: '/workspace', defaultPrivileges: ['prescribe_rehab', 'record_vitals'], forbiddenPrivileges: ['prescribe'] },
  { id: 'clinical_officer', label: 'Clinical Officer', family: 'clinical', defaultRoute: '/workspace', defaultPrivileges: ['prescribe', 'order_labs', 'order_imaging', 'admit'], forbiddenPrivileges: ['perform_major_surgery_independent'] },
  { id: 'finance_officer', label: 'Finance Officer', family: 'finance', defaultRoute: '/dashboard', defaultPrivileges: ['manage_billing', 'process_payments', 'view_finance'], forbiddenPrivileges: [] },
  { id: 'hr_officer', label: 'HR Officer', family: 'hr', defaultRoute: '/dashboard', defaultPrivileges: ['manage_employment', 'manage_recruitment'], forbiddenPrivileges: [] },
  { id: 'ict_officer', label: 'ICT Officer', family: 'ict', defaultRoute: '/dashboard', defaultPrivileges: ['manage_assets', 'manage_infrastructure', 'manage_integrations'], forbiddenPrivileges: [] },
  { id: 'researcher', label: 'Researcher', family: 'research', defaultRoute: '/dashboard', defaultPrivileges: ['view_analytics', 'manage_research'], forbiddenPrivileges: [] },
  { id: 'medical_student', label: 'Medical Student', family: 'teaching', defaultRoute: '/dashboard', defaultPrivileges: ['view_notes', 'attend_teaching'], forbiddenPrivileges: ['write_notes', 'prescribe'] },
  { id: 'receptionist', label: 'Receptionist', family: 'patient', defaultRoute: '/dashboard', defaultPrivileges: ['register_patients', 'manage_appointments'], forbiddenPrivileges: [] },
  { id: 'telemedicine_officer', label: 'Telemedicine Officer', family: 'telemedicine', defaultRoute: '/dashboard', defaultPrivileges: ['conduct_teleconsult'], forbiddenPrivileges: [] },
  { id: 'community_health_officer', label: 'Community Health Officer', family: 'community_health', defaultRoute: '/dashboard', defaultPrivileges: ['outreach', 'register_patients'], forbiddenPrivileges: [] },
  { id: 'patient', label: 'Patient', family: 'patient', defaultRoute: '/dashboard/patient', defaultPrivileges: ['view_own_records', 'manage_own_appointments'], forbiddenPrivileges: ['write_notes', 'prescribe', 'view_others_records'] },
];

const PRIVILEGES: PrivilegeDef[] = [
  { id: 'prescribe', name: 'Prescribe', description: 'Write prescriptions', domain: 'prescribing', requiresLevel: 'independent' },
  { id: 'dispense_medication', name: 'Dispense Medication', description: 'Dispense prescribed medication', domain: 'pharmacy', requiresLevel: 'supervised' },
  { id: 'review_prescriptions', name: 'Review Prescriptions', description: 'Clinical review of prescriptions', domain: 'pharmacy', requiresLevel: 'independent' },
  { id: 'drug_interaction_check', name: 'Drug Interaction Check', description: 'Screen for drug interactions', domain: 'pharmacy', requiresLevel: 'supervised' },
  { id: 'administer_medication', name: 'Administer Medication', description: 'Administer medication to patients', domain: 'clinical', requiresLevel: 'supervised' },
  { id: 'admit', name: 'Admit', description: 'Admit patients', domain: 'clinical', requiresLevel: 'independent' },
  { id: 'discharge', name: 'Discharge', description: 'Discharge patients', domain: 'clinical', requiresLevel: 'independent' },
  { id: 'order_labs', name: 'Order Labs', description: 'Order laboratory investigations', domain: 'clinical', requiresLevel: 'supervised' },
  { id: 'order_imaging', name: 'Order Imaging', description: 'Order imaging studies', domain: 'clinical', requiresLevel: 'supervised' },
  { id: 'run_lab_tests', name: 'Run Lab Tests', description: 'Perform laboratory tests', domain: 'lab', requiresLevel: 'supervised' },
  { id: 'validate_lab_results', name: 'Validate Lab Results', description: 'Validate laboratory results', domain: 'lab', requiresLevel: 'independent' },
  { id: 'release_lab_results', name: 'Release Lab Results', description: 'Release laboratory results to clinicians', domain: 'lab', requiresLevel: 'independent' },
  { id: 'perform_imaging', name: 'Perform Imaging', description: 'Perform imaging studies', domain: 'imaging', requiresLevel: 'supervised' },
  { id: 'release_imaging_reports', name: 'Release Imaging Reports', description: 'Release radiology reports', domain: 'imaging', requiresLevel: 'independent' },
  { id: 'interpret_studies', name: 'Interpret Studies', description: 'Interpret imaging studies', domain: 'imaging', requiresLevel: 'expert' },
  { id: 'perform_surgery', name: 'Perform Surgery', description: 'Perform surgical procedures', domain: 'surgical', requiresLevel: 'independent' },
  { id: 'perform_major_surgery_independent', name: 'Major Surgery (Independent)', description: 'Independent major surgery', domain: 'surgical', requiresLevel: 'expert' },
  { id: 'write_notes', name: 'Write Notes', description: 'Write clinical notes', domain: 'clinical', requiresLevel: 'supervised' },
  { id: 'record_vitals', name: 'Record Vitals', description: 'Record vital signs', domain: 'clinical', requiresLevel: 'observed' },
  { id: 'patient_care', name: 'Patient Care', description: 'Provide bedside care', domain: 'clinical', requiresLevel: 'observed' },
  { id: 'manage_organization', name: 'Manage Organization', description: 'Manage organizational identity & governance', domain: 'admin', requiresLevel: 'independent' },
  { id: 'manage_structure', name: 'Manage Structure', description: 'Build hospital structure (digital twin)', domain: 'admin', requiresLevel: 'independent' },
  { id: 'manage_departments', name: 'Manage Departments', description: 'Manage departments & units', domain: 'admin', requiresLevel: 'independent' },
  { id: 'manage_workforce', name: 'Manage Workforce', description: 'Provision & govern workforce', domain: 'hr', requiresLevel: 'independent' },
  { id: 'manage_employment', name: 'Manage Employment', description: 'Create & manage employments', domain: 'hr', requiresLevel: 'supervised' },
  { id: 'manage_recruitment', name: 'Manage Recruitment', description: 'Recruit staff', domain: 'hr', requiresLevel: 'supervised' },
  { id: 'manage_infrastructure', name: 'Manage Infrastructure', description: 'Manage assets & infrastructure', domain: 'admin', requiresLevel: 'independent' },
  { id: 'manage_governance', name: 'Manage Governance', description: 'Manage governance, policies & approvals', domain: 'governance', requiresLevel: 'independent' },
  { id: 'credential_staff', name: 'Credential Staff', description: 'Verify & credential staff', domain: 'governance', requiresLevel: 'independent' },
  { id: 'approve_procedures', name: 'Approve Procedures', description: 'Approve procedures & discharges', domain: 'clinical', requiresLevel: 'expert' },
  { id: 'govern_clinical', name: 'Govern Clinical', description: 'Clinical governance', domain: 'governance', requiresLevel: 'expert' },
  { id: 'manage_billing', name: 'Manage Billing', description: 'Manage billing & claims', domain: 'finance', requiresLevel: 'independent' },
  { id: 'process_payments', name: 'Process Payments', description: 'Process payments & M-Pesa', domain: 'finance', requiresLevel: 'supervised' },
  { id: 'view_finance', name: 'View Finance', description: 'View financial analytics', domain: 'finance', requiresLevel: 'supervised' },
  { id: 'manage_assets', name: 'Manage Assets', description: 'Manage IT & medical assets', domain: 'ict', requiresLevel: 'supervised' },
  { id: 'manage_integrations', name: 'Manage Integrations', description: 'Manage HMIS/EMR integrations', domain: 'ict', requiresLevel: 'independent' },
  { id: 'view_analytics', name: 'View Analytics', description: 'View analytics', domain: 'analytics', requiresLevel: 'supervised' },
  { id: 'manage_research', name: 'Manage Research', description: 'Manage research projects', domain: 'research', requiresLevel: 'supervised' },
  { id: 'register_patients', name: 'Register Patients', description: 'Register patients & demographics', domain: 'patient', requiresLevel: 'observed' },
  { id: 'manage_appointments', name: 'Manage Appointments', description: 'Manage appointments & booking', domain: 'patient', requiresLevel: 'observed' },
  { id: 'conduct_teleconsult', name: 'Conduct Teleconsult', description: 'Conduct telemedicine consults', domain: 'telemedicine', requiresLevel: 'independent' },
  { id: 'outreach', name: 'Outreach', description: 'Community outreach programs', domain: 'community', requiresLevel: 'supervised' },
  { id: 'view_own_records', name: 'View Own Records', description: 'Patient views own records', domain: 'patient', requiresLevel: 'observed' },
  { id: 'manage_own_appointments', name: 'Manage Own Appointments', description: 'Patient manages own appointments', domain: 'patient', requiresLevel: 'observed' },
  { id: 'view_others_records', name: 'View Others Records', description: 'Cross-patient record access (forbidden by default)', domain: 'security', requiresLevel: 'expert' },
  { id: 'view_notes', name: 'View Notes', description: 'View clinical notes (teaching)', domain: 'clinical', requiresLevel: 'observed' },
  { id: 'attend_teaching', name: 'Attend Teaching', description: 'Attend teaching sessions', domain: 'teaching', requiresLevel: 'observed' },
  { id: 'sign_death_certificate_without_review', name: 'Sign Death Certificate', description: 'Sign death certificate without review', domain: 'governance', requiresLevel: 'expert' },
  { id: 'prescribe_independently', name: 'Prescribe Independently', description: 'Independent prescribing (safety-sensitive)', domain: 'prescribing', requiresLevel: 'independent' },
];

const catRegistry = new Map<string, ProfessionalCategoryDef>(PROFESSIONAL_CATEGORIES.map((d) => [d.id, d]));
const privRegistry = new Map<string, PrivilegeDef>(PRIVILEGES.map((d) => [d.id, d]));

export function registerProfessionalCategory(def: ProfessionalCategoryDef): void {
  catRegistry.set(def.id, def);
}
export function getProfessionalCategory(id: string): ProfessionalCategoryDef | undefined {
  return catRegistry.get(id);
}
export function getAllProfessionalCategories(): ProfessionalCategoryDef[] {
  return Array.from(catRegistry.values());
}
export function isRegisteredProfessionalCategory(id: string): boolean {
  return catRegistry.has(id);
}

export function registerPrivilege(def: PrivilegeDef): void {
  privRegistry.set(def.id, def);
}
export function getPrivilege(id: string): PrivilegeDef | undefined {
  return privRegistry.get(id);
}
export function getAllPrivileges(): PrivilegeDef[] {
  return Array.from(privRegistry.values());
}
export function isRegisteredPrivilege(id: string): boolean {
  return privRegistry.has(id);
}