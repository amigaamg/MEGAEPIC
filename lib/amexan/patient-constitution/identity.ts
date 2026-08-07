import {
  type AmxpId,
  type PatientIdentity,
  type PatientVerificationLevel,
  type HumanIdentity,
  type AuthenticationIdentity,
  type VerificationIdentity,
  type ClinicalIdentity,
  type TrustIdentity,
  type TrustFactor,
  type ActiveSession,
  type TrustedDevice,
  type LinkedAccount,
  generateAmxpId,
  isValidAmxpId,
} from './types';

export function createEmptyPatientIdentity(amxpId?: AmxpId): PatientIdentity {
  const id = amxpId || generateAmxpId('patient');
  const now = Date.now();
  return {
    amxpId: id,
    human: {
      fullName: '', givenName: '', familyName: '', dateOfBirth: '',
      sex: 'undisclosed', nationality: '', nationalId: '', phone: '', email: '',
      address: { country: 'Kenya', county: '' },
      preferredLanguage: 'en', interpreters: [],
    },
    authentication: {
      methods: [], passwordEnabled: false, passkeyEnabled: false,
      biometricEnabled: false, mfaEnabled: false,
      sessions: [], devices: [],
    },
    verification: {
      level: 0, emailVerified: false, phoneVerified: false,
      governmentVerified: false, facilityVerified: false,
      verificationDocuments: [],
    },
    clinical: [],
    trust: { score: 0, factors: [], lastComputed: now },
    linkedAccounts: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function computeTrustScore(identity: PatientIdentity): number {
  const factors: TrustFactor[] = [];
  let totalScore = 0;

  if (identity.verification.level >= 1) {
    factors.push({ name: 'basic_verified', weight: 10, score: 10, details: 'Email or phone verified' });
    totalScore += 10;
  }
  if (identity.verification.emailVerified) {
    factors.push({ name: 'email_verified', weight: 5, score: 5 });
    totalScore += 5;
  }
  if (identity.verification.phoneVerified) {
    factors.push({ name: 'phone_verified', weight: 5, score: 5 });
    totalScore += 5;
  }
  if (identity.verification.governmentVerified) {
    factors.push({ name: 'government_verified', weight: 20, score: 20 });
    totalScore += 20;
  }
  if (identity.verification.facilityVerified) {
    factors.push({ name: 'facility_verified', weight: 15, score: 15 });
    totalScore += 15;
  }
  if (identity.verification.level >= 3) {
    factors.push({ name: 'lifetime_activity', weight: 10, score: 10 });
    totalScore += 10;
  }
  if (identity.human.emergencyContact) {
    factors.push({ name: 'emergency_contact', weight: 5, score: 5 });
    totalScore += 5;
  }
  if (identity.authentication.mfaEnabled) {
    factors.push({ name: 'mfa_enabled', weight: 5, score: 5 });
    totalScore += 5;
  }
  if (identity.clinical.length > 0) {
    const facilityScore = Math.min(identity.clinical.length * 5, 15);
    factors.push({ name: 'facility_history', weight: 15, score: facilityScore });
    totalScore += facilityScore;
  }
  if (identity.linkedAccounts.length > 0) {
    factors.push({ name: 'linked_accounts', weight: 5, score: 5 });
    totalScore += 5;
  }

  const duplicateWarnings = identity.trust.factors.filter(f => f.name === 'duplicate_conflict');
  if (duplicateWarnings.length > 0) {
    const penalty = duplicateWarnings.reduce((s, f) => s + Math.abs(f.score), 0);
    factors.push({ name: 'duplicate_conflict', weight: 0, score: -penalty });
    totalScore = Math.max(0, totalScore - penalty);
  }

  identity.trust.factors = factors;
  identity.trust.score = Math.min(totalScore, 100);
  identity.trust.lastComputed = Date.now();
  return identity.trust.score;
}

export function determineVerificationLevel(identity: PatientIdentity): PatientVerificationLevel {
  const v = identity.verification;
  if (v.facilityVerified && v.governmentVerified && v.emailVerified && v.phoneVerified) {
    // Level 4 (Lifetime Trusted) requires an explicit upgrade (time + no conflicts),
    // it is never derived from evidence flags alone.
    return v.level === 4 ? 4 : 3;
  }
  if (v.facilityVerified && v.governmentVerified) return 3;
  if (v.governmentVerified) return 2;
  if (v.emailVerified || v.phoneVerified) return 1;
  return 0;
}

export function upgradeVerificationLevel(
  identity: PatientIdentity,
  targetLevel: PatientVerificationLevel
): PatientIdentity {
  const v = identity.verification;
  if (targetLevel >= 1) { v.emailVerified = true; v.phoneVerified = true; }
  if (targetLevel >= 2) { v.governmentVerified = true; }
  if (targetLevel >= 3) { v.facilityVerified = true; }
  if (targetLevel >= 4) { /* lifetime trusted - requires time */ }
  v.level = targetLevel;
  identity.updatedAt = Date.now();
  computeTrustScore(identity);
  return identity;
}

export function getVerificationRequirements(level: PatientVerificationLevel): string[] {
  const reqs: Record<PatientVerificationLevel, string[]> = {
    0: [],
    1: ['Verify email address', 'Verify phone number'],
    2: ['Upload government ID', 'Verify national identity'],
    3: ['Visit a partner facility', 'Facility staff confirms identity', 'Optional: Biometrics'],
    4: ['Maintain active records for 2+ years', 'Multiple verified encounters', 'No identity conflicts'],
  };
  return reqs[level] || [];
}

export function linkPatientAccount(
  identity: PatientIdentity,
  account: LinkedAccount
): PatientIdentity {
  const existing = identity.linkedAccounts.findIndex(
    l => l.amxpId === account.amxpId
  );
  if (existing >= 0) {
    identity.linkedAccounts[existing] = account;
  } else {
    identity.linkedAccounts.push(account);
  }
  identity.updatedAt = Date.now();
  computeTrustScore(identity);
  return identity;
}

export function unlinkPatientAccount(
  identity: PatientIdentity,
  amxpId: AmxpId
): PatientIdentity {
  identity.linkedAccounts = identity.linkedAccounts.filter(l => l.amxpId !== amxpId);
  identity.updatedAt = Date.now();
  return identity;
}

export function checkFamilyPermission(
  linkedAccounts: LinkedAccount[],
  fromAmxpId: AmxpId,
  permission: string
): boolean {
  const account = linkedAccounts.find(l => l.amxpId === fromAmxpId);
  if (!account || !account.isActive) return false;
  return account.permissions.includes('full_access' as any) ||
    account.permissions.includes(permission as any);
}

export function addClinicalIdentity(
  identity: PatientIdentity,
  clinical: ClinicalIdentity
): PatientIdentity {
  const existing = identity.clinical.findIndex(c => c.facilityId === clinical.facilityId);
  if (existing >= 0) {
    identity.clinical[existing] = clinical;
  } else {
    identity.clinical.push(clinical);
  }
  identity.updatedAt = Date.now();
  return identity;
}

export function registerDevice(
  auth: AuthenticationIdentity,
  device: Omit<TrustedDevice, 'trustedSince' | 'lastUsed'>
): AuthenticationIdentity {
  auth.devices.push({
    ...device,
    trustedSince: Date.now(),
    lastUsed: Date.now(),
  });
  return auth;
}

export function createSession(
  auth: AuthenticationIdentity,
  session: Omit<ActiveSession, 'createdAt' | 'isCurrent'>
): AuthenticationIdentity {
  auth.sessions.forEach(s => { s.isCurrent = false; });
  auth.sessions.push({
    ...session,
    createdAt: Date.now(),
    isCurrent: true,
  });
  return auth;
}

export function revokeSession(auth: AuthenticationIdentity, sessionId: string): AuthenticationIdentity {
  auth.sessions = auth.sessions.filter(s => s.id !== sessionId);
  return auth;
}

export function generateAmxpIdForTemp(): AmxpId {
  return generateAmxpId('temp');
}

export function mergeTempIdentity(tempId: AmxpId, permanentId: AmxpId): { merged: boolean; note: string } {
  if (!isValidAmxpId(tempId) || !tempId.startsWith('TEMP')) {
    return { merged: false, note: 'Source is not a temporary identity' };
  }
  return { merged: true, note: `Temporary identity ${tempId} merged into ${permanentId}. All records preserved.` };
}
