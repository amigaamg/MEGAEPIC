import {
  type AmxpId,
  type RegistrationStage,
  type RegistrationState,
  type RegistrationData,
  type RegistrationErrors,
  type AuthMethod,
  type PatientVerificationLevel,
  type PatientAddress,
  type EmergencyContactPerson,
  type VerificationDocument,
  generateAmxpId,
  REGISTRATION_STAGE_LABELS,
} from './types';

export function createRegistrationState(method: RegistrationState['method']): RegistrationState {
  return {
    stage: 0,
    method,
    data: {
      stage1: { phone: '', email: '', authMethod: 'email' },
      stage2: {
        fullName: '', givenName: '', familyName: '', dateOfBirth: '',
        sex: 'undisclosed', nationality: '', preferredLanguage: 'en',
        address: { country: 'Kenya', county: '' },
      },
      stage3: {
        nationalId: '', nationalIdType: '', bloodGroup: '',
        allergies: [], existingConditions: [], currentMedications: [],
        pregnancyStatus: 'unknown',
      },
      stage4: { documents: [], governmentVerified: false, facilityVerified: false },
    },
    errors: {},
    isSubmitting: false,
  };
}

export function validateStage1(data: RegistrationData['stage1']): RegistrationErrors {
  const errors: RegistrationErrors = {};
  if (data.authMethod === 'email') {
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Valid email is required';
    }
  }
  if (data.authMethod === 'phone_otp') {
    if (!data.phone || data.phone.replace(/[\s\-\+\(\)]/g, '').length < 8) {
      errors.phone = 'Valid phone number is required';
    }
  }
  return errors;
}

export function validateStage2(data: RegistrationData['stage2']): RegistrationErrors {
  const errors: RegistrationErrors = {};
  if (!data.fullName) errors.fullName = 'Full name is required';
  if (!data.givenName) errors.givenName = 'Given name / First name is required';
  if (!data.familyName) errors.familyName = 'Family name / Last name is required';
  if (!data.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
  if (data.dateOfBirth) {
    const age = calculateAge(data.dateOfBirth);
    if (age < 0) errors.dateOfBirth = 'Date of birth cannot be in the future';
    if (age > 150) errors.dateOfBirth = 'Please verify the date of birth';
  }
  if (!data.nationality) errors.nationality = 'Nationality is required';
  return errors;
}

export function validateStage3(data: RegistrationData['stage3']): RegistrationErrors {
  const errors: RegistrationErrors = {};
  if (data.existingConditions.some(c => c.trim().length > 0) && !data.bloodGroup) {
    errors.bloodGroup = 'Blood group is recommended when reporting conditions';
  }
  return errors;
}

export function canAdvanceStage(state: RegistrationState): { canAdvance: boolean; errors: RegistrationErrors } {
  let errors: RegistrationErrors = {};
  switch (state.stage) {
    case 0:
      errors = validateStage1(state.data.stage1);
      break;
    case 1:
      errors = validateStage2(state.data.stage2);
      break;
    case 2:
      errors = validateStage3(state.data.stage3);
      break;
    case 3:
      break;
    case 4:
      break;
  }
  return { canAdvance: Object.keys(errors).length === 0, errors };
}

export function getNextStage(current: RegistrationStage): RegistrationStage | null {
  if (current >= 5) return null;
  return (current + 1) as RegistrationStage;
}

export function getStageLabel(stage: RegistrationStage): string {
  return REGISTRATION_STAGE_LABELS[stage] || 'Unknown';
}

export function getStageDescription(stage: RegistrationStage): string {
  const descriptions: Record<RegistrationStage, string> = {
    0: 'Browse health information and educational content anonymously',
    1: 'Quick sign-up with phone or email — under 1 minute',
    2: 'Complete your personal profile with name, DOB, and address',
    3: 'Add medical identifiers, insurance, and existing conditions',
    4: 'Verify your identity through government ID or facility visit',
    5: 'Lifetime trusted record with full ecosystem access',
  };
  return descriptions[stage] || '';
}

export function getStageProgress(stage: RegistrationStage): number {
  return Math.round((stage / 5) * 100);
}

export function generateTempPatientId(): AmxpId {
  return generateAmxpId('temp');
}

export function isRegistrationComplete(stage: RegistrationStage): boolean {
  return stage >= 5;
}

function calculateAge(dateOfBirth: string): number {
  if (!dateOfBirth) return 0;
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export const COUNTRIES = [
  'Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Burundi', 'South Sudan',
  'Ethiopia', 'Somalia', 'DR Congo', 'Nigeria', 'Ghana', 'South Africa',
  'Egypt', 'Morocco', 'Algeria', 'Sudan', 'Libya', 'Tunisia',
  'Zambia', 'Zimbabwe', 'Malawi', 'Mozambique', 'Angola', 'Botswana',
  'Namibia', 'Lesotho', 'Eswatini', 'Mauritius', 'Seychelles',
  'United Kingdom', 'United States', 'Canada', 'India', 'Pakistan',
  'Bangladesh', 'Sri Lanka', 'Nepal', 'Other',
];

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];

export const ID_TYPES = [
  { value: 'national_id', label: 'National ID Card' },
  { value: 'passport', label: 'Passport' },
  { value: 'birth_certificate', label: 'Birth Certificate' },
  { value: 'huduma_namba', label: 'Huduma Namba' },
  { value: 'alien_card', label: 'Alien Card / Refugee ID' },
  { value: 'drivers_license', label: "Driver's License" },
];

export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'sw', label: 'Kiswahili' },
  { value: 'fr', label: 'French' },
  { value: 'ar', label: 'Arabic' },
  { value: 'am', label: 'Amharic' },
  { value: 'lg', label: 'Luganda' },
  { value: 'rw', label: 'Kinyarwanda' },
  { value: 'so', label: 'Somali' },
  { value: 'om', label: 'Oromo' },
  { value: 'zh', label: 'Chinese' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'es', label: 'Spanish' },
];

export const KENYA_COUNTIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi',
  'Machakos', 'Nyeri', 'Meru', 'Kakamega', 'Kisii', 'Kitale', 'Bungoma',
  'Busia', 'Embu', 'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado', 'Kericho',
  'Kiambu', 'Kilifi', 'Kirinyaga', 'Kitui', 'Kwale', 'Laikipia', 'Lamu',
  'Lari', 'Marsabit', 'Migori', 'Muranga', 'Mwingi', 'Nyamira', 'Nyandarua',
  'Narok', 'Siaya', 'Taita Taveta', 'Tana River', 'Trans Nzoia', 'Turkana',
  'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot',
];
