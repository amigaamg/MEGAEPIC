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
  councilNumber?: string;
  yearsOfExperience: number;
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

  const needsLicense = ['medical_doctor', 'nurse', 'pharmacist', 'lab_technologist', 'radiographer', 'clinical_officer', 'midwife'];
  if (needsLicense.includes(data.primaryCategory)) {
    if (!data.licenseNumber) errors.licenseNumber = 'License number is required';
    if (!data.councilNumber) errors.councilNumber = 'Council registration number is required';
  }

  if (data.yearsOfExperience < 0) errors.yearsOfExperience = 'Years of experience is required';
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
