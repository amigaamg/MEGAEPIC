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
  { email: 'patient.healthy@demo.dev', name: 'John Mwangi', context: 'Adult male - Healthy', age: 32, sex: 'male', conditions: [], verificationLevel: 2, hasHistory: false },
  { email: 'patient.pregnant@demo.dev', name: 'Mary Wanjiku', context: 'Pregnant - 12 weeks', age: 28, sex: 'female', conditions: ['pregnancy'], pregnant: true, weeksPregnant: 12, verificationLevel: 2, hasHistory: true },
  { email: 'patient.term@demo.dev', name: 'Jane Akinyi', context: 'Pregnant - 39 weeks', age: 31, sex: 'female', conditions: ['pregnancy'], pregnant: true, weeksPregnant: 39, verificationLevel: 3, hasHistory: true },
  { email: 'patient.postpartum@demo.dev', name: 'Grace Kamau', context: 'Postpartum', age: 26, sex: 'female', conditions: [], verificationLevel: 2, hasHistory: true },
  { email: 'patient.neonate@demo.dev', name: 'Baby Kamau', context: 'Neonate - Day 1', age: 0, sex: 'male', conditions: [], verificationLevel: 1, hasHistory: false },
  { email: 'patient.infant@demo.dev', name: 'Kevin Otieno', context: 'Infant - 6 months', age: 0, sex: 'male', conditions: [], verificationLevel: 2, hasHistory: true },
  { email: 'patient.child@demo.dev', name: 'Sarah Chebet', context: 'School child - 8 years', age: 8, sex: 'female', conditions: ['asthma'], verificationLevel: 2, hasHistory: true },
  { email: 'patient.adolescent@demo.dev', name: 'James Kiprop', context: 'Adolescent - 15 years', age: 15, sex: 'male', conditions: [], verificationLevel: 1, hasHistory: false },
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
  { email: 'patient.elderly@demo.dev', name: 'Grace Nyambura', context: 'Elderly - 80 years', age: 80, sex: 'female', conditions: ['hypertension'], verificationLevel: 2, hasHistory: true },
  { email: 'patient.palliative@demo.dev', name: 'Samuel Kioko', context: 'Palliative Care - Advanced Cancer', age: 58, sex: 'male', conditions: ['cancer'], verificationLevel: 3, hasHistory: true },
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
  { email: 'patient.healthy@demo.dev', state: 'email_verified' },
  { email: 'patient.pregnant@demo.dev', state: 'email_verified' },
  { email: 'patient.hiv@demo.dev', state: 'facility_approved' },
  { email: 'patient.diabetes@demo.dev', state: 'facility_approved' },
  { email: 'patient.htn@demo.dev', state: 'facility_approved' },
  { email: 'patient.hf@demo.dev', state: 'facility_approved' },
  { email: 'patient.cancer@demo.dev', state: 'license_pending' },
  { email: 'patient.psych@demo.dev', state: 'email_verified' },
  { email: 'patient.palliative@demo.dev', state: 'super_verified' },
  { email: 'consultant.med@kisii.dev', state: 'super_verified' },
  { email: 'intern@kisii.dev', state: 'facility_pending' },
  { email: 'student@kisii.dev', state: 'email_verified' },
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
    'patient.healthy@demo.dev',
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
    'patient.palliative@demo.dev',
  ];
}
