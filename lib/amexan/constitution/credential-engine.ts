import type { AmxUid, ProfessionalIdentity, Qualification } from './types';

export interface Credential {
  id: string;
  personId: AmxUid;
  type: 'license' | 'certificate' | 'degree' | 'training' | 'competency';
  name: string;
  issuingBody: string;
  issuedAt: number;
  expiresAt?: number;
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'expired';
  verifiedBy?: AmxUid;
  verifiedAt?: number;
  documentUrl?: string;
  notes?: string;
}

export function verifyLicense(professional: ProfessionalIdentity): { valid: boolean; reason?: string } {
  if (!professional.licenseNumber) return { valid: false, reason: 'No license number provided' };
  if (!professional.licenseExpiry) return { valid: true };
  if (Date.now() > professional.licenseExpiry) return { valid: false, reason: 'License has expired' };
  return { valid: true };
}

export function getExpiredCredentials(professionals: ProfessionalIdentity[]): ProfessionalIdentity[] {
  return professionals.filter(p => {
    if (!p.licenseExpiry) return false;
    return Date.now() > p.licenseExpiry;
  });
}

export function addCredential(
  personId: AmxUid,
  type: Credential['type'],
  name: string,
  issuingBody: string,
  options?: { expiresAt?: number; documentUrl?: string },
): Omit<Credential, 'id'> {
  return {
    personId,
    type,
    name,
    issuingBody,
    issuedAt: Date.now(),
    expiresAt: options?.expiresAt,
    verificationStatus: 'pending',
    documentUrl: options?.documentUrl,
  };
}

export function verifyCredential(credential: Omit<Credential, 'id'>, verifiedBy: AmxUid): Omit<Credential, 'id'> {
  return { ...credential, verificationStatus: 'verified', verifiedBy, verifiedAt: Date.now() };
}

export function rejectCredential(credential: Omit<Credential, 'id'>, reason: string): Omit<Credential, 'id'> {
  return { ...credential, verificationStatus: 'rejected', notes: reason };
}

export function checkCredentialExpiry(credential: Omit<Credential, 'id'>): Credential['verificationStatus'] {
  if (!credential.expiresAt) return credential.verificationStatus;
  return Date.now() > credential.expiresAt ? 'expired' : credential.verificationStatus;
}

export function getPendingVerifications(credentials: Omit<Credential, 'id'>[]): Omit<Credential, 'id'>[] {
  return credentials.filter(c => c.verificationStatus === 'pending');
}
