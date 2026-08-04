// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Constitution — Registration Flow
// Multi-step registration: Identity → Professional → Organization → Assignment
// ═══════════════════════════════════════════════════════════════════════════════

import type {
  AmxUid, Identity, Person, ProfessionalIdentity, Organization,
  Employment, ProfessionalCategory, MedicalSpecialty,
  OrganizationType, OrganizationLevel
} from './types';

// ── Registration Steps ────────────────────────────────────────────────────────

export type RegistrationStep =
  | 'identity'
  | 'professional'
  | 'workspace_choice'
  | 'organization_choice'
  | 'organization_create'
  | 'organization_join'
  | 'department_select'
  | 'assignment'
  | 'complete';

export interface RegistrationState {
  currentStep: RegistrationStep;
  completedSteps: RegistrationStep[];
  data: RegistrationData;
  errors: RegistrationErrors;
  isSubmitting: boolean;
}

export interface RegistrationData {
  // Step 1: Identity
  email: string;
  password: string;
  phone: string;
  fullName: string;
  givenName: string;
  familyName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'undisclosed';
  nationality: string;
  nationalId: string;

  // Step 2: Professional
  categories: ProfessionalCategory[];
  primaryCategory: ProfessionalCategory;
  specialties: MedicalSpecialty[];
  primarySpecialty?: MedicalSpecialty;
  subSpecialty?: string;
  licenseNumber?: string;
  licenseCountry?: string;
  councilNumber?: string;
  councilName?: string;
  administrativeRole?: string;
  university?: string;
  universityYear?: number;
  yearsOfExperience: number | null;
  qualifications: { degree: string; institution: string; year: number; }[];

  // Step 3: Organization
  organizationChoice: 'none' | 'create' | 'join';
  organizationName?: string;
  organizationType?: OrganizationType;
  organizationLevel?: OrganizationLevel;
  organizationRegistrationNumber?: string;
  invitationCode?: string;

  // Step 4: Department
  departmentName?: string;
  departmentType?: string;

  // Step 5: Assignment
  jobTitle?: string;
  employmentType?: string;
}

export interface RegistrationErrors {
  [key: string]: string | undefined;
}

// ── Actor-Driven Field Configuration ─────────────────────────────────────────
// Registration pages are ACTOR-DRIVEN, not form-driven.
// Each profession controls which fields are shown, required, or hidden.
export interface ProfessionFieldConfig {
  /** Show the Specialty / Area of Practice selector */
  showSpecialty: boolean;
  /** Specialty is mandatory for this profession */
  specialtyRequired: boolean;
  /** Show "Professional License Number" */
  showLicenseNumber: boolean;
  /** License number is mandatory */
  licenseRequired: boolean;
  /** Show "Council Registration Number" */
  showCouncilNumber: boolean;
  /** Council number is mandatory */
  councilRequired: boolean;
  /** Show "University" field (for students) */
  showUniversity: boolean;
  /** University is mandatory */
  universityRequired: boolean;
  /** Show "University Year" field (for students) */
  showUniversityYear: boolean;
  /** Show "Years of Experience" */
  showYearsExperience: boolean;
  /** Years of experience is mandatory */
  yearsRequired: boolean;
  /** Show "Qualifications" field */
  showQualifications: boolean;
  /** Qualifications are mandatory */
  qualificationsRequired: boolean;
  /** Show "Administrative Role" field (free text) */
  showAdministrativeRole: boolean;
}

/** Default: nothing shown, nothing required. */
const DEFAULT_CONFIG: ProfessionFieldConfig = {
  showSpecialty: false,
  specialtyRequired: false,
  showLicenseNumber: false,
  licenseRequired: false,
  showCouncilNumber: false,
  councilRequired: false,
  showYearsExperience: false,
  yearsRequired: false,
  showQualifications: false,
  qualificationsRequired: false,
  showAdministrativeRole: false,
  showUniversity: false,
  universityRequired: false,
  showUniversityYear: false,
};

// ── Profession → Field Config ────────────────────────────────────────────────
// Clinical professions that diagnose / treat / prescribe
const CLINICAL_CONFIG: ProfessionFieldConfig = {
  ...DEFAULT_CONFIG,
  showSpecialty: true,
  specialtyRequired: false,
  showLicenseNumber: true,
  licenseRequired: true,
  showCouncilNumber: true,
  councilRequired: true,
  showYearsExperience: true,
  yearsRequired: false,
  showQualifications: true,
  qualificationsRequired: false,
};

// Clinical officers / allied health with optional specialty
const ALLIED_HEALTH_CONFIG: ProfessionFieldConfig = {
  ...DEFAULT_CONFIG,
  showSpecialty: true,
  specialtyRequired: false,
  showLicenseNumber: true,
  licenseRequired: true,
  showCouncilNumber: true,
  councilRequired: true,
  showYearsExperience: true,
  yearsRequired: false,
  showQualifications: true,
  qualificationsRequired: false,
};

// Administrative / non-clinical staff
const ADMIN_CONFIG: ProfessionFieldConfig = {
  ...DEFAULT_CONFIG,
  showYearsExperience: true,
  yearsRequired: false,
  showQualifications: true,
  qualificationsRequired: false,
  showAdministrativeRole: true,
};

// Students
const STUDENT_CONFIG: ProfessionFieldConfig = {
  ...DEFAULT_CONFIG,
  showSpecialty: true,
  specialtyRequired: false,
  showUniversity: true,
  universityRequired: false,
  showUniversityYear: false,
  showYearsExperience: true,
  yearsRequired: false,
  showQualifications: true,
  qualificationsRequired: false,
};

/**
 * Profession category → field configuration.
 * Professions not listed fall back to DEFAULT_CONFIG (no extra fields).
 */
export const PROFESSION_FIELD_CONFIG: Partial<Record<ProfessionalCategory, ProfessionFieldConfig>> = {
  // ── Clinical (specialty required) ──
  medical_doctor: { ...CLINICAL_CONFIG, specialtyRequired: true },
  dentist: { ...CLINICAL_CONFIG, specialtyRequired: true },
  clinical_officer: { ...CLINICAL_CONFIG, specialtyRequired: true },
  physiotherapist: { ...ALLIED_HEALTH_CONFIG, specialtyRequired: true },
  occupational_therapist: { ...ALLIED_HEALTH_CONFIG, specialtyRequired: true },
  nutritionist: { ...ALLIED_HEALTH_CONFIG, specialtyRequired: true },
  social_worker: { ...ALLIED_HEALTH_CONFIG, specialtyRequired: true },
   psychologist: { ...ALLIED_HEALTH_CONFIG, specialtyRequired: true },

  // ── Nursing / Midwifery (specialty optional) ──
  nurse: CLINICAL_CONFIG,
  midwife: CLINICAL_CONFIG,
  medical_student: STUDENT_CONFIG,
  nursing_student: STUDENT_CONFIG,

  // ── Lab / Radio ──
  lab_technologist: { ...ALLIED_HEALTH_CONFIG, showSpecialty: true, specialtyRequired: false, showLicenseNumber: true, licenseRequired: true, showCouncilNumber: true, councilRequired: true },
  radiographer: ALLIED_HEALTH_CONFIG,

  // ── Pharmacy ──
  pharmacist: ALLIED_HEALTH_CONFIG,

  // ── Administration (NO specialty, NO license) ──
  administrator: ADMIN_CONFIG,
  it_staff: ADMIN_CONFIG,
  finance_staff: ADMIN_CONFIG,
  hr_staff: ADMIN_CONFIG,
  receptionist: ADMIN_CONFIG,
  records_officer: ADMIN_CONFIG,
  facility_admin: ADMIN_CONFIG,
  super_admin: { ...DEFAULT_CONFIG, showYearsExperience: false, showQualifications: false },

  // ── Patient / Guardian (no professional fields) ──
  patient: DEFAULT_CONFIG,
  guardian: DEFAULT_CONFIG,

  // ── Research / Education ──
  researcher: { ...ALLIED_HEALTH_CONFIG, showSpecialty: false, specialtyRequired: false },
  educator: { ...ALLIED_HEALTH_CONFIG, showSpecialty: false, specialtyRequired: false },

  // ── Insurance / Supplier ──
  insurance_officer: ADMIN_CONFIG,
  supplier: ADMIN_CONFIG,
};

/** Get the field configuration for a given professional category. */
export function getProfessionFieldConfig(category: ProfessionalCategory | string | undefined): ProfessionFieldConfig {
  if (!category) return DEFAULT_CONFIG;
  return PROFESSION_FIELD_CONFIG[category as ProfessionalCategory] ?? DEFAULT_CONFIG;
}

/** True if the profession is clinical (needs specialty). */
export function isClinicalProfession(category: ProfessionalCategory | string | undefined): boolean {
  if (!category) return false;
  return ['medical_doctor', 'dentist', 'clinical_officer', 'nurse', 'midwife',
    'physiotherapist', 'occupational_therapist', 'nutritionist', 'social_worker',
    'psychologist', 'pharmacist', 'lab_technologist', 'radiographer']
    .includes(category as ProfessionalCategory);
}

// ── Validation ────────────────────────────────────────────────────────────────

export function validateIdentityStep(data: RegistrationData): RegistrationErrors {
  const errors: RegistrationErrors = {};
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Valid email is required';
  if (!data.password || data.password.length < 8) errors.password = 'Password must be at least 8 characters';
  if (!data.phone || data.phone.length < 8) errors.phone = 'Phone number is required';
  if (!data.fullName) errors.fullName = 'Full name is required';
  if (!data.givenName) errors.givenName = 'Given name is required';
  if (!data.familyName) errors.familyName = 'Family name is required';
  if (!data.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
  if (!data.nationalId) errors.nationalId = 'National ID is required';
  if (!data.nationality) errors.nationality = 'Nationality is required';
  return errors;
}

export function validateProfessionalStep(data: RegistrationData): RegistrationErrors {
  const errors: RegistrationErrors = {};
  if (data.categories.length === 0) errors.categories = 'At least one professional category is required';
  if (!data.primaryCategory) errors.primaryCategory = 'Primary category is required';

  const config = getProfessionFieldConfig(data.primaryCategory);

  if (config.showSpecialty && config.specialtyRequired && !data.primarySpecialty) {
    errors.primarySpecialty = 'Please select a specialty';
  }
  if (config.showLicenseNumber && config.licenseRequired && !data.licenseNumber) {
    errors.licenseNumber = 'License number is required';
  }
  if (config.showCouncilNumber && config.councilRequired && !data.councilNumber) {
    errors.councilNumber = 'Council registration number is required';
  }
  if (config.showUniversity && config.universityRequired && !data.university) {
    errors.university = 'University is required';
  }
  if (data.yearsOfExperience !== null && data.yearsOfExperience < 0) {
    errors.yearsOfExperience = 'Years of experience cannot be negative';
  }
  return errors;
}

export function validateOrganizationCreateStep(data: RegistrationData): RegistrationErrors {
  const errors: RegistrationErrors = {};
  if (!data.organizationName) errors.organizationName = 'Organization name is required';
  if (!data.organizationType) errors.organizationType = 'Organization type is required';
  if (!data.organizationRegistrationNumber) errors.organizationRegistrationNumber = 'Registration number is required';
  return errors;
}

// ── Step Configuration ────────────────────────────────────────────────────────

export interface StepConfig {
  id: RegistrationStep;
  title: string;
  subtitle: string;
  order: number;
}

export const REGISTRATION_STEPS: StepConfig[] = [
  { id: 'identity', title: 'Create Your Identity', subtitle: 'Your lifelong AMEXAN account', order: 1 },
  { id: 'professional', title: 'Professional Profile', subtitle: 'What you do and your qualifications', order: 2 },
  { id: 'workspace_choice', title: 'Choose Workspace', subtitle: 'Select the organization you are working in', order: 3 },
  { id: 'organization_choice', title: 'Organization', subtitle: 'Work alone or join/create a facility', order: 3 },
  { id: 'organization_create', title: 'Create Facility', subtitle: 'Register your facility', order: 4 },
  { id: 'organization_join', title: 'Join Facility', subtitle: 'Connect to an existing organization', order: 4 },
  { id: 'department_select', title: 'Department', subtitle: 'Choose your department', order: 5 },
  { id: 'assignment', title: 'Role & Schedule', subtitle: 'Your position and work pattern', order: 6 },
  { id: 'complete', title: 'Complete', subtitle: 'You\'re all set!', order: 7 },
];
