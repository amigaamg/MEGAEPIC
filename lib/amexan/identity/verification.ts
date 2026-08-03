import { VerificationLevel, type AmxUid } from './types'

const userVerification = new Map<AmxUid, { level: VerificationLevel; proofs: Record<string, any>[] }>()

export function getVerificationLevel(uid: AmxUid): VerificationLevel {
  return userVerification.get(uid)?.level ?? VerificationLevel.Anonymous
}

export async function upgradeVerificationLevel(uid: AmxUid, level: VerificationLevel, proof: Record<string, any>): Promise<boolean> {
  const current = userVerification.get(uid)
  if (current && current.level >= level) return false

  switch (level) {
    case VerificationLevel.EmailVerified: {
      if (!proof.email || !proof.code) return false
      break
    }
    case VerificationLevel.GovernmentIdVerified: {
      if (!proof.idType || !proof.idNumber || !proof.issuingCountry) return false
      break
    }
    case VerificationLevel.ProfessionalLicenseVerified: {
      if (!proof.licenseNumber || !proof.issuingBody || !proof.expiryDate) return false
      break
    }
    case VerificationLevel.InstitutionalVerified: {
      if (!proof.orgId || !proof.verifiedBy) return false
      break
    }
    case VerificationLevel.SystemTrust: {
      if (!proof.systemKey || !proof.authorizedBy) return false
      break
    }
  }

  userVerification.set(uid, {
    level,
    proofs: [...(current?.proofs ?? []), { level, ...proof, timestamp: Date.now() }],
  })
  return true
}

export function getVerificationProofs(uid: AmxUid): Record<string, any>[] {
  return userVerification.get(uid)?.proofs ?? []
}

export function requiresVerification(uid: AmxUid, minimumLevel: VerificationLevel): boolean {
  return (userVerification.get(uid)?.level ?? 0) >= minimumLevel
}

export function formatVerificationLevel(level: VerificationLevel): string {
  const labels: Record<VerificationLevel, string> = {
    [VerificationLevel.Anonymous]: 'Anonymous',
    [VerificationLevel.EmailVerified]: 'Email Verified',
    [VerificationLevel.GovernmentIdVerified]: 'Government ID Verified',
    [VerificationLevel.ProfessionalLicenseVerified]: 'Professional License Verified',
    [VerificationLevel.InstitutionalVerified]: 'Institution Verified',
    [VerificationLevel.SystemTrust]: 'System Trust',
  }
  return labels[level]
}

export function clearVerificationStore(): void {
  userVerification.clear()
}
