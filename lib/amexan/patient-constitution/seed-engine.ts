import {
  type SeedProfile,
  type SeedRole,
  type SeedPatientProfile,
  type PatientVerificationLevel,
} from './types';

export interface SeedConfig {
  profile: 'developer' | 'minimal' | 'teaching' | 'district_hospital' | 'enterprise';
  organizations: SeedOrganization[];
  clinicians: SeedClinician[];
  nurses: SeedNurse[];
  patients: SeedPatient[];
  students: SeedStudent[];
  subscriptions: SeedSubscription[];
  verificationStates: SeedVerificationState[];
}

export interface SeedOrganization {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'teaching_hospital' | 'rural_health_centre' | 'telemedicine' | 'mobile_outreach';
  level: string;
  verified: boolean;
  departments: string[];
  location: string;
  county: string;
  country: string;
}

export interface SeedClinician {
  email: string;
  password: string;
  name: string;
  role: SeedRole;
  organization: string;
  license: string;
  specialty?: string;
  verification: 'auto_verified' | 'pending' | 'suspended' | 'expired';
}

export interface SeedNurse {
  email: string;
  password: string;
  name: string;
  role: SeedRole;
  organization: string;
  license: string;
  verification: 'auto_verified' | 'pending' | 'suspended' | 'expired';
}

export interface SeedPatient {
  email: string;
  name: string;
  context: string;
  age: number;
  sex: 'male' | 'female';
  conditions: string[];
  pregnant?: boolean;
  weeksPregnant?: number;
  verificationLevel: PatientVerificationLevel;
  hasHistory: boolean;
}

export interface SeedStudent {
  email: string;
  password: string;
  name: string;
  level: string;
  organization: string;
}

export interface SeedSubscription {
  organizationId: string;
  plan: 'trial' | 'trial_expired' | 'starter' | 'professional' | 'enterprise' | 'academic' | 'ngo' | 'government' | 'suspended' | 'cancelled';
}

export interface SeedVerificationState {
  email: string;
  state: 'pending_email' | 'email_verified' | 'phone_verified' | 'identity_pending' | 'license_pending' | 'facility_pending' | 'facility_approved' | 'suspended' | 'expired_license' | 'rejected' | 'revoked' | 'super_verified';
}

const ORGANIZATIONS: SeedOrganization[] = [
  { id: 'ktrh', name: 'Kisii Teaching & Referral Hospital', type: 'teaching_hospital', level: 'level_5', verified: true, departments: ['Emergency', 'Medicine', 'Surgery', 'Pediatrics', 'OBGYN', 'Psychiatry', 'Radiology', 'Laboratory', 'Pharmacy', 'ICU', 'Theatre', 'Outpatient'], location: 'Kisii', county: 'Kisii', country: 'Kenya' },
  { id: 'knh', name: 'Kenyatta National Hospital', type: 'hospital', level: 'level_6', verified: true, departments: ['Emergency', 'Medicine', 'Surgery', 'Pediatrics', 'OBGYN', 'Cardiology', 'Neurology', 'Oncology', 'Radiology', 'Laboratory', 'Pharmacy', 'ICU', 'Theatre', 'Outpatient'], location: 'Nairobi', county: 'Nairobi', country: 'Kenya' },
  { id: 'nrb', name: 'Nairobi Hospital', type: 'hospital', level: 'level_5', verified: true, departments: ['Emergency', 'Medicine', 'Surgery', 'Pediatrics', 'OBGYN', 'Cardiology', 'Radiology', 'Laboratory', 'Pharmacy', 'ICU'], location: 'Nairobi', county: 'Nairobi', country: 'Kenya' },
  { id: 'akuh', name: 'Aga Khan University Hospital', type: 'teaching_hospital', level: 'level_6', verified: true, departments: ['Emergency', 'Medicine', 'Surgery', 'Pediatrics', 'OBGYN', 'Cardiology', 'Neurology', 'Oncology', 'Radiology', 'Laboratory', 'Pharmacy', 'ICU', 'Theatre', 'Research'], location: 'Nairobi', county: 'Nairobi', country: 'Kenya' },
  { id: 'mtrh', name: 'Moi Teaching & Referral Hospital', type: 'teaching_hospital', level: 'level_5', verified: true, departments: ['Emergency', 'Medicine', 'Surgery', 'Pediatrics', 'OBGYN', 'Radiology', 'Laboratory', 'Pharmacy', 'ICU'], location: 'Eldoret', county: 'Uasin Gishu', country: 'Kenya' },
  { id: 'fmc', name: 'Family Medical Centre', type: 'clinic', level: 'level_2', verified: true, departments: ['Outpatient', 'Pharmacy', 'Laboratory'], location: 'Nairobi', county: 'Nairobi', country: 'Kenya' },
  { id: 'nhc', name: 'Nyamira Health Centre', type: 'rural_health_centre', level: 'level_2', verified: true, departments: ['Outpatient', 'Maternity', 'Pharmacy', 'Laboratory'], location: 'Nyamira', county: 'Nyamira', country: 'Kenya' },
  { id: 'fdea', name: 'Flying Doctors East Africa', type: 'mobile_outreach', level: 'level_4', verified: true, departments: ['Emergency', 'Surgery', 'Radiology'], location: 'Nairobi', county: 'Nairobi', country: 'Kenya' },
  { id: 'avc', name: 'AMEXAN Virtual Care', type: 'telemedicine', level: 'level_3', verified: true, departments: ['Telemedicine', 'Pharmacy'], location: 'Nairobi', county: 'Nairobi', country: 'Kenya' },
];

const PLATFORM_USERS: SeedClinician[] = [
  { email: 'superadmin@amexan.dev', password: 'Dev123!', name: 'AMEXAN Super Admin', role: 'super_admin', organization: 'AMEXAN Global', license: 'SYS-00001', verification: 'auto_verified' },
  { email: 'architect@amexan.dev', password: 'Dev123!', name: 'Platform Architect', role: 'platform_architect', organization: 'AMEXAN Global', license: 'SYS-00002', verification: 'auto_verified' },
  { email: 'constitution@amexan.dev', password: 'Dev123!', name: 'Constitution Team', role: 'constitution_team', organization: 'AMEXAN Global', license: 'SYS-00003', verification: 'auto_verified' },
  { email: 'knowledge@amexan.dev', password: 'Dev123!', name: 'Medical Knowledge Team', role: 'knowledge_team', organization: 'AMEXAN Global', license: 'SYS-00004', verification: 'auto_verified' },
  { email: 'rules@amexan.dev', password: 'Dev123!', name: 'Rules Engineering', role: 'rules_engineer', organization: 'AMEXAN Global', license: 'SYS-00005', verification: 'auto_verified' },
  { email: 'graph@amexan.dev', password: 'Dev123!', name: 'Graph Engineering', role: 'graph_engineer', organization: 'AMEXAN Global', license: 'SYS-00006', verification: 'auto_verified' },
  { email: 'aisafety@amexan.dev', password: 'Dev123!', name: 'AI Safety Team', role: 'ai_safety', organization: 'AMEXAN Global', license: 'SYS-00007', verification: 'auto_verified' },
  { email: 'docs@amexan.dev', password: 'Dev123!', name: 'Documentation Team', role: 'documentation', organization: 'AMEXAN Global', license: 'SYS-00008', verification: 'auto_verified' },
  { email: 'qa@amexan.dev', password: 'Dev123!', name: 'Clinical QA Team', role: 'qa', organization: 'AMEXAN Global', license: 'SYS-00009', verification: 'auto_verified' },
  { email: 'ux@amexan.dev', password: 'Dev123!', name: 'UX Research', role: 'ux_research', organization: 'AMEXAN Global', license: 'SYS-00010', verification: 'auto_verified' },
  { email: 'success@amexan.dev', password: 'Dev123!', name: 'Customer Success', role: 'customer_success', organization: 'AMEXAN Global', license: 'SYS-00011', verification: 'auto_verified' },
  { email: 'finance@amexan.dev', password: 'Dev123!', name: 'Finance', role: 'finance', organization: 'AMEXAN Global', license: 'SYS-00012', verification: 'auto_verified' },
  { email: 'marketplace@amexan.dev', password: 'Dev123!', name: 'Marketplace Review', role: 'marketplace_review', organization: 'AMEXAN Global', license: 'SYS-00013', verification: 'auto_verified' },
  { email: 'deploy@amexan.dev', password: 'Dev123!', name: 'Deployment Engineer', role: 'deployment', organization: 'AMEXAN Global', license: 'SYS-00014', verification: 'auto_verified' },
];

const CLINICIANS: SeedClinician[] = [
  { email: 'consultant.med@kisii.dev', password: 'Dev123!', name: 'Dr. Consultant Physician', role: 'consultant_physician', organization: 'ktrh', license: 'KMPDC-TEST-00001', specialty: 'Internal Medicine', verification: 'auto_verified' },
  { email: 'mo@kisii.dev', password: 'Dev123!', name: 'Dr. Medical Officer', role: 'medical_officer', organization: 'ktrh', license: 'KMPDC-TEST-00002', verification: 'auto_verified' },
  { email: 'intern@kisii.dev', password: 'Dev123!', name: 'Dr. Intern', role: 'intern', organization: 'ktrh', license: 'KMPDC-TEST-00003', verification: 'auto_verified' },
  { email: 'resident@kisii.dev', password: 'Dev123!', name: 'Dr. Resident', role: 'resident', organization: 'ktrh', license: 'KMPDC-TEST-00004', verification: 'auto_verified' },
  { email: 'surgery@kisii.dev', password: 'Dev123!', name: 'Dr. Surgeon', role: 'consultant_surgeon', organization: 'ktrh', license: 'KMPDC-TEST-00005', specialty: 'General Surgery', verification: 'auto_verified' },
  { email: 'paeds@kisii.dev', password: 'Dev123!', name: 'Dr. Pediatrician', role: 'pediatrician', organization: 'ktrh', license: 'KMPDC-TEST-00006', specialty: 'Pediatrics', verification: 'auto_verified' },
  { email: 'obgyn@kisii.dev', password: 'Dev123!', name: 'Dr. Obstetrician', role: 'obstetrician', organization: 'ktrh', license: 'KMPDC-TEST-00007', specialty: 'Obstetrics & Gynecology', verification: 'auto_verified' },
  { email: 'psych@kisii.dev', password: 'Dev123!', name: 'Dr. Psychiatrist', role: 'psychiatrist', organization: 'ktrh', license: 'KMPDC-TEST-00008', specialty: 'Psychiatry', verification: 'auto_verified' },
  { email: 'anaesthesia@kisii.dev', password: 'Dev123!', name: 'Dr. Anaesthesiologist', role: 'anaesthesiologist', organization: 'ktrh', license: 'KMPDC-TEST-00009', verification: 'auto_verified' },
  { email: 'emergency@kisii.dev', password: 'Dev123!', name: 'Dr. Emergency Physician', role: 'emergency_physician', organization: 'ktrh', license: 'KMPDC-TEST-00010', verification: 'auto_verified' },
  { email: 'family@kisii.dev', password: 'Dev123!', name: 'Dr. Family Physician', role: 'family_physician', organization: 'fmc', license: 'KMPDC-TEST-00011', verification: 'auto_verified' },
  { email: 'radiology@kisii.dev', password: 'Dev123!', name: 'Dr. Radiologist', role: 'radiologist', organization: 'ktrh', license: 'KMPDC-TEST-00012', specialty: 'Radiology', verification: 'auto_verified' },
  { email: 'pathology@kisii.dev', password: 'Dev123!', name: 'Dr. Pathologist', role: 'pathologist', organization: 'ktrh', license: 'KMPDC-TEST-00013', verification: 'auto_verified' },
];

const NURSES: SeedNurse[] = [
  { email: 'nurse@kisii.dev', password: 'Dev123!', name: 'Staff Nurse', role: 'nurse', organization: 'ktrh', license: 'NCK-TEST-00001', verification: 'auto_verified' },
  { email: 'snurse@kisii.dev', password: 'Dev123!', name: 'Senior Nurse', role: 'senior_nurse', organization: 'ktrh', license: 'NCK-TEST-00002', verification: 'auto_verified' },
  { email: 'icu.nurse@kisii.dev', password: 'Dev123!', name: 'ICU Nurse', role: 'icu_nurse', organization: 'ktrh', license: 'NCK-TEST-00003', verification: 'auto_verified' },
  { email: 'theatre@kisii.dev', password: 'Dev123!', name: 'Theatre Nurse', role: 'theatre_nurse', organization: 'ktrh', license: 'NCK-TEST-00004', verification: 'auto_verified' },
];

const ALLIED_HEALTH: SeedClinician[] = [
  { email: 'lab@kisii.dev', password: 'Dev123!', name: 'Laboratory Scientist', role: 'lab_scientist', organization: 'ktrh', license: 'KMLTTB-TEST-00001', verification: 'auto_verified' },
  { email: 'labtech@kisii.dev', password: 'Dev123!', name: 'Lab Technician', role: 'lab_technician', organization: 'ktrh', license: 'KMLTTB-TEST-00002', verification: 'auto_verified' },
  { email: 'pharmacy@kisii.dev', password: 'Dev123!', name: 'Pharmacist', role: 'pharmacist', organization: 'ktrh', license: 'PPB-TEST-00001', verification: 'auto_verified' },
  { email: 'nutrition@kisii.dev', password: 'Dev123!', name: 'Nutritionist', role: 'nutritionist', organization: 'ktrh', license: 'KNDI-TEST-00001', verification: 'auto_verified' },
  { email: 'physio@kisii.dev', password: 'Dev123!', name: 'Physiotherapist', role: 'physiotherapist', organization: 'ktrh', license: 'KPTRB-TEST-00001', verification: 'auto_verified' },
  { email: 'ot@kisii.dev', password: 'Dev123!', name: 'Occupational Therapist', role: 'occupational_therapist', organization: 'ktrh', license: 'KOTRB-TEST-00001', verification: 'auto_verified' },
  { email: 'speech@kisii.dev', password: 'Dev123!', name: 'Speech Therapist', role: 'speech_therapist', organization: 'ktrh', license: 'KSTRB-TEST-00001', verification: 'auto_verified' },
  { email: 'social@kisii.dev', password: 'Dev123!', name: 'Social Worker', role: 'social_worker', organization: 'ktrh', license: 'KSWB-TEST-00001', verification: 'auto_verified' },
];

const STAFF: SeedClinician[] = [
  { email: 'reception@kisii.dev', password: 'Dev123!', name: 'Receptionist', role: 'receptionist', organization: 'ktrh', license: '', verification: 'auto_verified' },
  { email: 'cashier@kisii.dev', password: 'Dev123!', name: 'Cashier', role: 'cashier', organization: 'ktrh', license: '', verification: 'auto_verified' },
  { email: 'admin@kisii.dev', password: 'Dev123!', name: 'Facility Administrator', role: 'facility_administrator', organization: 'ktrh', license: '', verification: 'auto_verified' },
];

const PATIENTS: SeedPatient[] = [
  { email: 'patient.healthy.male@demo.dev', name: 'John Mwangi', context: 'Adult male - Healthy', age: 32, sex: 'male', conditions: [], verificationLevel: 2, hasHistory: false },
  { email: 'patient.healthy.female@demo.dev', name: 'Sarah Wanjiku', context: 'Adult female - Healthy', age: 27, sex: 'female', conditions: [], verificationLevel: 2, hasHistory: false },
  { email: 'patient.pregnant@demo.dev', name: 'Mary Wanjiku', context: 'Pregnant - 12 weeks', age: 28, sex: 'female', conditions: ['pregnancy'], pregnant: true, weeksPregnant: 12, verificationLevel: 2, hasHistory: true },
  { email: 'patient.term@demo.dev', name: 'Jane Akinyi', context: 'Pregnant - 39 weeks', age: 31, sex: 'female', conditions: ['pregnancy'], pregnant: true, weeksPregnant: 39, verificationLevel: 3, hasHistory: true },
  { email: 'patient.postpartum@demo.dev', name: 'Grace Kamau', context: 'Postpartum', age: 26, sex: 'female', conditions: [], verificationLevel: 2, hasHistory: true },
  { email: 'patient.neonate@demo.dev', name: 'Baby Kamau', context: 'Neonate - Day 1', age: 0, sex: 'male', conditions: [], verificationLevel: 1, hasHistory: false },
  { email: 'patient.premature@demo.dev', name: 'Baby Otieno', context: 'Premature neonate - 32 weeks', age: 0, sex: 'male', conditions: ['prematurity'], verificationLevel: 1, hasHistory: false },
  { email: 'patient.infant@demo.dev', name: 'Kevin Otieno', context: 'Infant - 6 months', age: 0, sex: 'male', conditions: [], verificationLevel: 2, hasHistory: true },
  { email: 'patient.toddler@demo.dev', name: 'Amina Hassan', context: 'Toddler - 2 years', age: 2, sex: 'female', conditions: [], verificationLevel: 2, hasHistory: true },
  { email: 'patient.child@demo.dev', name: 'Sarah Chebet', context: 'School child - 8 years', age: 8, sex: 'female', conditions: ['asthma'], verificationLevel: 2, hasHistory: true },
  { email: 'patient.child.healthy@demo.dev', name: 'Peter Kamau', context: 'School child - 10 years, Healthy', age: 10, sex: 'male', conditions: [], verificationLevel: 1, hasHistory: false },
  { email: 'patient.adolescent@demo.dev', name: 'James Kiprop', context: 'Adolescent - 15 years', age: 15, sex: 'male', conditions: [], verificationLevel: 1, hasHistory: false },
  { email: 'patient.adult@demo.dev', name: 'Michael Omondi', context: 'Adult - 45 years', age: 45, sex: 'male', conditions: [], verificationLevel: 2, hasHistory: false },
  { email: 'patient.hiv@demo.dev', name: 'David Ochieng', context: 'HIV - Stable on ART', age: 42, sex: 'male', conditions: ['hiv'], verificationLevel: 3, hasHistory: true },
  { email: 'patient.tb@demo.dev', name: 'Samuel Mutua', context: 'TB - New diagnosis', age: 38, sex: 'male', conditions: ['tb'], verificationLevel: 2, hasHistory: false },
  { email: 'patient.diabetes@demo.dev', name: 'Peter Njenga', context: 'Diabetes Type 2', age: 55, sex: 'male', conditions: ['diabetes', 'hypertension'], verificationLevel: 3, hasHistory: true },
  { email: 'patient.htn@demo.dev', name: 'Elizabeth Wambui', context: 'Hypertension', age: 60, sex: 'female', conditions: ['hypertension'], verificationLevel: 3, hasHistory: true },
  { email: 'patient.hf@demo.dev', name: 'Joseph Barasa', context: 'Heart Failure', age: 70, sex: 'male', conditions: ['heart failure', 'hypertension'], verificationLevel: 3, hasHistory: true },
  { email: 'patient.ckd@demo.dev', name: 'Alice Nyambura', context: 'CKD Stage 4', age: 48, sex: 'female', conditions: ['ckd', 'hypertension'], verificationLevel: 2, hasHistory: true },
  { email: 'patient.copd@demo.dev', name: 'John Kiplagat', context: 'COPD', age: 65, sex: 'male', conditions: ['copd'], verificationLevel: 2, hasHistory: true },
  { email: 'patient.asthma@demo.dev', name: 'Faith Nyokabi', context: 'Asthma - Moderate Persistent', age: 24, sex: 'female', conditions: ['asthma'], verificationLevel: 2, hasHistory: true },
  { email: 'patient.cancer@demo.dev', name: 'Robert Onyango', context: 'Cancer - Newly diagnosed', age: 52, sex: 'male', conditions: ['cancer'], verificationLevel: 2, hasHistory: false },
  { email: 'patient.psych@demo.dev', name: 'Esther Wanjala', context: 'Depression', age: 35, sex: 'female', conditions: ['depression', 'mental health'], verificationLevel: 1, hasHistory: true },
  { email: 'patient.trauma@demo.dev', name: 'Kevin Mwangi', context: 'Polytrauma - MVA', age: 29, sex: 'male', conditions: [], verificationLevel: 1, hasHistory: false },
  { email: 'patient.icu@demo.dev', name: 'Patrick Omondi', context: 'ICU - Septic Shock', age: 50, sex: 'male', conditions: ['sepsis', 'respiratory failure'], verificationLevel: 2, hasHistory: true },
  { email: 'patient.elderly@demo.dev', name: 'Grace Nyambura', context: 'Elderly - 80 years', age: 80, sex: 'female', conditions: ['hypertension'], verificationLevel: 2, hasHistory: true },
  { email: 'patient.palliative@demo.dev', name: 'Samuel Kioko', context: 'Palliative Care - Advanced Cancer', age: 58, sex: 'male', conditions: ['cancer'], verificationLevel: 3, hasHistory: true },
  { email: 'patient.terminal@demo.dev', name: 'Rose Achieng', context: 'Terminal illness - End stage liver disease', age: 62, sex: 'female', conditions: ['cirrhosis', 'liver failure'], verificationLevel: 3, hasHistory: true },
];

const STUDENTS: SeedStudent[] = [
  { email: 'student@kisii.dev', password: 'Dev123!', name: 'Medical Student Year 4', level: 'year_4', organization: 'ktrh' },
];

const SUBSCRIPTIONS: SeedSubscription[] = [
  { organizationId: 'ktrh', plan: 'enterprise' },
  { organizationId: 'knh', plan: 'enterprise' },
  { organizationId: 'nrb', plan: 'professional' },
  { organizationId: 'akuh', plan: 'enterprise' },
  { organizationId: 'mtrh', plan: 'enterprise' },
  { organizationId: 'fmc', plan: 'starter' },
  { organizationId: 'nhc', plan: 'ngo' },
  { organizationId: 'fdea', plan: 'professional' },
  { organizationId: 'avc', plan: 'professional' },
];

const VERIFICATION_STATES: SeedVerificationState[] = [
  { email: 'patient.healthy.male@demo.dev', state: 'email_verified' },
  { email: 'patient.healthy.female@demo.dev', state: 'email_verified' },
  { email: 'patient.pregnant@demo.dev', state: 'email_verified' },
  { email: 'patient.hiv@demo.dev', state: 'facility_approved' },
  { email: 'patient.diabetes@demo.dev', state: 'facility_approved' },
  { email: 'patient.htn@demo.dev', state: 'facility_approved' },
  { email: 'patient.hf@demo.dev', state: 'facility_approved' },
  { email: 'patient.cancer@demo.dev', state: 'license_pending' },
  { email: 'patient.psych@demo.dev', state: 'email_verified' },
  { email: 'patient.palliative@demo.dev', state: 'super_verified' },
  { email: 'patient.icu@demo.dev', state: 'facility_approved' },
  { email: 'patient.terminal@demo.dev', state: 'super_verified' },
  { email: 'consultant.med@kisii.dev', state: 'super_verified' },
  { email: 'intern@kisii.dev', state: 'facility_pending' },
  { email: 'student@kisii.dev', state: 'email_verified' },
  { email: 'mo@kisii.dev', state: 'email_verified' },
  { email: 'resident@kisii.dev', state: 'identity_pending' },
  { email: 'surgery@kisii.dev', state: 'phone_verified' },
  { email: 'lab@kisii.dev', state: 'license_pending' },
  { email: 'reception@kisii.dev', state: 'pending_email' },
  { email: 'admin@kisii.dev', state: 'facility_approved' },
  { email: 'superadmin@amexan.dev', state: 'super_verified' },
  { email: 'architect@amexan.dev', state: 'super_verified' },
  { email: 'aisafety@amexan.dev', state: 'super_verified' },
];

// ── API Tokens ─────────────────────────────────────────────────────────────────
export interface SeedApiToken {
  name: string;
  token: string;
  scopes: string[];
  organizationId: string;
  type: 'fhir' | 'hl7' | 'dicom' | 'pacs' | 'lis' | 'insurance' | 'ai' | 'marketplace';
}

export const API_TOKENS: SeedApiToken[] = [
  { name: 'FHIR Integration - KTRH', token: 'amx_fhir_ktrh_dev_001', scopes: ['patient.read', 'encounter.read', 'observation.read', 'condition.read', 'medication.read'], organizationId: 'ktrh', type: 'fhir' },
  { name: 'HL7 Interface - KNH', token: 'amx_hl7_knh_dev_002', scopes: ['adt.send', 'orm.send', 'oru.receive', 'dfn.send'], organizationId: 'knh', type: 'hl7' },
  { name: 'DICOM Gateway - AKUH', token: 'amx_dicom_akuh_dev_003', scopes: ['modality.read', 'study.read', 'series.read', 'instance.read', 'store'], organizationId: 'akuh', type: 'dicom' },
  { name: 'PACS Viewer - KTRH', token: 'amx_pacs_ktrh_dev_004', scopes: ['study.read', 'series.read', 'wado.read', 'stow.write'], organizationId: 'ktrh', type: 'pacs' },
  { name: 'LIS Integration - NRB', token: 'amx_lis_nrb_dev_005', scopes: ['order.create', 'order.read', 'result.read', 'result.write'], organizationId: 'nrb', type: 'lis' },
  { name: 'Insurance Claims - NHIF', token: 'amx_ins_nhif_dev_006', scopes: ['claim.create', 'claim.read', 'eligibility.check', 'authorization.read'], organizationId: 'ktrh', type: 'insurance' },
  { name: 'AI Diagnosis Engine', token: 'amx_ai_diag_dev_007', scopes: ['patient.read', 'encounter.read', 'diagnosis.read', 'recommendation.create'], organizationId: 'avc', type: 'ai' },
  { name: 'Marketplace API', token: 'amx_mkt_global_dev_008', scopes: ['listing.read', 'listing.create', 'order.read', 'order.create', 'review.read'], organizationId: 'amexan', type: 'marketplace' },
];

// ── Demo Clinical Cases ────────────────────────────────────────────────────────
export interface SeedDemoCase {
  id: string;
  title: string;
  chiefComplaint: string;
  patientEmail: string;
  clinicianEmail: string;
  description: string;
  icd10: string;
  category: 'medical' | 'surgical' | 'pediatric' | 'obstetric' | 'psychiatric' | 'emergency';
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
}

export const DEMO_CLINICAL_CASES: SeedDemoCase[] = [
  { id: 'case_chest_pain', title: 'Chest Pain - ACS Workup', chiefComplaint: 'Retrosternal chest pain radiating to left arm', patientEmail: 'patient.htn@demo.dev', clinicianEmail: 'consultant.med@kisii.dev', description: '60yo female with HTN presents with acute onset retrosternal chest pain radiating to left arm with nausea. Rule out ACS.', icd10: 'I20.0', category: 'medical', severity: 'severe' },
  { id: 'case_acute_abdomen', title: 'Acute Abdomen - Appendicitis', chiefComplaint: 'Right iliac fossa pain', patientEmail: 'patient.adult@demo.dev', clinicianEmail: 'surgery@kisii.dev', description: '45yo male with 24h history of central abdominal pain migrating to RIF, with nausea, anorexia and low-grade fever.', icd10: 'K35.8', category: 'surgical', severity: 'moderate' },
  { id: 'case_stroke', title: 'Acute Stroke - Left sided weakness', chiefComplaint: 'Sudden onset left sided weakness', patientEmail: 'patient.elderly@demo.dev', clinicianEmail: 'emergency@kisii.dev', description: '80yo female with HTN presents with sudden onset left sided hemiparesis, facial droop, and slurred speech. Onset 2 hours ago.', icd10: 'I63.9', category: 'medical', severity: 'critical' },
  { id: 'case_pneumonia', title: 'Community Acquired Pneumonia', chiefComplaint: 'Cough with productive sputum and fever', patientEmail: 'patient.copd@demo.dev', clinicianEmail: 'mo@kisii.dev', description: '65yo male with COPD presents with 5-day history of productive cough, high-grade fever, and right-sided pleuritic chest pain.', icd10: 'J18.9', category: 'medical', severity: 'moderate' },
  { id: 'case_asthma_exacerbation', title: 'Acute Asthma Exacerbation', chiefComplaint: 'Severe shortness of breath and wheezing', patientEmail: 'patient.asthma@demo.dev', clinicianEmail: 'emergency@kisii.dev', description: '24yo female with known asthma presents with acute onset severe SOB, wheezing, and inability to speak full sentences.', icd10: 'J45.9', category: 'medical', severity: 'severe' },
  { id: 'case_copd_exacerbation', title: 'COPD Exacerbation', chiefComplaint: 'Increased SOB and sputum purulence', patientEmail: 'patient.copd@demo.dev', clinicianEmail: 'mo@kisii.dev', description: '65yo male with known COPD presents with increased dyspnoea, purulent sputum, and wheezing for 3 days.', icd10: 'J44.1', category: 'medical', severity: 'moderate' },
  { id: 'case_heart_failure', title: 'Acute Decompensated Heart Failure', chiefComplaint: 'Severe SOB and bilateral leg swelling', patientEmail: 'patient.hf@demo.dev', clinicianEmail: 'consultant.med@kisii.dev', description: '70yo male with HFrEF presents with worsening SOB, orthopnoea, PND, bilateral pedal oedema, and crackles on auscultation.', icd10: 'I50.9', category: 'medical', severity: 'severe' },
  { id: 'case_sepsis', title: 'Septic Shock - UTI Source', chiefComplaint: 'Fever, confusion, low blood pressure', patientEmail: 'patient.icu@demo.dev', clinicianEmail: 'icu.nurse@kisii.dev', description: '50yo male presents with fever, hypotension, confusion, and oliguria. Suspected urosepsis.', icd10: 'A41.9', category: 'medical', severity: 'critical' },
  { id: 'case_neonatal_jaundice', title: 'Neonatal Jaundice', chiefComplaint: 'Yellow discoloration of skin and eyes', patientEmail: 'patient.neonate@demo.dev', clinicianEmail: 'paeds@kisii.dev', description: 'Day 1 neonate with visible jaundice. Mother blood group O+, baby A+. Concern for ABO incompatibility.', icd10: 'P59.9', category: 'pediatric', severity: 'moderate' },
  { id: 'case_neonatal_sepsis', title: 'Neonatal Sepsis', chiefComplaint: 'Fever, poor feeding, lethargy', patientEmail: 'patient.premature@demo.dev', clinicianEmail: 'paeds@kisii.dev', description: '32-week premature neonate with fever, poor feeding, lethargy, and grunting respiration.', icd10: 'P36.9', category: 'pediatric', severity: 'critical' },
  { id: 'case_pregnancy_pet', title: 'Pregnancy with Pre-eclampsia', chiefComplaint: 'Headache, visual disturbances, BP 160/110', patientEmail: 'patient.term@demo.dev', clinicianEmail: 'obgyn@kisii.dev', description: '31yo G1P0 at 39 weeks presents with severe headache, blurred vision, and BP 160/110. Urine protein 3+.', icd10: 'O14.1', category: 'obstetric', severity: 'critical' },
  { id: 'case_pph', title: 'Postpartum Haemorrhage', chiefComplaint: 'Heavy vaginal bleeding post-delivery', patientEmail: 'patient.postpartum@demo.dev', clinicianEmail: 'obgyn@kisii.dev', description: '26yo female 2h post normal vaginal delivery with heavy vaginal bleeding, tachycardia, and hypotension.', icd10: 'O72.1', category: 'obstetric', severity: 'critical' },
  { id: 'case_eclampsia', title: 'Eclampsia', chiefComplaint: 'Generalized tonic-clonic seizure', patientEmail: 'patient.term@demo.dev', clinicianEmail: 'obgyn@kisii.dev', description: '31yo at 39 weeks with known PET develops generalized tonic-clonic seizure in labour ward.', icd10: 'O15.0', category: 'obstetric', severity: 'critical' },
  { id: 'case_pediatric_malaria', title: 'Severe Pediatric Malaria', chiefComplaint: 'High fever, vomiting, lethargy', patientEmail: 'patient.child@demo.dev', clinicianEmail: 'paeds@kisii.dev', description: '8yo female with 3-day history of high fever, vomiting, general malaise. From malaria-endemic area.', icd10: 'B50.9', category: 'pediatric', severity: 'severe' },
  { id: 'case_tuberculosis', title: 'Pulmonary Tuberculosis', chiefComplaint: 'Chronic cough, weight loss, night sweats', patientEmail: 'patient.tb@demo.dev', clinicianEmail: 'mo@kisii.dev', description: '38yo male with 3-week history of productive cough, haemoptysis, weight loss, and night sweats. Contact with TB patient.', icd10: 'A15.0', category: 'medical', severity: 'moderate' },
  { id: 'case_hiv_opp', title: 'HIV with Opportunistic Infection', chiefComplaint: 'Fever, cough, oral thrush, weight loss', patientEmail: 'patient.hiv@demo.dev', clinicianEmail: 'mo@kisii.dev', description: '42yo male known HIV on ART presents with fever, cough, oral candidiasis, and 5kg weight loss over 1 month.', icd10: 'B24', category: 'medical', severity: 'severe' },
  { id: 'case_dka', title: 'Diabetic Ketoacidosis', chiefComplaint: 'Vomiting, abdominal pain, deep breathing', patientEmail: 'patient.diabetes@demo.dev', clinicianEmail: 'emergency@kisii.dev', description: '55yo male with DM2 presents with nausea, vomiting, abdominal pain, Kussmaul breathing, and altered sensorium.', icd10: 'E11.1', category: 'medical', severity: 'critical' },
  { id: 'case_ckd_uremia', title: 'CKD with Uremic Symptoms', chiefComplaint: 'Nausea, fatigue, decreased urine output', patientEmail: 'patient.ckd@demo.dev', clinicianEmail: 'consultant.med@kisii.dev', description: '48yo female with CKD Stage 4 presents with nausea, anorexia, fatigue, metallic taste, and oliguria.', icd10: 'N18.4', category: 'medical', severity: 'moderate' },
  { id: 'case_polytrauma', title: 'Polytrauma - Road Traffic Accident', chiefComplaint: 'Multiple injuries after high-speed MVA', patientEmail: 'patient.trauma@demo.dev', clinicianEmail: 'emergency@kisii.dev', description: '29yo male involved in high-speed MVA. GCS 13, open femur fracture, rib fractures, abdominal tenderness. ATLS primary survey.', icd10: 'T07', category: 'emergency', severity: 'critical' },
  { id: 'case_burns', title: 'Severe Burns', chiefComplaint: 'Thermal burns to chest and arms', patientEmail: 'patient.trauma@demo.dev', clinicianEmail: 'surgery@kisii.dev', description: '29yo male with 30% TBSA burns to anterior chest and bilateral upper limbs from house fire. Second and third degree.', icd10: 'T31.3', category: 'emergency', severity: 'severe' },
  { id: 'case_snake_bite', title: 'Snake Envenomation', chiefComplaint: 'Snake bite to right foot with swelling', patientEmail: 'patient.adult@demo.dev', clinicianEmail: 'emergency@kisii.dev', description: '45yo male bitten by snake on right foot 4h ago. Progressive swelling, pain, and bleeding from bite site.', icd10: 'T63.0', category: 'emergency', severity: 'severe' },
  { id: 'case_poisoning', title: 'Organophosphate Poisoning', chiefComplaint: 'Excessive salivation, sweating, small pupils', patientEmail: 'patient.adult@demo.dev', clinicianEmail: 'emergency@kisii.dev', description: '45yo male with excessive salivation, lacrimation, sweating, miosis, and muscle fasciculations. History of pesticide exposure.', icd10: 'T60.0', category: 'emergency', severity: 'critical' },
  { id: 'case_psychiatric_emergency', title: 'Acute Psychotic Episode', chiefComplaint: 'Agitation, paranoia, auditory hallucinations', patientEmail: 'patient.psych@demo.dev', clinicianEmail: 'psych@kisii.dev', description: '35yo female with known depression presents with acute agitation, paranoid delusions, command auditory hallucinations, and poor self-care.', icd10: 'F23', category: 'psychiatric', severity: 'severe' },
  { id: 'case_surgical_abdomen', title: 'Perforated Peptic Ulcer', chiefComplaint: 'Sudden severe epigastric pain, board-like rigidity', patientEmail: 'patient.diabetes@demo.dev', clinicianEmail: 'surgery@kisii.dev', description: '55yo male with known PUD presents with sudden onset severe epigastric pain, board-like abdominal rigidity, and free air under diaphragm.', icd10: 'K25.1', category: 'surgical', severity: 'critical' },
  { id: 'case_breast_lump', title: 'Breast Lump - Suspected Malignancy', chiefComplaint: 'Painless lump in left breast', patientEmail: 'patient.healthy.female@demo.dev', clinicianEmail: 'surgery@kisii.dev', description: '27yo female with 2cm firm, irregular, non-tender lump in upper outer quadrant of left breast. No nipple discharge.', icd10: 'N63', category: 'surgical', severity: 'moderate' },
  { id: 'case_thyroid_swelling', title: 'Thyroid Swelling - Multinodular Goitre', chiefComplaint: 'Anterior neck swelling, difficulty swallowing', patientEmail: 'patient.adult@demo.dev', clinicianEmail: 'surgery@kisii.dev', description: '45yo male with gradually enlarging anterior neck swelling over 2 years. Now with mild dysphagia and voice change.', icd10: 'E04.2', category: 'surgical', severity: 'moderate' },
  { id: 'case_lower_gi_bleed', title: 'Lower GI Bleed', chiefComplaint: 'Passing fresh blood per rectum', patientEmail: 'patient.elderly@demo.dev', clinicianEmail: 'surgery@kisii.dev', description: '80yo female with known diverticulosis presents with painless fresh red blood per rectum. Haemodynamically stable.', icd10: 'K92.1', category: 'surgical', severity: 'moderate' },
  { id: 'case_upper_gi_bleed', title: 'Upper GI Bleed - Haematemesis', chiefComplaint: 'Vomiting blood and melaena', patientEmail: 'patient.diabetes@demo.dev', clinicianEmail: 'consultant.med@kisii.dev', description: '55yo male on NSAIDs presents with haematemesis (coffee ground) and melaena. Tachycardic, Hb 8.0.', icd10: 'K92.0', category: 'medical', severity: 'severe' },
  { id: 'case_acute_pancreatitis', title: 'Acute Pancreatitis', chiefComplaint: 'Severe epigastric pain radiating to back', patientEmail: 'patient.adult@demo.dev', clinicianEmail: 'surgery@kisii.dev', description: '45yo male with history of gallstones and alcohol use presents with severe epigastric pain radiating to back, nausea, and vomiting.', icd10: 'K85.9', category: 'surgical', severity: 'severe' },
];

export function getDeveloperSeedConfig(): SeedConfig {
  return {
    profile: 'developer',
    organizations: ORGANIZATIONS,
    clinicians: [...PLATFORM_USERS, ...CLINICIANS, ...ALLIED_HEALTH, ...STAFF],
    nurses: NURSES,
    patients: PATIENTS,
    students: STUDENTS,
    subscriptions: SUBSCRIPTIONS,
    verificationStates: VERIFICATION_STATES,
  };
}

export function getMinimalSeedConfig(): SeedConfig {
  return {
    profile: 'minimal',
    organizations: [ORGANIZATIONS[0]],
    clinicians: CLINICIANS.slice(0, 3),
    nurses: NURSES.slice(0, 1),
    patients: PATIENTS.slice(0, 5),
    students: [],
    subscriptions: SUBSCRIPTIONS.slice(0, 1),
    verificationStates: VERIFICATION_STATES.slice(0, 3),
  };
}

export function getTeachingHospitalSeedConfig(): SeedConfig {
  return {
    profile: 'teaching',
    organizations: ORGANIZATIONS.filter(o => o.type === 'teaching_hospital'),
    clinicians: [...CLINICIANS, ...STUDENTS.map(s => ({ email: s.email, password: s.password, name: s.name, role: 'medical_student' as SeedRole, organization: s.organization, license: '', verification: 'pending' as const }))],
    nurses: NURSES,
    patients: PATIENTS.filter(p => ['pregnancy', 'newborn', 'child', 'asthma', 'diabetes', 'hypertension'].some(c => p.conditions.some(pc => pc.includes(c)))),
    students: STUDENTS,
    subscriptions: SUBSCRIPTIONS.filter(s => ['ktrh', 'mtrh'].includes(s.organizationId)),
    verificationStates: VERIFICATION_STATES,
  };
}

export function getSeedProfileByEmail(email: string): SeedProfile | undefined {
  const config = getDeveloperSeedConfig();
  const allClinicians = config.clinicians;
  const nurse = config.nurses.find(n => n.email === email);
  const student = config.students.find(s => s.email === email);

  if (nurse) return { ...nurse, role: nurse.role, verification: nurse.verification, organization: nurse.organization };
  if (student) return { email: student.email, password: student.password, name: student.name, role: 'medical_student', organization: student.organization, verification: 'auto_verified' };

  const clinician = allClinicians.find(c => c.email === email);
  if (clinician) return { ...clinician, role: clinician.role, verification: clinician.verification };

  const patient = config.patients.find(p => p.email === email);
  if (patient) {
    return {
      name: patient.name,
      email: patient.email,
      password: 'Patient123!',
      role: 'patient',
      organization: '',
      verification: patient.verificationLevel >= 3 ? 'auto_verified' : 'pending',
      patientContext: {
        context: patient.context,
        age: patient.age,
        sex: patient.sex,
        conditions: patient.conditions,
        pregnant: patient.pregnant,
        weeksPregnant: patient.weeksPregnant,
        verificationLevel: patient.verificationLevel,
      },
    };
  }

  return undefined;
}

export function getAllSeedEmails(): string[] {
  const config = getDeveloperSeedConfig();
  return [
    ...config.clinicians.map(c => c.email),
    ...config.nurses.map(n => n.email),
    ...config.patients.map(p => p.email),
    ...config.students.map(s => s.email),
  ];
}

export function getDemoCasePatients(): string[] {
  return [
    'patient.healthy.male@demo.dev',
    'patient.healthy.female@demo.dev',
    'patient.pregnant@demo.dev',
    'patient.term@demo.dev',
    'patient.diabetes@demo.dev',
    'patient.htn@demo.dev',
    'patient.hf@demo.dev',
    'patient.hiv@demo.dev',
    'patient.tb@demo.dev',
    'patient.asthma@demo.dev',
    'patient.cancer@demo.dev',
    'patient.psych@demo.dev',
    'patient.trauma@demo.dev',
    'patient.icu@demo.dev',
    'patient.palliative@demo.dev',
    'patient.terminal@demo.dev',
    'patient.adult@demo.dev',
    'patient.elderly@demo.dev',
    'patient.neonate@demo.dev',
    'patient.premature@demo.dev',
    'patient.child@demo.dev',
    'patient.ckd@demo.dev',
    'patient.copd@demo.dev',
  ];
}

export function getAllApiTokenNames(): string[] {
  return API_TOKENS.map(t => t.name);
}

export function getDemoCaseById(id: string): SeedDemoCase | undefined {
  return DEMO_CLINICAL_CASES.find(c => c.id === id);
}

export function getCasesByCategory(category: SeedDemoCase['category']): SeedDemoCase[] {
  return DEMO_CLINICAL_CASES.filter(c => c.category === category);
}
