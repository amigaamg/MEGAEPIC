/**
 * AMEXAN — Developer Seed Configuration
 *
 * Single source of truth for ALL development seed data.
 * Organized arrays used by:
 *   - scripts/seed-all.ts    (CLI via npx tsx)
 *   - app/api/setup/route.ts (HTTP API)
 *   - lib/amexan/patient-constitution/seed-engine.ts  (lib functions)
 *
 * Password convention:
 *   - Platform/Clinical users: Dev123!
 *   - Patients: Patient123!
 */

import type { SeedRole } from './patient-constitution/types';

// ── Organizations ──────────────────────────────────────────────────────────────

export interface SeedOrgDef {
  id: string;
  name: string;
  type: string;
  level: string;
  departments: string[];
  pricingTier: string;
  verified: boolean;
}

export const SEED_ORGANIZATIONS: SeedOrgDef[] = [
  { id: 'ktrh', name: 'AMEXAN Demo Teaching Hospital', type: 'teaching_hospital', level: 'level_5', pricingTier: 'enterprise', verified: true, departments: ['Emergency', 'Medicine', 'Surgery', 'Pediatrics', 'OBGYN', 'Psychiatry', 'Radiology', 'Laboratory', 'Pharmacy', 'ICU', 'Theatre', 'Outpatient'] },
  { id: 'knh', name: 'Kenyatta National Hospital', type: 'hospital', level: 'level_6', pricingTier: 'enterprise', verified: true, departments: ['Emergency', 'Medicine', 'Surgery', 'Pediatrics', 'OBGYN', 'Cardiology', 'Neurology', 'Oncology', 'Radiology', 'Laboratory', 'Pharmacy', 'ICU', 'Theatre', 'Outpatient'] },
  { id: 'nrb', name: 'Nairobi Hospital', type: 'hospital', level: 'level_5', pricingTier: 'professional', verified: true, departments: ['Emergency', 'Medicine', 'Surgery', 'Pediatrics', 'OBGYN', 'Cardiology', 'Radiology', 'Laboratory', 'Pharmacy', 'ICU'] },
  { id: 'akuh', name: 'Aga Khan University Hospital', type: 'teaching_hospital', level: 'level_6', pricingTier: 'enterprise', verified: true, departments: ['Emergency', 'Medicine', 'Surgery', 'Pediatrics', 'OBGYN', 'Cardiology', 'Neurology', 'Oncology', 'Radiology', 'Laboratory', 'Pharmacy', 'ICU', 'Theatre', 'Research'] },
  { id: 'mtrh', name: 'Moi Teaching & Referral Hospital', type: 'teaching_hospital', level: 'level_5', pricingTier: 'enterprise', verified: true, departments: ['Emergency', 'Medicine', 'Surgery', 'Pediatrics', 'OBGYN', 'Radiology', 'Laboratory', 'Pharmacy', 'ICU'] },
  { id: 'fmc', name: 'Family Medical Centre', type: 'clinic', level: 'level_2', pricingTier: 'starter', verified: true, departments: ['Outpatient', 'Pharmacy', 'Laboratory'] },
  { id: 'nhc', name: 'Nyamira Health Centre', type: 'rural_health_centre', level: 'level_2', pricingTier: 'ngo', verified: true, departments: ['Outpatient', 'Maternity', 'Pharmacy', 'Laboratory'] },
  { id: 'fdea', name: 'Flying Doctors East Africa', type: 'mobile_outreach', level: 'level_4', pricingTier: 'professional', verified: true, departments: ['Emergency', 'Surgery', 'Radiology'] },
  { id: 'avc', name: 'AMEXAN Virtual Care', type: 'telemedicine', level: 'level_3', pricingTier: 'professional', verified: true, departments: ['Telemedicine', 'Pharmacy'] },
];

// ── User definitions ───────────────────────────────────────────────────────────

export interface SeedUserDef {
  email: string;
  password: string;
  name: string;
  role: SeedRole | string;
  orgId: string;
  amxUid?: string;
  license?: string;
  specialty?: string;
  dept?: string;
  phone?: string;
}

/** Platform Super Users (AMEXAN Internal) — all auto-verified */
export const SEED_PLATFORM_USERS: SeedUserDef[] = [
  { email: 'superadmin@amexan.dev', password: 'Dev123!', name: 'AMEXAN Super Admin', role: 'super_admin', orgId: 'amexan', license: 'SYS-00001' },
  { email: 'architect@amexan.dev', password: 'Dev123!', name: 'Platform Architect', role: 'platform_architect', orgId: 'amexan', license: 'SYS-00002' },
  { email: 'constitution@amexan.dev', password: 'Dev123!', name: 'Constitution Team', role: 'constitution_team', orgId: 'amexan', license: 'SYS-00003' },
  { email: 'knowledge@amexan.dev', password: 'Dev123!', name: 'Medical Knowledge Team', role: 'knowledge_team', orgId: 'amexan', license: 'SYS-00004' },
  { email: 'rules@amexan.dev', password: 'Dev123!', name: 'Rules Engineering', role: 'rules_engineer', orgId: 'amexan', license: 'SYS-00005' },
  { email: 'graph@amexan.dev', password: 'Dev123!', name: 'Graph Engineering', role: 'graph_engineer', orgId: 'amexan', license: 'SYS-00006' },
  { email: 'aisafety@amexan.dev', password: 'Dev123!', name: 'AI Safety Team', role: 'ai_safety', orgId: 'amexan', license: 'SYS-00007' },
  { email: 'docs@amexan.dev', password: 'Dev123!', name: 'Documentation Team', role: 'documentation', orgId: 'amexan', license: 'SYS-00008' },
  { email: 'qa@amexan.dev', password: 'Dev123!', name: 'Clinical QA Team', role: 'qa', orgId: 'amexan', license: 'SYS-00009' },
  { email: 'ux@amexan.dev', password: 'Dev123!', name: 'UX Research', role: 'ux_research', orgId: 'amexan', license: 'SYS-00010' },
  { email: 'success@amexan.dev', password: 'Dev123!', name: 'Customer Success', role: 'customer_success', orgId: 'amexan', license: 'SYS-00011' },
  { email: 'finance@amexan.dev', password: 'Dev123!', name: 'Finance', role: 'finance', orgId: 'amexan', license: 'SYS-00012' },
  { email: 'marketplace@amexan.dev', password: 'Dev123!', name: 'Marketplace Review', role: 'marketplace_review', orgId: 'amexan', license: 'SYS-00013' },
  { email: 'deploy@amexan.dev', password: 'Dev123!', name: 'Deployment Engineer', role: 'deployment', orgId: 'amexan', license: 'SYS-00014' },
];

/** Clinical Users (AMEXAN Demo Teaching Hospital) */
export const SEED_CLINICAL_USERS: SeedUserDef[] = [
  { email: 'consultant.med@kisii.dev', password: 'Dev123!', name: 'Dr. Consultant Physician', role: 'consultant_physician', orgId: 'ktrh', license: 'KMPDC-TEST-00001', specialty: 'Internal Medicine', dept: 'Medicine' },
  { email: 'mo@kisii.dev', password: 'Dev123!', name: 'Dr. Medical Officer', role: 'medical_officer', orgId: 'ktrh', license: 'KMPDC-TEST-00002', dept: 'Emergency' },
  { email: 'intern@kisii.dev', password: 'Dev123!', name: 'Dr. Intern', role: 'intern', orgId: 'ktrh', license: 'KMPDC-TEST-00003', dept: 'Medicine' },
  { email: 'resident@kisii.dev', password: 'Dev123!', name: 'Dr. Resident', role: 'resident', orgId: 'ktrh', license: 'KMPDC-TEST-00004', dept: 'Surgery' },
  { email: 'student@kisii.dev', password: 'Dev123!', name: 'Medical Student Year 4', role: 'medical_student', orgId: 'ktrh', dept: 'Medicine' },
  { email: 'surgery@kisii.dev', password: 'Dev123!', name: 'Dr. Surgeon', role: 'consultant_surgeon', orgId: 'ktrh', license: 'KMPDC-TEST-00005', specialty: 'General Surgery', dept: 'Surgery' },
  { email: 'paeds@kisii.dev', password: 'Dev123!', name: 'Dr. Pediatrician', role: 'pediatrician', orgId: 'ktrh', license: 'KMPDC-TEST-00006', specialty: 'Pediatrics', dept: 'Pediatrics' },
  { email: 'obgyn@kisii.dev', password: 'Dev123!', name: 'Dr. Obstetrician', role: 'obstetrician', orgId: 'ktrh', license: 'KMPDC-TEST-00007', specialty: 'Obstetrics & Gynecology', dept: 'OBGYN' },
  { email: 'psych@kisii.dev', password: 'Dev123!', name: 'Dr. Psychiatrist', role: 'psychiatrist', orgId: 'ktrh', license: 'KMPDC-TEST-00008', specialty: 'Psychiatry', dept: 'Psychiatry' },
  { email: 'anaesthesia@kisii.dev', password: 'Dev123!', name: 'Dr. Anaesthesiologist', role: 'anaesthesiologist', orgId: 'ktrh', license: 'KMPDC-TEST-00009', dept: 'Theatre' },
  { email: 'emergency@kisii.dev', password: 'Dev123!', name: 'Dr. Emergency Physician', role: 'emergency_physician', orgId: 'ktrh', license: 'KMPDC-TEST-00010', dept: 'Emergency' },
  { email: 'family@kisii.dev', password: 'Dev123!', name: 'Dr. Family Physician', role: 'family_physician', orgId: 'fmc', license: 'KMPDC-TEST-00011', dept: 'Outpatient' },
  { email: 'radiology@kisii.dev', password: 'Dev123!', name: 'Dr. Radiologist', role: 'radiologist', orgId: 'ktrh', license: 'KMPDC-TEST-00012', specialty: 'Radiology', dept: 'Radiology' },
  { email: 'pathology@kisii.dev', password: 'Dev123!', name: 'Dr. Pathologist', role: 'pathologist', orgId: 'ktrh', license: 'KMPDC-TEST-00013', dept: 'Laboratory' },
];

/** Nursing Staff */
export const SEED_NURSES: SeedUserDef[] = [
  { email: 'nurse@kisii.dev', password: 'Dev123!', name: 'Staff Nurse', role: 'nurse', orgId: 'ktrh', license: 'NCK-TEST-00001', dept: 'Medicine' },
  { email: 'snurse@kisii.dev', password: 'Dev123!', name: 'Senior Nurse', role: 'senior_nurse', orgId: 'ktrh', license: 'NCK-TEST-00002', dept: 'Surgery' },
  { email: 'icu.nurse@kisii.dev', password: 'Dev123!', name: 'ICU Nurse', role: 'icu_nurse', orgId: 'ktrh', license: 'NCK-TEST-00003', dept: 'ICU' },
  { email: 'theatre@kisii.dev', password: 'Dev123!', name: 'Theatre Nurse', role: 'theatre_nurse', orgId: 'ktrh', license: 'NCK-TEST-00004', dept: 'Theatre' },
];

/** Allied Health Professionals */
export const SEED_ALLIED_HEALTH: SeedUserDef[] = [
  { email: 'lab@kisii.dev', password: 'Dev123!', name: 'Laboratory Scientist', role: 'lab_scientist', orgId: 'ktrh', license: 'KMLTTB-TEST-00001', dept: 'Laboratory' },
  { email: 'labtech@kisii.dev', password: 'Dev123!', name: 'Lab Technician', role: 'lab_technician', orgId: 'ktrh', license: 'KMLTTB-TEST-00002', dept: 'Laboratory' },
  { email: 'pharmacy@kisii.dev', password: 'Dev123!', name: 'Pharmacist', role: 'pharmacist', orgId: 'ktrh', license: 'PPB-TEST-00001', dept: 'Pharmacy' },
  { email: 'nutrition@kisii.dev', password: 'Dev123!', name: 'Nutritionist', role: 'nutritionist', orgId: 'ktrh', license: 'KNDI-TEST-00001', dept: 'Medicine' },
  { email: 'physio@kisii.dev', password: 'Dev123!', name: 'Physiotherapist', role: 'physiotherapist', orgId: 'ktrh', license: 'KPTRB-TEST-00001', dept: 'Medicine' },
  { email: 'ot@kisii.dev', password: 'Dev123!', name: 'Occupational Therapist', role: 'occupational_therapist', orgId: 'ktrh', license: 'KOTRB-TEST-00001', dept: 'Medicine' },
  { email: 'speech@kisii.dev', password: 'Dev123!', name: 'Speech Therapist', role: 'speech_therapist', orgId: 'ktrh', license: 'KSTRB-TEST-00001', dept: 'Medicine' },
  { email: 'social@kisii.dev', password: 'Dev123!', name: 'Social Worker', role: 'social_worker', orgId: 'ktrh', license: 'KSWB-TEST-00001', dept: 'Psychiatry' },
];

/** Non-clinical Staff */
export const SEED_STAFF: SeedUserDef[] = [
  { email: 'reception@kisii.dev', password: 'Dev123!', name: 'Receptionist', role: 'receptionist', orgId: 'ktrh', dept: 'Outpatient' },
  { email: 'cashier@kisii.dev', password: 'Dev123!', name: 'Cashier', role: 'cashier', orgId: 'ktrh', dept: 'Outpatient' },
  { email: 'admin@kisii.dev', password: 'Dev123!', name: 'Facility Administrator', role: 'facility_administrator', orgId: 'ktrh', dept: 'Administration' },
];

/** Medical Students */
export const SEED_STUDENTS: SeedUserDef[] = [
  { email: 'student@kisii.dev', password: 'Dev123!', name: 'Medical Student Year 4', role: 'medical_student', orgId: 'ktrh', dept: 'Medicine' },
];

// ── Patients ───────────────────────────────────────────────────────────────────

export interface SeedPatientDef {
  email: string;
  name: string;
  context: string;
  age: number;
  sex: string;
  conditions: string[];
  pregnant?: boolean;
  weeksPregnant?: number;
}

export const SEED_PATIENTS: SeedPatientDef[] = [
  { email: 'patient.healthy.male@demo.dev', name: 'John Mwangi', context: 'Adult male - Healthy', age: 32, sex: 'male', conditions: [] },
  { email: 'patient.healthy.female@demo.dev', name: 'Sarah Wanjiku', context: 'Adult female - Healthy', age: 27, sex: 'female', conditions: [] },
  { email: 'patient.pregnant@demo.dev', name: 'Mary Wanjiku', context: 'Pregnant - 12 weeks', age: 28, sex: 'female', conditions: ['pregnancy'], pregnant: true, weeksPregnant: 12 },
  { email: 'patient.term@demo.dev', name: 'Jane Akinyi', context: 'Pregnant - 39 weeks', age: 31, sex: 'female', conditions: ['pregnancy'], pregnant: true, weeksPregnant: 39 },
  { email: 'patient.postpartum@demo.dev', name: 'Grace Kamau', context: 'Postpartum', age: 26, sex: 'female', conditions: [] },
  { email: 'patient.neonate@demo.dev', name: 'Baby Kamau', context: 'Neonate - Day 1', age: 0, sex: 'male', conditions: [] },
  { email: 'patient.premature@demo.dev', name: 'Baby Otieno', context: 'Premature neonate - 32 weeks', age: 0, sex: 'male', conditions: ['prematurity'] },
  { email: 'patient.infant@demo.dev', name: 'Kevin Otieno', context: 'Infant - 6 months', age: 0, sex: 'male', conditions: [] },
  { email: 'patient.toddler@demo.dev', name: 'Amina Hassan', context: 'Toddler - 2 years', age: 2, sex: 'female', conditions: [] },
  { email: 'patient.child@demo.dev', name: 'Sarah Chebet', context: 'School child - 8 years', age: 8, sex: 'female', conditions: ['asthma'] },
  { email: 'patient.child.healthy@demo.dev', name: 'Peter Kamau', context: 'School child - 10 years, Healthy', age: 10, sex: 'male', conditions: [] },
  { email: 'patient.adolescent@demo.dev', name: 'James Kiprop', context: 'Adolescent - 15 years', age: 15, sex: 'male', conditions: [] },
  { email: 'patient.adult@demo.dev', name: 'Michael Omondi', context: 'Adult - 45 years', age: 45, sex: 'male', conditions: [] },
  { email: 'patient.hiv@demo.dev', name: 'David Ochieng', context: 'HIV - Stable on ART', age: 42, sex: 'male', conditions: ['hiv'] },
  { email: 'patient.tb@demo.dev', name: 'Samuel Mutua', context: 'TB - New diagnosis', age: 38, sex: 'male', conditions: ['tb'] },
  { email: 'patient.diabetes@demo.dev', name: 'Peter Njenga', context: 'Diabetes Type 2', age: 55, sex: 'male', conditions: ['diabetes', 'hypertension'] },
  { email: 'patient.htn@demo.dev', name: 'Elizabeth Wambui', context: 'Hypertension', age: 60, sex: 'female', conditions: ['hypertension'] },
  { email: 'patient.hf@demo.dev', name: 'Joseph Barasa', context: 'Heart Failure', age: 70, sex: 'male', conditions: ['heart failure', 'hypertension'] },
  { email: 'patient.ckd@demo.dev', name: 'Alice Nyambura', context: 'CKD Stage 4', age: 48, sex: 'female', conditions: ['ckd', 'hypertension'] },
  { email: 'patient.copd@demo.dev', name: 'John Kiplagat', context: 'COPD', age: 65, sex: 'male', conditions: ['copd'] },
  { email: 'patient.asthma@demo.dev', name: 'Faith Nyokabi', context: 'Asthma - Moderate Persistent', age: 24, sex: 'female', conditions: ['asthma'] },
  { email: 'patient.cancer@demo.dev', name: 'Robert Onyango', context: 'Cancer - Newly diagnosed', age: 52, sex: 'male', conditions: ['cancer'] },
  { email: 'patient.psych@demo.dev', name: 'Esther Wanjala', context: 'Depression', age: 35, sex: 'female', conditions: ['depression', 'mental health'] },
  { email: 'patient.trauma@demo.dev', name: 'Kevin Mwangi', context: 'Polytrauma - MVA', age: 29, sex: 'male', conditions: [] },
  { email: 'patient.icu@demo.dev', name: 'Patrick Omondi', context: 'ICU - Septic Shock', age: 50, sex: 'male', conditions: ['sepsis', 'respiratory failure'] },
  { email: 'patient.elderly@demo.dev', name: 'Grace Nyambura', context: 'Elderly - 80 years', age: 80, sex: 'female', conditions: ['hypertension'] },
  { email: 'patient.palliative@demo.dev', name: 'Samuel Kioko', context: 'Palliative Care - Advanced Cancer', age: 58, sex: 'male', conditions: ['cancer'] },
  { email: 'patient.terminal@demo.dev', name: 'Rose Achieng', context: 'Terminal illness - End stage liver disease', age: 62, sex: 'female', conditions: ['cirrhosis', 'liver failure'] },
];

// ── Subscription testing states ────────────────────────────────────────────────

export const SEED_SUBSCRIPTION_STATES: { orgId: string; plan: string }[] = [
  { orgId: 'ktrh', plan: 'enterprise' },
  { orgId: 'knh', plan: 'enterprise' },
  { orgId: 'nrb', plan: 'professional' },
  { orgId: 'akuh', plan: 'enterprise' },
  { orgId: 'mtrh', plan: 'enterprise' },
  { orgId: 'fmc', plan: 'starter' },
  { orgId: 'nhc', plan: 'ngo' },
  { orgId: 'fdea', plan: 'professional' },
  { orgId: 'avc', plan: 'professional' },
  // Additional billing test states
  { orgId: 'trial_org', plan: 'trial' },
  { orgId: 'expired_org', plan: 'trial_expired' },
  { orgId: 'academic_org', plan: 'academic' },
  { orgId: 'govt_org', plan: 'government' },
  { orgId: 'suspended_org', plan: 'suspended' },
  { orgId: 'cancelled_org', plan: 'cancelled' },
];

// ── API Tokens ─────────────────────────────────────────────────────────────────

export interface SeedApiTokenDef {
  name: string;
  token: string;
  scopes: string[];
  orgId: string;
  type: string;
}

export const SEED_API_TOKENS: SeedApiTokenDef[] = [
  { name: 'FHIR Integration - KTRH', token: 'amx_fhir_ktrh_dev_001', scopes: ['patient.read', 'encounter.read', 'observation.read', 'condition.read', 'medication.read'], orgId: 'ktrh', type: 'fhir' },
  { name: 'HL7 Interface - KNH', token: 'amx_hl7_knh_dev_002', scopes: ['adt.send', 'orm.send', 'oru.receive', 'dfn.send'], orgId: 'knh', type: 'hl7' },
  { name: 'DICOM Gateway - AKUH', token: 'amx_dicom_akuh_dev_003', scopes: ['modality.read', 'study.read', 'series.read', 'instance.read', 'store'], orgId: 'akuh', type: 'dicom' },
  { name: 'PACS Viewer - KTRH', token: 'amx_pacs_ktrh_dev_004', scopes: ['study.read', 'series.read', 'wado.read', 'stow.write'], orgId: 'ktrh', type: 'pacs' },
  { name: 'LIS Integration - NRB', token: 'amx_lis_nrb_dev_005', scopes: ['order.create', 'order.read', 'result.read', 'result.write'], orgId: 'nrb', type: 'lis' },
  { name: 'Insurance Claims - NHIF', token: 'amx_ins_nhif_dev_006', scopes: ['claim.create', 'claim.read', 'eligibility.check', 'authorization.read'], orgId: 'ktrh', type: 'insurance' },
  { name: 'AI Diagnosis Engine', token: 'amx_ai_diag_dev_007', scopes: ['patient.read', 'encounter.read', 'diagnosis.read', 'recommendation.create'], orgId: 'avc', type: 'ai' },
  { name: 'Marketplace API', token: 'amx_mkt_global_dev_008', scopes: ['listing.read', 'listing.create', 'order.read', 'order.create', 'review.read'], orgId: 'amexan', type: 'marketplace' },
];

// ── Verification states matrix ─────────────────────────────────────────────────

export const VERIFICATION_STATE_MAP: Record<string, string> = {
  'superadmin@amexan.dev': 'super_verified',
  'architect@amexan.dev': 'super_verified',
  'aisafety@amexan.dev': 'super_verified',
  'consultant.med@kisii.dev': 'super_verified',
  'patient.palliative@demo.dev': 'super_verified',
  'patient.terminal@demo.dev': 'super_verified',
  'admin@kisii.dev': 'facility_approved',
  'patient.hiv@demo.dev': 'facility_approved',
  'patient.diabetes@demo.dev': 'facility_approved',
  'patient.htn@demo.dev': 'facility_approved',
  'patient.hf@demo.dev': 'facility_approved',
  'patient.icu@demo.dev': 'facility_approved',
  'intern@kisii.dev': 'facility_pending',
  'patient.cancer@demo.dev': 'license_pending',
  'lab@kisii.dev': 'license_pending',
  'resident@kisii.dev': 'identity_pending',
  'surgery@kisii.dev': 'phone_verified',
  'mo@kisii.dev': 'email_verified',
  'student@kisii.dev': 'email_verified',
  'patient.healthy.male@demo.dev': 'email_verified',
  'patient.healthy.female@demo.dev': 'email_verified',
  'patient.pregnant@demo.dev': 'email_verified',
  'patient.psych@demo.dev': 'email_verified',
  'reception@kisii.dev': 'pending_email',
};

// ── Demo Clinical Cases ────────────────────────────────────────────────────────

export interface SeedDemoCaseDef {
  id: string;
  title: string;
  chiefComplaint: string;
  patientEmail: string;
  clinicianEmail: string;
  description: string;
  icd10: string;
  category: string;
  severity: string;
}

export const SEED_DEMO_CASES: SeedDemoCaseDef[] = [
  { id: 'case_chest_pain', title: 'Chest Pain - ACS Workup', chiefComplaint: 'Retrosternal chest pain radiating to left arm', patientEmail: 'patient.htn@demo.dev', clinicianEmail: 'consultant.med@kisii.dev', description: '60yo female with HTN presents with acute onset retrosternal chest pain radiating to left arm with nausea.', icd10: 'I20.0', category: 'medical', severity: 'severe' },
  { id: 'case_acute_abdomen', title: 'Acute Abdomen - Appendicitis', chiefComplaint: 'Right iliac fossa pain', patientEmail: 'patient.adult@demo.dev', clinicianEmail: 'surgery@kisii.dev', description: '45yo male with 24h history of central abdominal pain migrating to RIF, with nausea and anorexia.', icd10: 'K35.8', category: 'surgical', severity: 'moderate' },
  { id: 'case_stroke', title: 'Acute Stroke', chiefComplaint: 'Sudden left sided weakness', patientEmail: 'patient.elderly@demo.dev', clinicianEmail: 'emergency@kisii.dev', description: '80yo female with HTN presents with sudden left hemiparesis, facial droop, and slurred speech. Onset 2h ago.', icd10: 'I63.9', category: 'medical', severity: 'critical' },
  { id: 'case_pneumonia', title: 'Community Acquired Pneumonia', chiefComplaint: 'Cough with sputum and fever', patientEmail: 'patient.copd@demo.dev', clinicianEmail: 'mo@kisii.dev', description: '65yo male with COPD presents with 5d productive cough, high fever, and pleuritic chest pain.', icd10: 'J18.9', category: 'medical', severity: 'moderate' },
  { id: 'case_asthma', title: 'Acute Asthma Exacerbation', chiefComplaint: 'Severe SOB and wheezing', patientEmail: 'patient.asthma@demo.dev', clinicianEmail: 'emergency@kisii.dev', description: '24yo female with asthma presents with acute SOB, wheezing, unable to speak full sentences.', icd10: 'J45.9', category: 'medical', severity: 'severe' },
  { id: 'case_copd', title: 'COPD Exacerbation', chiefComplaint: 'Increased SOB and sputum purulence', patientEmail: 'patient.copd@demo.dev', clinicianEmail: 'mo@kisii.dev', description: '65yo male with COPD has increased dyspnoea, purulent sputum, wheezing for 3 days.', icd10: 'J44.1', category: 'medical', severity: 'moderate' },
  { id: 'case_hf', title: 'Acute Decompensated Heart Failure', chiefComplaint: 'Severe SOB, leg swelling', patientEmail: 'patient.hf@demo.dev', clinicianEmail: 'consultant.med@kisii.dev', description: '70yo male with HFrEF with worsening SOB, orthopnoea, PND, bilateral oedema, crackles.', icd10: 'I50.9', category: 'medical', severity: 'severe' },
  { id: 'case_sepsis', title: 'Septic Shock', chiefComplaint: 'Fever, confusion, hypotension', patientEmail: 'patient.icu@demo.dev', clinicianEmail: 'icu.nurse@kisii.dev', description: '50yo male with fever, hypotension, confusion, oliguria. Suspected urosepsis.', icd10: 'A41.9', category: 'medical', severity: 'critical' },
  { id: 'case_nnj', title: 'Neonatal Jaundice', chiefComplaint: 'Yellow skin and eyes', patientEmail: 'patient.neonate@demo.dev', clinicianEmail: 'paeds@kisii.dev', description: 'Day 1 neonate with jaundice. Mother O+, baby A+. ABO incompatibility concern.', icd10: 'P59.9', category: 'pediatric', severity: 'moderate' },
  { id: 'case_nns', title: 'Neonatal Sepsis', chiefComplaint: 'Fever, poor feeding, lethargy', patientEmail: 'patient.premature@demo.dev', clinicianEmail: 'paeds@kisii.dev', description: '32-week premature neonate with fever, poor feeding, lethargy, grunting.', icd10: 'P36.9', category: 'pediatric', severity: 'critical' },
  { id: 'case_pet', title: 'Pregnancy with Pre-eclampsia', chiefComplaint: 'Headache, visual disturbance, BP 160/110', patientEmail: 'patient.term@demo.dev', clinicianEmail: 'obgyn@kisii.dev', description: '31yo G1P0 at 39wk with severe headache, blurred vision, BP 160/110, urine protein 3+.', icd10: 'O14.1', category: 'obstetric', severity: 'critical' },
  { id: 'case_pph', title: 'Postpartum Haemorrhage', chiefComplaint: 'Heavy vaginal bleeding', patientEmail: 'patient.postpartum@demo.dev', clinicianEmail: 'obgyn@kisii.dev', description: '26yo 2h post NVD with heavy PV bleeding, tachycardia, hypotension.', icd10: 'O72.1', category: 'obstetric', severity: 'critical' },
  { id: 'case_eclampsia', title: 'Eclampsia', chiefComplaint: 'Generalized seizure', patientEmail: 'patient.term@demo.dev', clinicianEmail: 'obgyn@kisii.dev', description: '31yo at 39wk with PET develops GTC seizure in labour ward.', icd10: 'O15.0', category: 'obstetric', severity: 'critical' },
  { id: 'case_ped_malaria', title: 'Severe Pediatric Malaria', chiefComplaint: 'High fever, vomiting, lethargy', patientEmail: 'patient.child@demo.dev', clinicianEmail: 'paeds@kisii.dev', description: '8yo female with 3d high fever, vomiting, malaise. From malaria-endemic area.', icd10: 'B50.9', category: 'pediatric', severity: 'severe' },
  { id: 'case_tb', title: 'Pulmonary Tuberculosis', chiefComplaint: 'Chronic cough, weight loss, night sweats', patientEmail: 'patient.tb@demo.dev', clinicianEmail: 'mo@kisii.dev', description: '38yo male with 3wk cough, haemoptysis, weight loss, night sweats. TB contact.', icd10: 'A15.0', category: 'medical', severity: 'moderate' },
  { id: 'case_hiv', title: 'HIV with OI', chiefComplaint: 'Fever, cough, oral thrush', patientEmail: 'patient.hiv@demo.dev', clinicianEmail: 'mo@kisii.dev', description: '42yo male known HIV on ART with fever, cough, oral candidiasis, 5kg weight loss.', icd10: 'B24', category: 'medical', severity: 'severe' },
  { id: 'case_dka', title: 'Diabetic Ketoacidosis', chiefComplaint: 'Vomiting, abdominal pain, deep breathing', patientEmail: 'patient.diabetes@demo.dev', clinicianEmail: 'emergency@kisii.dev', description: '55yo male DM2 with nausea, vomiting, Kussmaul breathing, altered sensorium.', icd10: 'E11.1', category: 'medical', severity: 'critical' },
  { id: 'case_ckd', title: 'CKD Uremia', chiefComplaint: 'Nausea, fatigue, oliguria', patientEmail: 'patient.ckd@demo.dev', clinicianEmail: 'consultant.med@kisii.dev', description: '48yo female CKD4 with nausea, anorexia, fatigue, metallic taste, oliguria.', icd10: 'N18.4', category: 'medical', severity: 'moderate' },
  { id: 'case_trauma', title: 'Polytrauma MVA', chiefComplaint: 'Multiple injuries post high-speed MVA', patientEmail: 'patient.trauma@demo.dev', clinicianEmail: 'emergency@kisii.dev', description: '29yo male MVA. GCS13, open femur #, rib #s, abdominal tenderness. ATLS primary survey.', icd10: 'T07', category: 'emergency', severity: 'critical' },
  { id: 'case_burns', title: 'Severe Burns', chiefComplaint: 'Thermal burns chest and arms', patientEmail: 'patient.trauma@demo.dev', clinicianEmail: 'surgery@kisii.dev', description: '29yo male 30% TBSA burns anterior chest + bilateral arms from house fire.', icd10: 'T31.3', category: 'emergency', severity: 'severe' },
  { id: 'case_snake', title: 'Snake Envenomation', chiefComplaint: 'Snake bite right foot with swelling', patientEmail: 'patient.adult@demo.dev', clinicianEmail: 'emergency@kisii.dev', description: '45yo male bitten on right foot 4h ago. Progressive swelling, pain, bleeding.', icd10: 'T63.0', category: 'emergency', severity: 'severe' },
  { id: 'case_poison', title: 'Organophosphate Poisoning', chiefComplaint: 'Salivation, sweating, small pupils', patientEmail: 'patient.adult@demo.dev', clinicianEmail: 'emergency@kisii.dev', description: '45yo male with salivation, lacrimation, miosis, fasciculations. Pesticide exposure.', icd10: 'T60.0', category: 'emergency', severity: 'critical' },
  { id: 'case_psych', title: 'Acute Psychotic Episode', chiefComplaint: 'Agitation, paranoia, hallucinations', patientEmail: 'patient.psych@demo.dev', clinicianEmail: 'psych@kisii.dev', description: '35yo female with depression: acute agitation, paranoid delusions, command hallucinations.', icd10: 'F23', category: 'psychiatric', severity: 'severe' },
  { id: 'case_perf_ulcer', title: 'Perforated Peptic Ulcer', chiefComplaint: 'Sudden severe epigastric pain, rigidity', patientEmail: 'patient.diabetes@demo.dev', clinicianEmail: 'surgery@kisii.dev', description: '55yo male with PUD: sudden severe epigastric pain, board-like rigidity, free air.', icd10: 'K25.1', category: 'surgical', severity: 'critical' },
  { id: 'case_breast', title: 'Breast Lump', chiefComplaint: 'Painless lump left breast', patientEmail: 'patient.healthy.female@demo.dev', clinicianEmail: 'surgery@kisii.dev', description: '27yo female with 2cm firm irregular non-tender lump left breast upper outer quadrant.', icd10: 'N63', category: 'surgical', severity: 'moderate' },
  { id: 'case_goitre', title: 'Thyroid Swelling', chiefComplaint: 'Anterior neck swelling, dysphagia', patientEmail: 'patient.adult@demo.dev', clinicianEmail: 'surgery@kisii.dev', description: '45yo male with enlarging anterior neck swelling 2yr, mild dysphagia, voice change.', icd10: 'E04.2', category: 'surgical', severity: 'moderate' },
  { id: 'case_lgib', title: 'Lower GI Bleed', chiefComplaint: 'Fresh blood per rectum', patientEmail: 'patient.elderly@demo.dev', clinicianEmail: 'surgery@kisii.dev', description: '80yo female with diverticulosis: painless fresh PR bleeding, haemodynamically stable.', icd10: 'K92.1', category: 'surgical', severity: 'moderate' },
  { id: 'case_ugib', title: 'Upper GI Bleed', chiefComplaint: 'Haematemesis and melaena', patientEmail: 'patient.diabetes@demo.dev', clinicianEmail: 'consultant.med@kisii.dev', description: '55yo male on NSAIDs: haematemesis, melaena, tachycardic, Hb 8.0.', icd10: 'K92.0', category: 'medical', severity: 'severe' },
  { id: 'case_pancreatitis', title: 'Acute Pancreatitis', chiefComplaint: 'Severe epigastric pain radiating to back', patientEmail: 'patient.adult@demo.dev', clinicianEmail: 'surgery@kisii.dev', description: '45yo male with gallstones + alcohol: severe epigastric pain to back, nausea, vomiting.', icd10: 'K85.9', category: 'surgical', severity: 'severe' },
];

// ── Helper ─────────────────────────────────────────────────────────────────────

export function getAllSeedEmails(): string[] {
  const users = [...SEED_PLATFORM_USERS, ...SEED_CLINICAL_USERS, ...SEED_NURSES, ...SEED_ALLIED_HEALTH, ...SEED_STAFF, ...SEED_STUDENTS];
  return [...users.map((u) => u.email), ...SEED_PATIENTS.map((p) => p.email)];
}

export function getSeedProfileByEmail(email: string): SeedUserDef | SeedPatientDef | null {
  const allUsers = [...SEED_PLATFORM_USERS, ...SEED_CLINICAL_USERS, ...SEED_NURSES, ...SEED_ALLIED_HEALTH, ...SEED_STAFF, ...SEED_STUDENTS];
  const user = allUsers.find((u) => u.email === email);
  if (user) return user;
  const patient = SEED_PATIENTS.find((p) => p.email === email);
  if (patient) return patient;
  return null;
}
