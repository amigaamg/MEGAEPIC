// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN HMIS Constitution — Book III: Universal Identity
// Every person — patient or clinician — is identified through multiple linked identifiers.
// Everything links to the AMXUID.
// ═══════════════════════════════════════════════════════════════════════════════

export interface UniversalIdentity {
  amxUid: string;
  type: IdentityType;
  patientIdentifiers: PatientIdentifiers;
  clinicianIdentifiers: ClinicianIdentifiers;
  biometrics: BiometricRecord[];
  documents: IdentityDocument[];
  linkedIdentities: LinkedIdentity[];
  verifiedAt: number;
  verificationLevel: VerificationLevel;
  status: IdentityStatus;
  createdAt: number;
  updatedAt: number;
}

export enum IdentityType {
  Patient = 'patient',
  Clinician = 'clinician',
  Both = 'both',
}

export interface PatientIdentifiers {
  hospitalNumbers: HospitalNumber[];
  nationalId?: string;
  passport?: string;
  insuranceNumbers: InsuranceNumber[];
  birthCertificate?: string;
  alienId?: string;
  refugeeId?: string;
  socialHealthInsurance?: SocialHealthInsurance;
}

export interface ClinicianIdentifiers {
  professionalLicenses: ProfessionalLicense[];
  nationalId?: string;
  passport?: string;
  hospitalEmployeeId?: string;
  councilRegistrations: CouncilRegistration[];
}

export interface HospitalNumber {
  facilityId: string;
  number: string;
  isPrimary: boolean;
  issuedAt: number;
  facilityName: string;
}

export interface InsuranceNumber {
  provider: string;
  number: string;
  scheme: string;
  expiryDate: string;
  isPrimary: boolean;
  memberName: string;
  relationship: 'self' | 'spouse' | 'child' | 'dependent';
}

export interface SocialHealthInsurance {
  provider: string;
  number: string;
  status: 'active' | 'suspended' | 'expired';
  contributionCode?: string;
  employerName?: string;
  membershipType: 'primary' | 'registered' | 'civil_servant' | 'elderly' | 'poor' | 'informal';
  expiryDate: string;
}

export interface ProfessionalLicense {
  body: string;
  licenseNumber: string;
  category: string;
  issueDate: string;
  expiryDate: string;
  status: 'valid' | 'expired' | 'suspended' | 'revoked';
  verifiedAt?: number;
  country: string;
}

export interface CouncilRegistration {
  council: string;
  registrationNumber: string;
  category: string;
  issueDate: string;
  expiryDate: string;
  status: 'active' | 'inactive' | 'suspended';
}

export interface BiometricRecord {
  type: BiometricType;
  hash: string;
  enrolledAt: number;
  isActive: boolean;
  deviceId?: string;
}

export enum BiometricType {
  Fingerprint = 'fingerprint',
  Face = 'face',
  Iris = 'iris',
  Palm = 'palm',
  Voice = 'voice',
  DNA = 'dna',
  Signature = 'signature',
}

export interface IdentityDocument {
  type: DocumentType;
  documentNumber: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  country: string;
  scannedCopy?: string;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: number;
}

export enum DocumentType {
  NationalID = 'national_id',
  Passport = 'passport',
  DrivingLicense = 'driving_license',
  BirthCertificate = 'birth_certificate',
  NHIFCard = 'nhif_card',
  VoterCard = 'voter_card',
  RefugeeID = 'refugee_id',
  AlienCard = 'alien_card',
  EmployeeID = 'employee_id',
  StudentID = 'student_id',
  ProfessionalLicense = 'professional_license',
  CouncilCard = 'council_card',
  CertificateOfGoodConduct = 'certificate_of_good_conduct',
  MarriageCertificate = 'marriage_certificate',
  DeathCertificate = 'death_certificate',
  InsuranceCard = 'insurance_card',
  Other = 'other',
}

export interface LinkedIdentity {
  amxUid: string;
  relationship: string;
  verified: boolean;
  linkedAt: number;
}

export enum VerificationLevel {
  Unverified = 0,
  EmailVerified = 1,
  PhoneVerified = 2,
  DocumentUploaded = 3,
  DocumentVerified = 4,
  BiometricEnrolled = 5,
  BiometricVerified = 6,
  InPersonVerified = 7,
  FullyVerified = 8,
}

export enum IdentityStatus {
  Active = 'active',
  Inactive = 'inactive',
  Suspended = 'suspended',
  Deceased = 'deceased',
  Merged = 'merged',
  Duplicate = 'duplicate',
}

export interface IdentitySearchResult {
  amxUid: string;
  fullName: string;
  identifiers: {
    type: string;
    value: string;
  }[];
  matchScore: number;
  isExactMatch: boolean;
}

export interface MergeCandidates {
  primary: UniversalIdentity;
  duplicates: UniversalIdentity[];
  overlappingFields: string[];
  confidenceScore: number;
  autoMergeSafe: boolean;
}

export function getPrimaryHospitalNumber(identifiers: PatientIdentifiers): string | null {
  const primary = identifiers.hospitalNumbers.find(h => h.isPrimary);
  return primary?.number ?? identifiers.hospitalNumbers[0]?.number ?? null;
}

export function getPrimaryInsurance(identifiers: PatientIdentifiers): InsuranceNumber | null {
  return identifiers.insuranceNumbers.find(i => i.isPrimary) ?? identifiers.insuranceNumbers[0] ?? null;
}

export function getPrimaryLicense(identifiers: ClinicianIdentifiers): ProfessionalLicense | null {
  const valid = identifiers.professionalLicenses.find(l => l.status === 'valid');
  return valid ?? identifiers.professionalLicenses[0] ?? null;
}

export function isLicenseValid(license: ProfessionalLicense): boolean {
  if (license.status !== 'valid') return false;
  const expiry = new Date(license.expiryDate);
  return expiry > new Date();
}

export function getExpiredLicenses(identifiers: ClinicianIdentifiers): ProfessionalLicense[] {
  const now = new Date();
  return identifiers.professionalLicenses.filter(l => {
    if (l.status === 'expired') return true;
    if (l.status === 'suspended' || l.status === 'revoked') return true;
    const expiry = new Date(l.expiryDate);
    return expiry < now;
  });
}

export function mergeIdentities(primary: UniversalIdentity, duplicate: UniversalIdentity): UniversalIdentity {
  const merged: UniversalIdentity = {
    ...primary,
    patientIdentifiers: {
      hospitalNumbers: [...primary.patientIdentifiers.hospitalNumbers, ...duplicate.patientIdentifiers.hospitalNumbers],
      nationalId: primary.patientIdentifiers.nationalId || duplicate.patientIdentifiers.nationalId,
      passport: primary.patientIdentifiers.passport || duplicate.patientIdentifiers.passport,
      insuranceNumbers: [...primary.patientIdentifiers.insuranceNumbers, ...duplicate.patientIdentifiers.insuranceNumbers],
      socialHealthInsurance: primary.patientIdentifiers.socialHealthInsurance || duplicate.patientIdentifiers.socialHealthInsurance,
    },
    clinicianIdentifiers: {
      professionalLicenses: [...primary.clinicianIdentifiers.professionalLicenses, ...duplicate.clinicianIdentifiers.professionalLicenses],
      councilRegistrations: [...primary.clinicianIdentifiers.councilRegistrations, ...duplicate.clinicianIdentifiers.councilRegistrations],
      nationalId: primary.clinicianIdentifiers.nationalId || duplicate.clinicianIdentifiers.nationalId,
      hospitalEmployeeId: primary.clinicianIdentifiers.hospitalEmployeeId || duplicate.clinicianIdentifiers.hospitalEmployeeId,
    },
    documents: [...primary.documents, ...duplicate.documents],
    linkedIdentities: [...primary.linkedIdentities, ...duplicate.linkedIdentities],
    status: IdentityStatus.Merged,
    updatedAt: Date.now(),
  };
  return merged;
}

export function searchIdentity(query: string, identities: UniversalIdentity[]): IdentitySearchResult[] {
  const q = query.toLowerCase();
  return identities
    .filter(id => {
      const name = `person-${id.amxUid}`.toLowerCase();
      const idMatch = id.amxUid.toLowerCase().includes(q);
      const hospMatch = id.patientIdentifiers.hospitalNumbers.some(h => h.number.includes(q));
      const nationalMatch = id.patientIdentifiers.nationalId?.includes(q) || id.clinicianIdentifiers.nationalId?.includes(q);
      const insuranceMatch = id.patientIdentifiers.insuranceNumbers.some(i => i.number.includes(q));
      const licenseMatch = id.clinicianIdentifiers.professionalLicenses.some(l => l.licenseNumber.includes(q));
      return idMatch || hospMatch || nationalMatch || insuranceMatch || licenseMatch;
    })
    .map(id => ({
      amxUid: id.amxUid,
      fullName: `Person-${id.amxUid.substring(0, 8)}`,
      identifiers: [
        ...id.patientIdentifiers.hospitalNumbers.map(h => ({ type: 'hospital_number', value: h.number })),
        ...(id.patientIdentifiers.nationalId ? [{ type: 'national_id', value: id.patientIdentifiers.nationalId }] : []),
        ...(id.patientIdentifiers.passport ? [{ type: 'passport', value: id.patientIdentifiers.passport }] : []),
        ...id.patientIdentifiers.insuranceNumbers.map(i => ({ type: 'insurance', value: i.number })),
        ...id.clinicianIdentifiers.professionalLicenses.map(l => ({ type: 'license', value: l.licenseNumber })),
      ],
      matchScore: 1.0,
      isExactMatch: true,
    }));
}
